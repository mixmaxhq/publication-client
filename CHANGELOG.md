### [2.6.0](https://github.com/mixmaxhq/publication-client/compare/v2.4.3...v2.6.0) (2021-04-15)


### Features

* adding support for publications options through subscribeWithOptions method ([ee73715](https://github.com/mixmaxhq/publication-client/commit/ee737151a16704e1a197509875b2c6ab2f87b8a4))

### [2.4.2](https://github.com/mixmaxhq/publication-client/compare/v2.4.1...v2.4.2) (2020-10-06)


### Bug Fixes

* make reconnection less aggressive ([0ac50de](https://github.com/mixmaxhq/publication-client/commit/0ac50de51de47dd74db52382d4077c72a736a889))

### [2.4.1](https://github.com/mixmaxhq/publication-client/compare/v2.4.0...v2.4.1) (2020-04-13)


### Bug Fixes

* emit reconnected event on _resetCollectionsAndConnect ([1df914c](https://github.com/mixmaxhq/publication-client/commit/1df914cade667c03eb300a02d6c96e3aa31a0d8c))

## [2.4.0](https://github.com/mixmaxhq/publication-client/compare/v2.3.0...v2.4.0) (2020-03-31)


### Features

* enable reconnecting when paranoid mode is requested ([951aea9](https://github.com/mixmaxhq/publication-client/commit/951aea98f9b9a05f8e444d4273e7f2cf6db4c423))

## [2.3.0](https://github.com/mixmaxhq/publication-client/compare/v2.2.0...v2.3.0) (2020-03-17)


### Features

* add paranoid mode to monitor and reconnect ([0702b31](https://github.com/mixmaxhq/publication-client/commit/0702b31572ecd48f9ecf311bb704f8ecf69733d1))
* emit event when proactively reconnected ([ca8c63c](https://github.com/mixmaxhq/publication-client/commit/ca8c63c2c77fd7e22171f2efe843bed9a84411b3))


### Bug Fixes

* temporarily disable reconnecting while we track stats ([e265d1c](https://github.com/mixmaxhq/publication-client/commit/e265d1c4170763d382770d70ae3a01d1fa09fb8e))

## [2.2.0](https://github.com/mixmaxhq/publication-client/compare/v2.1.0...v2.2.0) (2020-03-10)


### Features

* **localcollection:** allow supressing removal warnings ([be76564](https://github.com/mixmaxhq/publication-client/commit/be765644d0ceea89d114dd9933a545581b05f1de))

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
