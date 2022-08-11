'use strict';

import _ from 'underscore';
import EventEmitter from 'eventemitter3';

import LocalCollection from './localCollection';
import Primus from './primus';
import Subscription from './subscription';
import { Promise } from 'es6-promise';

/**
 * Return the initial title case of the string, for example:
 *
 *  - initialTitleCase('hello') === 'Hello'
 *  - initialTitleCase('hello there') === 'Hello there'
 *
 * @param {String} str The string to modify.
 * @returns {String} The modified string.
 */
function initialTitleCase(str) {
  return str[0].toUpperCase() + str.slice(1);
}

/**
 * A PublicationClient handles subscribing to a publication provider and
 * managing the collections created by any publication that is subscribed to.
 */
class PublicationClient extends EventEmitter {
  /**
   * Create a PublicationClient that connects to the publication provider at
   * the given url with the given options.
   *
   * @param {String} url The hostname of the publication provider as a URL.
   *    The provided protocol must be one of `https` or `http` (which
   *    correspond to the client using `wss` or `ws).
   * @param {Object} options Configuration options, these are passed through to
   *    Primus so see for all options, please see:
   *    https://github.com/primus/primus#connecting-from-the-browser.
   */
  constructor(url, options) {
    super();

    this._url = url;
    this._options = Object.assign({}, options);
    this._subscriptions = {};
    this._nextSubscriptionId = 0;
    this._collections = {};
    this._isConnected = false;

    // If we're told to be paranoid about connection monitoring, we'll set up
    // our parameters here.
    if (options.paranoid) {
      // The last time we saw any data come through this client. If it's been
      // too long, we'll proactively reconnect to make sure we're not just
      // leaving a dead connection sitting there.
      this._lastDataTimestamp = Date.now();

      // Default the timeout for the last time we received data to 120 seconds.
      this._lastDataTimeout = options.lastDataTimeout || 120 * 1000;

      // Delete paranoia options so we don't pass them on to Primus.
      delete options.paranoid;
      delete options.lastDataTimeout;
    }

    this._client = this._initializeClient(url, options);
    this._connect();
  }

  /**
   * Set up a new Primus client with all the necessary event listeners.
   *
   * @param {String} url The hostname of the publication provider as a URL.
   *    The provided protocol must be one of `https` or `http` (which
   *    correspond to the client using `wss` or `ws).
   * @param {Object} options Configuration options, these are passed through to
   *    Primus so see for all options, please see:
   *    https://github.com/primus/primus#connecting-from-the-browser.
   * @returns {Primus} The initialized Primus client object.
   */
  _initializeClient(url, options) {
    const client = new Primus(
      url,
      _.defaults(options, {
        strategy: ['online', 'disconnect'],
        reconnect: {
          min: 1000,
          max: Infinity,
          retries: 10,
          factor: 2,
        },
      })
    );

    client.on('data', (message) => {
      this._updateLastDataTimestamp();
      this._handleMessage(message);
    });

    // When we reconnect, we need to mark ourselves as not connected, and we
    // also need to re-subscribe to all of our publications.
    client.on('reconnected', () => {
      this._updateLastDataTimestamp();
      // Now that we're reconnected again, drop all local collections. We have
      // to do this because we don't know what updates we may have missed while
      // we've been disconnected (i.e. we could have missed `removed` events).
      // The reason that we drop the collections upon reconnection is that it
      // allows the local collections to be used/relied upon while we're
      // disconnected so that no consumers think we've suddenly dropped
      // everything the moment the connection drops. Also, instead of dropping
      // every collection, we use an private method to tell the collections to
      // drop all documents - this means pre-existing ReactiveQueries aren't
      // left dangling.
      this._resetCollectionsAndConnect();
    });

    // This event is purely a way for Primus to tell us that it's going to try
    // to reconnect.
    client.on('reconnect', () => {
      this._updateLastDataTimestamp();
      if (this._isConnected) this.emit('disconnected');
      this._isConnected = false;
    });

    return client;
  }

  /**
   * Refresh local collections, reconnect our websocket, and get our
   * subscriptions up to date.
   */
  _resetCollectionsAndConnect() {
    _.invoke(this._collections, '_clear');

    this._connect();
    _.each(this._subscriptions, (sub) => {
      sub._reset();
      sub._start();
      sub.emit('reconnected');
    });
  }

  /**
   * Update the timestamp of the last time we know we received data from the
   * server.
   */
  _updateLastDataTimestamp() {
    this._lastDataTimestamp = Date.now();
  }

  /**
   * Check whether we've received data in the timeout since the last data
   * timestamp. If not, proactively reconnect.
   *
   * @param {string} reason Why this reconnect request was triggered.
   */
  reconnectIfIdle(reason) {
    if (!this._lastDataTimeout) return; // Only run if in paranoid mode.
    clearTimeout(this._idleTimer);
    // If we haven't received any data since the last time we checked,
    // force a reconnect.
    if (Date.now() - this._lastDataTimestamp > this._lastDataTimeout) {
      this._client.end();
      this._client = this._initializeClient(this._url, this._options);
      this._resetCollectionsAndConnect();
      this.emit('proactivelyReconnected', reason);
    }

    // While we primarily rely on explicit calls to the reconnectIfIdle
    // method to ensure we're checking, we'll also add a timer-based
    // backup check so that a browser just sitting idle maintains its
    // connection.
    const boundReconnectFn = this.reconnectIfIdle.bind(this);
    this._idleTimer = setTimeout(() => {
      boundReconnectFn('Idle timeout');
    }, this._lastDataTimeout * 3);
  }

