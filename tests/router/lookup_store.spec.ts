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

test.group('Lookup store | find', () => {
  test('find a route by route pattern', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)
    const middlewareStore = new MiddlewareStore([], {})

    const route = new Route(app, middlewareStore, {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: () => {},
      methods: ['GET'],
    })

    lookupStore.register(route.toJSON())
    assert.containsSubset(lookupStore.find('/users/:id'), {
      pattern: '/users/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      name: undefined,
    })
  })

  test('find a route by route name', ({ assert }) => {
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
    assert.containsSubset(lookupStore.find('users.show'), {
      pattern: '/users/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      name: 'users.show',
    })
  })

  test('find a route by route controller name', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()
    const middlewareStore = new MiddlewareStore([], {})
    const lookupStore = new LookupStore(encryption)

    const route = new Route(app, middlewareStore, {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: '#controllers/users',
      methods: ['GET'],
    })

    lookupStore.register(route.toJSON())
    assert.containsSubset(lookupStore.find('#controllers/users'), {
      pattern: '/users/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      name: undefined,
    })
  })

  test('return null when unable to find route', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.isNull(lookupStore.find('/users/:id'))
  })

  test('do not match route handler name when it is defined as function', ({ assert }) => {
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

    assert.isNull(lookupStore.find('#controllers/posts.show'))
  })
})

test.group('Lookup store | findByOrFail', () => {
  test('find a route by route pattern', ({ assert }) => {
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
    assert.containsSubset(lookupStore.findOrFail('/users/:id'), {
      pattern: '/users/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      name: undefined,
    })
  })

  test('find a route by route name', ({ assert }) => {
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
    assert.containsSubset(lookupStore.findOrFail('users.show'), {
      pattern: '/users/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      name: 'users.show',
    })
  })

  test('find a route by route controller name', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()
    const middlewareStore = new MiddlewareStore([], {})
    const lookupStore = new LookupStore(encryption)

    const route = new Route(app, middlewareStore, {
      pattern: '/users/:id',
      globalMatchers: {},
      handler: '#controllers/users',
      methods: ['GET'],
    })

    lookupStore.register(route.toJSON())
    assert.containsSubset(lookupStore.findOrFail('#controllers/users'), {
      pattern: '/users/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      name: undefined,
    })
  })

  test('raise error when unable to lookup route', ({ assert }) => {
    const encryption = new EncryptionFactory().create()
    const lookupStore = new LookupStore(encryption)

    assert.throws(() => lookupStore.findOrFail('/users/:id'), 'Cannot lookup route "/users/:id"')
  })
})

test.group('Lookup store | has', () => {
  test('check if a route exists', ({ assert }) => {
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

    assert.isFalse(lookupStore.has('/users/:id'))
    lookupStore.register(route.toJSON())
    assert.isTrue(lookupStore.has('/users/:id'))
  })
})
