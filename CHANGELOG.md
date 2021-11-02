## [3.2.0](https://github.com/mixmaxhq/publication-client/compare/v3.1.1...v3.2.0) (2021-11-02)


### Features

* update changes with v2.x ([7250fc8](https://github.com/mixmaxhq/publication-client/commit/7250fc80962093d3a33de6c4c4c1b47d2104a637))


### Bug Fixes

* push lockfile ([db43641](https://github.com/mixmaxhq/publication-client/commit/db43641777cc2a3dd34d79978cf8262c8f164670))

### [3.1.1](https://github.com/mixmaxhq/publication-client/compare/v3.1.0...v3.1.1) (2021-04-23)


### Bug Fixes

* emit event on removal regardless ([987afd3](https://github.com/mixmaxhq/publication-client/commit/987afd312ca9ed6caa3e7ad4285e71c78ecff68d))

## [3.1.0](https://github.com/mixmaxhq/publication-client/compare/v3.0.0...v3.1.0) (2021-04-08)


### Features

* adding support for publications options ([99d9822](https://github.com/mixmaxhq/publication-client/commit/99d982287fd4ee0dc4495d453663a5fc942d08fd))

## [3.0.0](https://github.com/mixmaxhq/publication-client/compare/v2.5.0...v3.0.0) (2021-01-15)


### ⚠ BREAKING CHANGES

* we now require a publication-server version
of version 2 or higher.
* require publication-client@>v2

### Features

* add req on publication-server version ([eef6fbd](https://github.com/mixmaxhq/publication-client/commit/eef6fbdb87a0799262eb9608f3f36674f093f554))


* Merge pull request #18 from mixmaxhq/trey/fix-release ([40b50c4](https://github.com/mixmaxhq/publication-client/commit/40b50c4b571277f7c2e42a3981e2aa8dd8b3375d)), closes [#18](https://github.com/mixmaxhq/publication-client/issues/18)

## [2.5.0](https://github.com/mixmaxhq/publication-client/compare/v2.4.2...v2.5.0) (2021-01-15)


### Features

* add updated primus client code for primus 8 upgrades ([5a1e101](https://github.com/mixmaxhq/publication-client/commit/5a1e10192ff7b68b2950b2718bf075f4985ff51a))

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