  /**
   * Handle the given message if it is of a known message type.
   * @param {Object} msg The message that we received from the publication
   *    provider.
   */
  _handleMessage(msg) {
    if (!msg || !msg.msg) return;

    switch (msg.msg) {
      case 'added':
      case 'changed':
      case 'removed':
        this[`_on${initialTitleCase(msg.msg)}`](msg);
        break;
      case 'connected':
        this._isConnected = true;
        this.emit('connected');
        break;
      case 'ready':
        this.emit('ready', msg);
        break;
      default:
        this.emit(msg.msg, msg);
        break;
    }
  }

  /**
   * Return a promise that will be resolved once the the publication provider
   * acknowledges to us that we are `connected`.
   *
   * @returns {Promise}
   */
  whenConnected() {
    return new Promise((resolve) => {
      if (this._isConnected) {
        resolve();
      } else {
        this.once('connected', resolve);
      }
    });
  }

  /**
   * Tell the publication provider that we would like to connect.
   */
  _connect() {
    this._client.write({
      msg: 'connect',
      version: '1',
    });
  }

  /**
   * Return the collection with the given name. If no such collection exists,
   * create one and return it.
   *
   * @param {String} name The name of the collection to return.
   * @param      {Object} [opts] Options to set on the collection if it's created.
   * @param      {bool}   [opts.supressRemovalWarnings]  If true, do not throw when we receive a
   *   removed event and there is no corresponding document. This is useful for situations where
   *   collections state is managed optimistically on the client rather than waiting for a server
   *   response (e.g. calling model.destroy() from a backbone model).
   * @returns {LocalCollection} The collection to return.
   */
  getCollection(name, options = {}) {
    var collection = this._collections[name];
    if (!collection) {
      collection = this._collections[name] = new LocalCollection(options);
    }
    return collection;
  }

  /**
   * Subscribe to the publication with the given name. Any other parameters
   * are passed as arguments to the publication.
   *
   * @param {String} name The publication to subscribe to.
   * @param {*[]} params (optional) Params to pass to the publication.
   * @returns {Subscription} The subscription to the desired publication.
   */
  subscribe(name, ...params) {
    const id = this._nextSubscriptionId++;

    // Hash the name and params to cache the subscription.
    const subscriptionKey = JSON.stringify(_.toArray(arguments));
    let subscription = this._subscriptions[subscriptionKey];
    if (!subscription) {
      subscription = this._subscriptions[subscriptionKey] = new Subscription(
        String(id),
        name,
        params,
        this
      );
    }
    return subscription;
  }

  /**
   * Subscribe to the publication with the given name. Any other parameters
   * are passed as arguments to the publication.
   *
   * @param {String} name The publication to subscribe to.
   * @param {Object} options containing optional parameters such as bootstrap and/or
   * bootstrapAsync.
   * @param {*[]} params (optional) Params to pass to the publication.
   * @returns {Subscription} The subscription to the desired publication.
   */
  subscribeWithOptions(name, options, ...params) {
    const id = this._nextSubscriptionId++;
    const payload = [...params, options];

    // Hash the name and params to cache the subscription including payload extended with options.
    const subscriptionKey = JSON.stringify([name].concat(payload));
    let subscription = this._subscriptions[subscriptionKey];
    if (!subscription) {
      subscription = this._subscriptions[subscriptionKey] = new Subscription(
        String(id),
        name,
        payload,
        this
      );
    }
    return subscription;
  }

  /**
   * Send the given message to the publication provider.
   *
   * @param {Object} msg The message to send to the publication provider.
   */
  _send(msg) {
    this._client.write(msg);
  }

  /**
   * Remove the subscription from the current session. This is called
   * internally when a subscription is `stop()`ped.
   *
   * @param {String} subKey The subscription key that is unique to the
   *    subscription (generated from the name and parameters).
   */
  _removeSubscription(subKey) {
    delete this._subscriptions[subKey];
  }

  /**
   * Return a subscription from the current session by the subscription id provided.
   *
   * @param {String} id The subscription id.
   * @returns {Subscription} The subscription with the given id.
   */
  getSubscriptionById(id) {
    for (const subscriptionKey in this._subscriptions) {
      if (this._subscriptions[subscriptionKey]._id === id) {
        return this._subscriptions[subscriptionKey];
      }
    }
    return null;
  }

  /**
   * Add the document with the given ID and fields to the given collection
   * (all defined inside the message).
   *
   * @param {Object} message The message containing the document to add and the
   *    collection to add it to.
   */
  _onAdded(message) {
    var collectionName = message.collection;
    var id = message.id;
    var fields = message.fields;

    var collection = this.getCollection(collectionName);
    collection._onAdded(id, fields);
  }

  /**
   * Change the document with the given ID in the given collection (all
   * defined inside the message).
   *
   * @param {Object} message The message containing the document to change and
   *    the collection that it exists inside of.
   */
  _onChanged(message) {
    var collectionName = message.collection;
    var id = message.id;
    var fields = message.fields;
    var cleared = message.cleared;

    var collection = this.getCollection(collectionName);
    collection._onChanged(id, fields, cleared);
  }

  /**
   * Remove the document with the given ID from the given collection (all
   * defined inside the message).
   *
   * @param {Object} message The message containing the document to remove and
   *    the collection to remove it from.
   */
  _onRemoved(message) {
    var collectionName = message.collection;
    var id = message.id;

    var collection = this.getCollection(collectionName);
    collection._onRemoved(id);
  }

  /**
   * Return true if the client is currently connected to the server, false if
   * it is not.
   *
   * @returns {Boolean} Whether the client is connected to the server or not.
   */
  get isConnected() {
    return this._isConnected;
  }

  /**
   * Allow the user to close the connection.
   */
  stop() {
    this._client.end();
  }
}

export default PublicationClient;
