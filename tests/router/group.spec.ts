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
import { toRoutesJSON } from '../../src/helpers.js'
import { RouteGroup } from '../../src/router/group.js'
import { RouteResource } from '../../src/router/resource.js'
import { MiddlewareStore } from '../../src/middleware/store.js'
import { BriskRoute } from '../../src/router/brisk.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Route Group', () => {
  test('define resource inside the group', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const resource = new RouteResource(app, middlewareStore, {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([resource], middlewareStore)

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/photos',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        name: 'photos.index',
      },
      {
        pattern: '/photos/create',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        name: 'photos.create',
      },
      {
        pattern: '/photos',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        name: 'photos.store',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        name: 'photos.show',
      },
      {
        pattern: '/photos/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        name: 'photos.edit',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [],
        name: 'photos.update',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        middleware: [],
        name: 'photos.destroy',
      },
    ])
  })
})

test.group('Route group | prefix', () => {
  test('define routes prefix', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    const group = new RouteGroup([route], middlewareStore)
    group.prefix('api/v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })

  test('define routes prefix in nested groups', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route], middlewareStore)
    group.prefix('v1')

    const apiGroup = new RouteGroup([group], middlewareStore)
    apiGroup.prefix('api')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })

  test('define routes prefix on resourceful routes', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const resource = new RouteResource(app, middlewareStore, {
      resource: 'app-posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([resource], middlewareStore)
    group.prefix('v1')

    const apiGroup = new RouteGroup([group], middlewareStore)
    apiGroup.prefix('api')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/app-posts',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.index',
      },
      {
        pattern: '/api/v1/app-posts/create',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.create',
      },
      {
        pattern: '/api/v1/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.store',
      },
      {
        pattern: '/api/v1/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.store',
      },
      {
        pattern: '/api/v1/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.show',
      },
      {
        pattern: '/api/v1/app-posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.edit',
      },
      {
        pattern: '/api/v1/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.update',
      },
      {
        pattern: '/api/v1/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        middleware: [],
        name: 'app_posts.destroy',
      },
    ])
  })

  test('define prefix on a brisk route', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new BriskRoute(app, middlewareStore, {
      pattern: '/:id',
      globalMatchers: {},
    })
    route.setHandler(handler)

    const group = new RouteGroup([route], middlewareStore)
    group.prefix('api/v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })
})

test.group('Route group | as', () => {
  test('prepend name to the existing route names', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.as('list')

    const group = new RouteGroup([route], middlewareStore)
    group.as('v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: 'v1.list',
      },
    ])
  })

  test('prepend name inside nested groups', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.as('list')

    const group = new RouteGroup([route], middlewareStore)
    group.as('v1')

    const apiGroup = new RouteGroup([group], middlewareStore)
    apiGroup.as('api')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: 'api.v1.list',
      },
    ])
  })

  test('prepend name to resourceful routes', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const resource = new RouteResource(app, middlewareStore, {
      resource: 'posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([resource], middlewareStore)
    group.as('v1')

    const apiGroup = new RouteGroup([group], middlewareStore)
    apiGroup.as('api')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.index',
      },
      {
        pattern: '/posts/create',
        matchers: {},
        meta: {},
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.create',
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.store',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.show',
      },
      {
        pattern: '/posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.edit',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.update',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        middleware: [],
        name: 'api.v1.posts.destroy',
      },
    ])
  })

  test('prepend name to the existing brisk route names', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new BriskRoute(app, middlewareStore, {
      pattern: '/:id',
      globalMatchers: {},
    })

    route.setHandler(handler)
    route.route!.as('list')

    const group = new RouteGroup([route], middlewareStore)
    group.as('v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        handler,
        name: 'v1.list',
      },
    ])
  })
})

