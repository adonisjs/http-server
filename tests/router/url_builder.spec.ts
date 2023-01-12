/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { AppFactory } from '@adonisjs/application/test_factories/app'
import { EncryptionFactory } from '@adonisjs/encryption/test_factories/encryption'

import { Route } from '../../src/router/route.js'
import { RequestFactory } from '../../test_factories/request.js'
import { LookupStore } from '../../src/router/lookup_store/main.js'
import { QsParserFactory } from '../../test_factories/qs_parser_factory.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('URL builder', () => {
  test('create url for a route', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    const route = new Route(app, [], {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: () => {},
      methods: ['GET'],
    })

    lookupStore.register(route.toJSON())
    assert.equal(lookupStore.builder().params([1]).make('/users/:id'), '/users/1')
  })

  test('create url for a route by its name', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    const route = new Route(app, [], {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: () => {},
      methods: ['GET'],
    })
    route.as('users.show')

    lookupStore.register(route.toJSON())
    assert.equal(lookupStore.builder().params([1]).make('users.show'), '/users/1')
  })

  test('create url for a route by the handler name', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    const route = new Route(app, [], {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: '#controllers/posts',
      methods: ['GET'],
    })

    lookupStore.register(route.toJSON())
    assert.equal(lookupStore.builder().params([1]).make('#controllers/posts'), '/users/1')
  })

  test('raise error when unable to lookup route', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.throws(
      () => lookupStore.builder().make('/users/:id'),
      'Cannot lookup route "/users/:id"'
    )
  })

  test('create url without performing route lookup', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore.builder().params([1]).disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('define params as an object', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore.builder().params({ id: 1 }).disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('do not overwrite existing params when undefined params are shared', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore.builder().params({ id: 1 }).params().disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('raise error when one or params are missing', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.throws(
      () => lookupStore.builder().disableRouteLookup().make('/users/:id'),
      'Cannot make URL for "/users/:id" route. Missing value for "id" param'
    )
  })

  test('allow missing params when param is optional', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(lookupStore.builder().disableRouteLookup().make('/users/:id?'), '/users')
  })

  test('make route with wildcard params', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore.builder().disableRouteLookup().params([1, 2, 3]).make('/users/*'),
      '/users/1/2/3'
    )
  })

  test('define wildcard param as an object', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore
        .builder()
        .disableRouteLookup()
        .params({
          '*': [1, 2, 3],
        })
        .make('/users/*'),
      '/users/1/2/3'
    )
  })

  test('raise error when wildcard params are missing', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.throws(
      () => lookupStore.builder().disableRouteLookup().params([]).make('/users/*'),
      'Cannot make URL for "/users/*" route. Invalid value provided for wildcard param'
    )
  })

  test('prefix url', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore.builder().disableRouteLookup().prefixUrl('https://adonisjs.com').make('/users'),
      'https://adonisjs.com/users'
    )
  })

  test('define query string with arrays', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    assert.equal(
      lookupStore
        .builder()
        .disableRouteLookup()
        .qs({
          sort: 'id',
          fields: ['username', 'email'],
        })
        .make('/users'),
      '/users?sort=id&fields%5B0%5D=username&fields%5B1%5D=email'
    )
  })

  test('create and verify signed URLs', async ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    const signedUrl = lookupStore.builder().disableRouteLookup().makeSigned('/users')

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedUrl,
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    const signedUrl = lookupStore
      .builder()
      .disableRouteLookup()
      .qs({
        sort: 'id',
        fields: ['username', 'email'],
      })
      .makeSigned('/users')

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedUrl,
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('build route with params and extension', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption, new QsParserFactory().create())

    const route = new Route(app, [], {
      pattern: '/users/:slug.html',
      globalMatchers: {},
      handler: () => {},
      methods: ['GET'],
    })
    route.as('users.show')

    lookupStore.register(route.toJSON())
    assert.equal(
      lookupStore.builder().params({ slug: 'foo' }).make('users.show'),
      '/users/foo.html'
    )
  })
})
