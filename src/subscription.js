'use strict';

import _ from 'underscore';
import EventEmitter from 'eventemitter3';

import { Promise } from 'es6-promise';

/**
 * A Subscription encapsulates the logic of subscribing to server side
 * publications and letting any callers know when the subscription to that
 * publication is `ready` (has returned its initial state).
 *
 */
class Subscription extends EventEmitter {
  /**
   * Creates a new subscription with the given ID to the publication
   * defined my the given name and provided the given parameters.
   *
   * @param {String} id The ID for the subscription. This is arbitrary and has
   *    no meaning as far as the publication is concerned, it exists purely for
   *    the client to be able to uniquely identify the subscription.
   * @param {String} name The name of the publication to subscribe to.
   * @param {*[]} params (optional) Parameters to provide to the publication.
   * @param {Object} conn The connection to the publication provider.
   */
  constructor(id, name, params, conn) {
    super();

    this._id = id;
    this._connection = conn;
    this._name = name;
    this._params = params;

    this._boundOnReady = this._onReady.bind(this);
    this._boundOnNoSub = this._onNoSub.bind(this);
    this._boundOnNoSubPostInit = this._onNoSubPostInitialization.bind(this);
    this._boundWhenReadyResolver = this._whenReadyResolver.bind(this);
    this._boundWhenReadyRejecter = this._whenReadyRejecter.bind(this);

    this._whenReadyResolveFn = null;
    this._whenReadyRejectFn = null;

    this._reset();
    this._start();
  }

  /**
   * Prepare to start the subscription. May be called after starting the subscription without
   * having stopped the subscription using `stop`. This is useful if the connection was disconnected
   * and we are reconnecting.
   *
   * It's important not to reset `_whenReadyResolveFn` and `_whenReadyRejectFn` functions here, as
   * we may have a pending `whenReady` called before the connection comes back. If we reset them,
   * then `whenReady` won't resolve.
   *
   * E.g. we load a page and remove spinner when subscription is ready. If connection was lost,
   * but then came back, we still want to process `ready` event and remove spinner.
   * If we clear handlers here, `null` will be called and spinner will be left.
   */
  _reset() {
    this._isReady = false;
    this._isFailed = false;
    this._initializationError = null;
    this._isStopped = false;
  }

  /**
   * Starts a subscription (sends the initial `sub` message) only once the
   * connection is ready.
   *
   * `_reset` must be called first.
   */
  _start() {
    // If we hit this, someone forgot to call `_reset`.
    if (this._isReady) throw new Error(`Subscription ${this._id} is already started.`);

    if (this._connection._isConnected) {
      this._sendSubMsg();
    } else {
      this._connection.once('connected', () => {
        this._sendSubMsg();
      });
    }
  }

  /**
   * Sends the `sub` message to the publication-server and begins listening
   * for the publication-server to tell us that our subscription is `ready`.
   */
  _sendSubMsg() {
    this._connection._send({
      msg: 'sub',
      id: this._id,
      name: this._name,
      params: this._params,
    });
    this._connection.on('ready', this._boundOnReady);
    this._connection.on('nosub', this._boundOnNoSub);
  }

  /**
   * Stops the subscription by unsubscribing from the publication provider.
   */
  stop() {
    if (this._isStopped) return;
    this._isStopped = true;

    // Stop listening for events from the connection.
    this._connection.removeListener('ready', this._boundOnReady);
    this._connection.removeListener('nosub', this._boundOnNoSub);

    // Stop listening for events potentially set up by `whenReady`.
    this.removeListener('ready', this._boundWhenReadyResolver);
    this.removeListener('nosub', this._boundWhenReadyRejecter);

    // Reset ready functions, we unsubscribe from `ready` and `nosub` events
    this._whenReadyResolveFn = null;
    this._whenReadyRejectFn = null;

    this._connection._send({
      msg: 'unsub',
      id: this._id,
    });
    this._connection._removeSubscription(JSON.stringify([this._name].concat(this._params)));
  }

  /**
   * Returns a promise that resolves when the publication has indicated that it
   * has finished sending its initial state and is `ready`.
   *
   * @returns {Promise} A promise indicating whether the subscription is ready
   *    to be used.
   */
  whenReady() {
    return new Promise((resolve, reject) => {
      if (this._isFailed) {
        // We automatically reject if we failed to initialize the subscription.
        reject(this._initializationError);
      } else if (this._isReady) {
        // If the subscription did become `ready`, regardless of if we later
        // received an error, still automatically mark the subscription as
        // ready since it originally was.
        resolve();
      } else if (this._isStopped) {
        // `stop()` was called before the subscription was ready.
        reject(new Error('Subscription is already stopped'));
      } else {
        this._whenReadyResolveFn = resolve;
        this._whenReadyRejectFn = reject;
        this.once('ready', this._boundWhenReadyResolver);
        this.once('nosub', this._boundWhenReadyRejecter);
      }
    });
  }

  /**
   * Named function to resolve the whenReady promise and clean up the nosub listener.
   */
  _whenReadyResolver() {
    this.removeListener('nosub', this._boundWhenReadyRejecter);
    this._whenReadyResolveFn();
  }

  /**
   * Named function to reject the whenReady promise and clean up the ready listener.
   */
  _whenReadyRejecter(err) {
    this.removeListener('ready', this._boundWhenReadyResolver);
    this._whenReadyRejectFn(err);
  }

  /**
   * Marks the subscription as ready and removes the `ready` message listener.
   * @param {Object} msg A message from the publication provider.
   */
  _onReady(msg) {
    const readySubs = msg.subs;
    if (!_.contains(readySubs, this._id)) return;

    this._isReady = true;
    this.emit('ready');

    this._updateListenersForPostSetup();
  }

  /**
   * Marks the subscription as non-existent or failed and removes any local
   * listeners.
   *
   * @param {Object} msg A message from the publication provider.
   */
  _onNoSub(msg) {
    if (msg.id !== this._id) return;

    this._isFailed = true;
    const err = this._extractErr(msg.error);
    this._initializationError = err;
    this.emit('nosub', err);

    this._updateListenersForPostSetup();
  }

  /**
   * Remove the initial listeners for `ready` and `nosub`, and add a listener
   * for post-setup `nosub` errors.
   */
  _updateListenersForPostSetup() {
    this._connection.removeListener('ready', this._boundOnReady);
    this._connection.removeListener('nosub', this._boundOnNoSub);

    this._connection.on('nosub', this._boundOnNoSubPostInit);
  }

  /**
   * Emits the error that the `nosub` message contained, if the`nosub`
   * message was for this subscription.
   *
   * @param {Object} msg The received `nosub` message.
   */
  _onNoSubPostInitialization(msg) {
    if (msg.id !== this._id) return;

    this.emit('nosub', this._extractErr(msg.error));
  }

  /**
   * If the error was simply that the subscription wasn't found, the `err`
   * will simple be `sub-not-found`. However, if the error was an error
   * that occurred during subscription initialization, `err` will be an
   * object with the top level error message as a field on the object under
   * the key `error`.
   *
   * @param {String|Object} err The error returned in a `nosub` message.
   * @returns {Error} An error object wrapping the returned error.
   */
  _extractErr(err) {
    if (_.isObject(err)) err = err.error;

    const e = new Error(err);
    e.publicationName = this._name; // Attach the publication name for reporting.
    return e;
  }
}

export default Subscription;
