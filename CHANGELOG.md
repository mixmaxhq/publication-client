## Release History

* 2.0.0 *Breaking* Upgrade primus to 7.3.3. This changes the `ping` and `pong` attributes when passing options to the primus client to one `pingTimeout` option.

* 1.4.11 Allow stopping a subscription before its 'ready' event is received

* 1.4.10 Fix README, correct for accidental 1.4.9 publish

* 1.4.9 deyarn

* 1.4.8 Add ES6 `Promise` polyfill

* 1.4.7 Use `lodash.cloneDeep` to ensure that we don't emit direct object references during event emission.

* 1.4.6 Prevent `Subscription#whenReady` from resolving prematurely after the websocket connects; implement `PublicationClient#whenConnected`

* 1.4.5 `err._publicationName` -> `err.publicationName`

* 1.4.4 Add the publication name to the error we emit on subscription errors.

* 1.4.3 Delete subscription references when we unsubscribe from a publication.

* 1.4.2 Fix typo with unsubscribe message.

* 1.4.0 Handle custom event broadcasting (for shutdown message specifically).

* 1.2.1 Enforce message ordering.

* 1.1.0 Alter how we wrap the authentication function and make it required.

* 1.0.0 Initial release
