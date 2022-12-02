/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'

import { Route } from '../../src/router/route.js'
import { AppFactory } from '../../test_factories/app.js'
import { MiddlewareStore } from '../../src/middleware/store.js'
import { LookupStore } from '../../src/router/lookup_store/main.js'
import { EncryptionFactory } from '../../test_factories/encryption.js'
import { RequestFactory } from '../../test_factories/request.js'

test.group('URL builder', () => {
  test('create url for a route', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()
    const middlewareStore = new MiddlewareStore([], {})
    const lookupStore = new LookupStore(encryption)

    const route = new Route(app, middlewareStore, {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: () => {},
      methods: ['GET'],
    })

    lookupStore.register(route.toJSON())
    assert.equal(lookupStore.builder().params([1]).make('/users/:id'), '/users/1')
  })

  test('create url for a route by its name', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()
    const middlewareStore = new MiddlewareStore([], {})
    const lookupStore = new LookupStore(encryption)

    const route = new Route(app, middlewareStore, {
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
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()
    const middlewareStore = new MiddlewareStore([], {})
    const lookupStore = new LookupStore(encryption)

    const route = new Route(app, middlewareStore, {
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
    const lookupStore = new LookupStore(encryption)

    assert.throws(
      () => lookupStore.builder().make('/users/:id'),
      'Cannot lookup route "/users/:id"'
    )
  })

  test('create url without performing route lookup', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.equal(
      lookupStore.builder().params([1]).disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('define params as an object', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.equal(
      lookupStore.builder().params({ id: 1 }).disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('do not overwriting existing params when undefined params are shared', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.equal(
      lookupStore.builder().params({ id: 1 }).params().disableRouteLookup().make('/users/:id'),
      '/users/1'
    )
  })

  test('raise error when one or params are missing', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.throws(
      () => lookupStore.builder().disableRouteLookup().make('/users/:id'),
      'Cannot make URL for "/users/:id" route. Missing value for "id" param'
    )
  })

  test('allow missing params when param is optional', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.equal(lookupStore.builder().disableRouteLookup().make('/users/:id?'), '/users')
  })

  test('make route with wildcard params', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.equal(
      lookupStore.builder().disableRouteLookup().params([1, 2, 3]).make('/users/*'),
      '/users/1/2/3'
    )
  })

  test('define wildcard param is an object', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

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
    const lookupStore = new LookupStore(encryption)

    assert.throws(
      () => lookupStore.builder().disableRouteLookup().params([]).make('/users/*'),
      'Cannot make URL for "/users/*" route. Invalid value provided for wildcard param'
    )
  })

  test('prefix url', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.equal(
      lookupStore.builder().disableRouteLookup().prefixUrl('https://adonisjs.com').make('/users'),
      'https://adonisjs.com/users'
    )
  })

  test('define query string with arrays', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

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
    const lookupStore = new LookupStore(encryption)

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
    const lookupStore = new LookupStore(encryption)

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
})
