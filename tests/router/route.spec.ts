/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { defineNamedMiddleware } from '../../src/define_middleware.js'

import { Route } from '../../src/router/route.js'
import { AppFactory } from '../../test_factories/app.js'

test.group('Route', () => {
  test('create a route instance', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    assert.containsSubset(route.toJSON(), {
      pattern: '/',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('prefix route', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.prefix('admin')

    assert.containsSubset(route.toJSON(), {
      pattern: '/admin',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('apply multiple prefixes in reverse order', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.prefix('admin')
    route.prefix('v1')

    assert.containsSubset(route.toJSON(), {
      pattern: '/v1/admin',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('handle leading slash in pattern', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: '/blog',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    assert.containsSubset(route.toJSON(), {
      pattern: '/blog',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('handle leading slash in pattern along with prefix', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: '/blog',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.prefix('admin')

    assert.containsSubset(route.toJSON(), {
      pattern: '/admin/blog',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('define matcher for param as a string', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.where('id', '^[a-z]+$')

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('define matcher for param as a regular expression', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.where('id', /^[a-z]+$/)

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('define match and cast methods for a param', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const matcher = {
      match: /^[a-z]+$/,
      cast: (id: string) => Number(id),
    }

    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.where('id', matcher)

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: matcher,
      },
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('do not overwrite existing params', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.where('id', '^[a-z]+$')
    route.where('id', '^[0-9]+$')

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('define global matchers for params', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {
        id: { match: /^[a-z]+$/ },
      },
    })

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /^[a-z]+$/ },
      },
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('give preference to local matcher over global', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {
        id: { match: /^[a-z]+$/ },
      },
    })

    route.where('id', '(.*)')

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {
        id: { match: /(.*)/ },
      },
      domain: 'root',
      handler,
      name: undefined,
    })
  })

  test('define route domain', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.domain('foo.com')

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'foo.com',
      handler,
      name: undefined,
    })
  })

  test('do not overwrite route domain unless explicitly stated', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.domain('foo.com')
    route.domain('bar.com')

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'foo.com',
      handler,
      name: undefined,
    })

    route.domain('bar.com', true)

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'bar.com',
      handler,
      name: undefined,
    })
  })

  test('use function as a route middleware', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const middlewareFn = () => {}
    route.middleware(middlewareFn)

    const routeJSON = route.toJSON()

    assert.containsSubset(routeJSON, {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })

    assert.deepEqual(routeJSON.middleware.all(), new Set([middlewareFn]))
  })

  test('use multiple middleware', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const middlewareFn = () => {}
    const middlewareFn1 = () => {}
    route.middleware([middlewareFn, middlewareFn1])

    const routeJSON = route.toJSON()

    assert.containsSubset(routeJSON, {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })

    assert.deepEqual(routeJSON.middleware.all(), new Set([middlewareFn, middlewareFn1]))
  })

  test('define a named middleware by reference', ({ assert }) => {
    const app = new AppFactory().create()

    class AuthMiddleware {
      handle() {}
    }

    const namedMiddleware = defineNamedMiddleware({
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware(namedMiddleware.auth())
    const middleware = [...route.toJSON().middleware.all()]

    assert.isArray(middleware)
    assert.lengthOf(middleware, 1)
    assert.isFunction('handle' in middleware[0] && middleware[0].handle)
    assert.containsSubset(middleware[0], { name: 'auth', args: undefined })
  })

  test('use multiple named middleware', ({ assert }) => {
    const app = new AppFactory().create()

    class AuthMiddleware {
      handle() {}
    }

    class AclMiddleware {
      handle() {}
    }

    const namedMiddleware = defineNamedMiddleware({
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
      acl: async () => {
        return {
          default: AclMiddleware,
        }
      },
    })

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.middleware([namedMiddleware.auth(), namedMiddleware.acl()])
    const middleware = [...route.toJSON().middleware.all()]

    assert.isArray(middleware)
    assert.lengthOf(middleware, 2)
    assert.isFunction('handle' in middleware[0] && middleware[0].handle)
    assert.isFunction('handle' in middleware[1] && middleware[1].handle)
    assert.containsSubset(middleware[0], { name: 'auth', args: undefined })
    assert.containsSubset(middleware[1], { name: 'acl', args: undefined })
  })

  test('give name to the route', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.as('showPost')

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,

      name: 'showPost',
    })
  })

  test('prefix to the route name', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.as('showPost')
    route.as('posts', true)

    assert.containsSubset(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,

      name: 'posts.showPost',
    })
  })

  test('throw error when prefix without an existing name', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
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
    const app = new AppFactory().create()

    async function handler() {}
    const route = new Route(app, [], {
      pattern: 'posts/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    route.setPattern('articles/:id')
    assert.equal(route.getPattern(), 'articles/:id')
    assert.containsSubset(route.toJSON(), {
      pattern: '/articles/:id',
      meta: {},
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
    })
  })
})