test.group('Route group | middleware', () => {
  test('prepend middleware to existing route middleware', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    function authMiddleware() {}
    function limiterMiddleware() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(authMiddleware)

    const group = new RouteGroup([route], middlewareStore)
    group.middleware(limiterMiddleware)

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [limiterMiddleware, authMiddleware],
        handler,
        name: undefined,
      },
    ])
  })

  test('keep group own middleware in right order', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    function aclMiddleware() {}
    function authMiddleware() {}
    function limiterMiddleware() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(authMiddleware)

    const group = new RouteGroup([route], middlewareStore)
    group.middleware(limiterMiddleware)
    group.middleware(aclMiddleware)

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [limiterMiddleware, aclMiddleware, authMiddleware],
        handler,
        name: undefined,
      },
    ])
  })

  test('define nested group middleware in right order', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    function aclMiddleware() {}
    function authMiddleware() {}
    function limiterMiddleware() {}
    function impersonateMiddleware() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(authMiddleware)

    const group = new RouteGroup([route], middlewareStore)
    const group1 = new RouteGroup([group], middlewareStore)

    group.middleware(limiterMiddleware)
    group1.middleware(aclMiddleware)
    group1.middleware(impersonateMiddleware)

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [aclMiddleware, impersonateMiddleware, limiterMiddleware, authMiddleware],
        handler,
        name: undefined,
      },
    ])
  })

  test('define middleware on nested group route and resource', ({ assert }) => {
    const namedMiddleware = {
      // @ts-expect-error
      log: () => import('#middleware/log'),
      // @ts-expect-error
      logGet: () => import('#middleware/log'),
      // @ts-expect-error
      logForm: () => import('#middleware/log'),
      // @ts-expect-error
      logPost: () => import('#middleware/log'),
      // @ts-expect-error
      acl: () => import('#middleware/acl'),
      // @ts-expect-error
      limiter: () => import('#middleware/limiter'),
      // @ts-expect-error
      auth: () => import('#middleware/auth'),
      // @ts-expect-error
      impersonate: () => import('#middleware/impersonate'),
    }

    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], namedMiddleware)
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware('log', [])

    const resource = new RouteResource(app, middlewareStore, {
      resource: 'posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })
    resource.tap((r) => r.middleware('log', []))

    resource.tap('create', (r) => {
      r.middleware('logGet', [])
      r.middleware('logForm', [])
    })
    resource.tap(['index', 'show'], (r) => {
      r.middleware('logGet', [])
    })
    resource.tap(['store'], (r) => {
      r.middleware('logPost', [])
      r.middleware('logForm', [])
    })

    const group = new RouteGroup([route, resource], middlewareStore)
    group.middleware('limiter', [])
    group.middleware('acl', [])

    const route1 = new Route(app, middlewareStore, {
      pattern: '1/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route1.middleware('log', [])

    const outerGroup = new RouteGroup([group, route1], middlewareStore)
    outerGroup.middleware('auth', [])
    outerGroup.middleware('impersonate', [])

    assert.containsSubset(toRoutesJSON(outerGroup.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
        ],
        handler,
        name: undefined,
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
          { name: 'logGet', args: [] },
        ],
        name: 'posts.index',
      },
      {
        pattern: '/posts/create',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
          { name: 'logGet', args: [] },
          { name: 'logForm', args: [] },
        ],
        name: 'posts.create',
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
          { name: 'logPost', args: [] },
          { name: 'logForm', args: [] },
        ],
        name: 'posts.store',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
          { name: 'logGet', args: [] },
        ],
        name: 'posts.show',
      },
      {
        pattern: '/posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
        ],
        name: 'posts.edit',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
        ],
        name: 'posts.update',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'limiter', args: [] },
          { name: 'acl', args: [] },
          { name: 'log', args: [] },
        ],
        name: 'posts.destroy',
      },
      {
        pattern: '/1/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [
          { name: 'auth', args: [] },
          { name: 'impersonate', args: [] },
          { name: 'log', args: [] },
        ],
        handler,
        name: undefined,
      },
    ])
  })

  test('prepend middleware to existing brisk route middleware', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    async function handler() {}
    function authMiddleware() {}
    function limiterMiddleware() {}

    const route = new BriskRoute(app, middlewareStore, {
      pattern: '/:id',
      globalMatchers: {},
    })

    route.setHandler(handler)
    route.route!.middleware(authMiddleware)

    const group = new RouteGroup([route], middlewareStore)
    group.middleware(limiterMiddleware)

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [limiterMiddleware, authMiddleware],
        handler,
        name: undefined,
      },
    ])
  })
})

