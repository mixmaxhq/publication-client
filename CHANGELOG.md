## [2.1.0](https://github.com/mixmaxhq/publication-client/compare/v2.0.0...v2.1.0) (2019-12-14)


### Bug Fixes

* add ci script ([eaa18bd](https://github.com/mixmaxhq/publication-client/commit/eaa18bd5c91158fef4e793e072e7bf4b158d4609))
* fix import cases for case-sensitive filesystems ([a219811](https://github.com/mixmaxhq/publication-client/commit/a219811d2c8af45328a4fb2740349a58bd4220d0))
* ignore babelrc in build ([411662d](https://github.com/mixmaxhq/publication-client/commit/411662d8942289b9edd2591a9eef694ca3da91ca))

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
