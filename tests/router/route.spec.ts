/**
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Application } from '@adonisjs/application'

import { Route } from '../../src/router/route.js'
import { MiddlewareStore } from '../../src/middleware/store.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Route', () => {
  test('create a route instance', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    assert.deepEqual(route.toJSON(), {
      pattern: '/',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('prefix route', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.prefix('admin')

    assert.deepEqual(route.toJSON(), {
      pattern: '/admin',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('apply multiple prefixes in reverse order', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.prefix('admin')
    route.prefix('v1')

    assert.deepEqual(route.toJSON(), {
      pattern: '/v1/admin',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('handle leading slash in pattern', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: '/blog',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    assert.deepEqual(route.toJSON(), {
      pattern: '/blog',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('handle leading slash in pattern along with prefix', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: '/blog',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.prefix('admin')

    assert.deepEqual(route.toJSON(), {
      pattern: '/admin/blog',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define matcher for param as a string', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.where('id', '^[a-z]+$')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define matcher for param as a regular expression', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.where('id', /^[a-z]+$/)

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define match and cast methods for a param', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const matcher = {
      match: /^[a-z]+$/,
      cast: (id: string) => Number(id),
    }

    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.where('id', matcher)

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: matcher,
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('do not overwrite existing params', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.where('id', '^[a-z]+$')
    route.where('id', '^[0-9]+$')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define global matchers for params', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {
        id: { match: /^[a-z]+$/ },
      },
    })

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('give preference to local matcher over global', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {
        id: { match: /^[a-z]+$/ },
      },
    })

    route.where('id', '(.*)')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /(.*)/ },
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define route domain', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.domain('foo.com')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'foo.com',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('do not overwrite route domain unless explicitly stated', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.domain('foo.com')
    route.domain('bar.com')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'foo.com',
      handler,
      name: undefined,
      middleware: [],
    })

    route.domain('bar.com', true)

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'bar.com',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define a function as a route middleware', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const middlewareFn = () => {}
    route.middleware(middlewareFn)

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [middlewareFn],
    })
  })

  test('define a named middleware by reference', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const namedMiddleware = {
      // @ts-expect-error
      auth: () => import('#middleware/auth'),
    }

    const middlewareStore = new MiddlewareStore([], namedMiddleware)

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware('auth', [])
    const middleware = route.toJSON().middleware

    assert.isArray(middleware)
    assert.lengthOf(middleware, 1)
    assert.isFunction((middleware[0] as any).handle)
    assert.containsSubset(middleware[0], { name: 'auth', args: [] })
  })

  test('give name to the route', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.as('showPost')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      middleware: [],
      name: 'showPost',
    })
  })

  test('prefix to the route name', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.as('showPost')
    route.as('posts', true)

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      middleware: [],
      name: 'posts.showPost',
    })
  })

  test('throw error when prefix without an existing name', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    assert.throws(
      () => route.as('posts', true),
      'Routes inside a group must have names before calling "router.group.as"'
    )
  })

  test('update route pattern', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    const route = new Route(app, middlewareStore, {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.setPattern('articles/:id')
    assert.equal(route.getPattern(), 'articles/:id')
    assert.deepEqual(route.toJSON(), {
      pattern: '/articles/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      middleware: [],
      name: undefined,
    })
  })
})