test.group('Route group | domain', () => {
  test('define routes domain', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    const group = new RouteGroup([route], middlewareStore)
    group.domain('blog.adonisjs.com')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })

  test('define route domain in nested groups', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route], middlewareStore)
    const apiGroup = new RouteGroup([group], middlewareStore)
    apiGroup.domain('blog.adonisjs.com')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })

  test('define domain on resourceful routes', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const resource = new RouteResource(app, middlewareStore, {
      resource: 'app-posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })
    resource.tap('create', (r) => r.domain('api.adonisjs.com'))

    const group = new RouteGroup([resource], middlewareStore)
    group.domain('blog.adonisjs.com')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/app-posts',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.index',
      },
      {
        pattern: '/app-posts/create',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'api.adonisjs.com',
        middleware: [],
        name: 'app_posts.create',
      },
      {
        pattern: '/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.store',
      },
      {
        pattern: '/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.store',
      },
      {
        pattern: '/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.show',
      },
      {
        pattern: '/app-posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.edit',
      },
      {
        pattern: '/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.update',
      },
      {
        pattern: '/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        name: 'app_posts.destroy',
      },
    ])
  })

  test('define brisk route domain', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new BriskRoute(app, middlewareStore, {
      pattern: '/',
      globalMatchers: {},
    })
    route.setHandler(handler)

    const group = new RouteGroup([route], middlewareStore)
    group.domain('blog.adonisjs.com')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'blog.adonisjs.com',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })
})

test.group('Route group | matchers', () => {
  test('add matcher to group routes', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route], middlewareStore)
    group.where('id', '[a-z]')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: undefined,
        handler,
      },
    ])
  })

  test('add matcher to nested group routes', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route], middlewareStore)
    group.where('id', '[a-z]')

    const group1 = new RouteGroup([group], middlewareStore)
    group1.where('id', '[0-9]')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: undefined,
        handler,
      },
    ])
  })

  test('do not overwrite matcher defined explicitly on the route', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new Route(app, middlewareStore, {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.where('id', '[a-zA-Z]')

    const group = new RouteGroup([route], middlewareStore)
    group.where('id', '[a-z]')

    const group1 = new RouteGroup([group], middlewareStore)
    group1.where('id', '[0-9]')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-zA-Z]') },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: undefined,
        handler,
      },
    ])
  })

  test('add matcher resource routes', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})

    const route = new RouteResource(app, middlewareStore, {
      resource: 'posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([route], middlewareStore)
    group.where('id', '[a-z]')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/posts',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'posts.index',
      },
      {
        pattern: '/posts/create',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'posts.create',
      },
      {
        pattern: '/posts',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        name: 'posts.store',
      },
      {
        pattern: '/posts',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        name: 'posts.store',
      },
      {
        pattern: '/posts/:id',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'posts.show',
      },
      {
        pattern: '/posts/:id/edit',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: 'posts.edit',
      },
      {
        pattern: '/posts/:id',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [],
        name: 'posts.update',
      },
      {
        pattern: '/posts/:id',
        matchers: {
          id: {
            match: new RegExp('[a-z]'),
          },
        },
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        middleware: [],
        name: 'posts.destroy',
      },
    ])
  })

  test('add matcher to brisk routes in the group', ({ assert }) => {
    const app = new Application(BASE_URL, { environment: 'web' })
    const middlewareStore = new MiddlewareStore([], {})
    async function handler() {}

    const route = new BriskRoute(app, middlewareStore, {
      pattern: '/:id',
      globalMatchers: {},
    })
    route.setHandler(handler)

    const group = new RouteGroup([route], middlewareStore)
    group.where('id', '[a-z]')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        middleware: [],
        name: undefined,
        handler,
      },
    ])
  })
})
