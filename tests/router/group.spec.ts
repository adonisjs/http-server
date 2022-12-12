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
import { toRoutesJSON } from '../../src/helpers.js'
import { BriskRoute } from '../../src/router/brisk.js'
import { RouteGroup } from '../../src/router/group.js'
import { AppFactory } from '../../test_factories/app.js'
import { RouteResource } from '../../src/router/resource.js'
import { defineNamedMiddleware } from '../../src/define_middleware.js'

test.group('Route Group', () => {
  test('define resource inside the group', ({ assert }) => {
    const app = new AppFactory().create()

    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([resource])

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/photos',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'photos.index',
      },
      {
        pattern: '/photos/create',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'photos.create',
      },
      {
        pattern: '/photos',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        name: 'photos.store',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'photos.show',
      },
      {
        pattern: '/photos/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'photos.edit',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        name: 'photos.update',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        name: 'photos.destroy',
      },
    ])
  })
})

test.group('Route group | prefix', () => {
  test('define routes prefix', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    const group = new RouteGroup([route])
    group.prefix('api/v1')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])
  })

  test('define routes prefix in nested groups', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route])
    group.prefix('v1')

    const apiGroup = new RouteGroup([group])
    apiGroup.prefix('api')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])
  })

  test('define routes prefix on resourceful routes', ({ assert }) => {
    const app = new AppFactory().create()

    const resource = new RouteResource(app, [], {
      resource: 'app-posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([resource])
    group.prefix('v1')

    const apiGroup = new RouteGroup([group])
    apiGroup.prefix('api')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/app-posts',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'app_posts.index',
      },
      {
        pattern: '/api/v1/app-posts/create',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'app_posts.create',
      },
      {
        pattern: '/api/v1/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        name: 'app_posts.store',
      },
      {
        pattern: '/api/v1/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        name: 'app_posts.store',
      },
      {
        pattern: '/api/v1/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'app_posts.show',
      },
      {
        pattern: '/api/v1/app-posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'app_posts.edit',
      },
      {
        pattern: '/api/v1/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        name: 'app_posts.update',
      },
      {
        pattern: '/api/v1/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        name: 'app_posts.destroy',
      },
    ])
  })

  test('define prefix on a brisk route', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new BriskRoute(app, [], {
      pattern: '/:id',
      globalMatchers: {},
    })
    route.setHandler(handler)

    const group = new RouteGroup([route])
    group.prefix('api/v1')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])
  })
})

test.group('Route group | as', () => {
  test('prepend name to the existing route names', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.as('list')

    const group = new RouteGroup([route])
    group.as('v1')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: 'v1.list',
      },
    ])
  })

  test('prepend name inside nested groups', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.as('list')

    const group = new RouteGroup([route])
    group.as('v1')

    const apiGroup = new RouteGroup([group])
    apiGroup.as('api')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: 'api.v1.list',
      },
    ])
  })

  test('prepend name to resourceful routes', ({ assert }) => {
    const app = new AppFactory().create()

    const resource = new RouteResource(app, [], {
      resource: 'posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([resource])
    group.as('v1')

    const apiGroup = new RouteGroup([group])
    apiGroup.as('api')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'api.v1.posts.index',
      },
      {
        pattern: '/posts/create',
        matchers: {},
        meta: {},
        methods: ['HEAD', 'GET'],
        domain: 'root',
        name: 'api.v1.posts.create',
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        name: 'api.v1.posts.store',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'api.v1.posts.show',
      },
      {
        pattern: '/posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: 'api.v1.posts.edit',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        name: 'api.v1.posts.update',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        name: 'api.v1.posts.destroy',
      },
    ])
  })

  test('prepend name to the existing brisk route names', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new BriskRoute(app, [], {
      pattern: '/:id',
      globalMatchers: {},
    })

    route.setHandler(handler)
    route.route!.as('list')

    const group = new RouteGroup([route])
    group.as('v1')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        handler,
        name: 'v1.list',
      },
    ])
  })
})

test.group('Route group | middleware', () => {
  test('prepend middleware to existing route middleware', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    function authMiddleware() {}
    function limiterMiddleware() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(authMiddleware)

    const group = new RouteGroup([route])
    group.middleware(limiterMiddleware)

    const routesJSON = toRoutesJSON(group.routes)

    assert.containsSubset(routesJSON, [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])

    assert.deepEqual(routesJSON[0].middleware.all(), new Set([limiterMiddleware, authMiddleware]))
  })

  test('keep group own middleware in right order', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    function aclMiddleware() {}
    function authMiddleware() {}
    function limiterMiddleware() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(authMiddleware)

    const group = new RouteGroup([route])
    group.middleware(limiterMiddleware)
    group.middleware(aclMiddleware)

    const routesJSON = toRoutesJSON(group.routes)

    assert.containsSubset(routesJSON, [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])

    assert.deepEqual(
      routesJSON[0].middleware.all(),
      new Set([limiterMiddleware, aclMiddleware, authMiddleware])
    )
  })

  test('define nested group middleware in right order', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    function aclMiddleware() {}
    function authMiddleware() {}
    function limiterMiddleware() {}
    function impersonateMiddleware() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(authMiddleware)

    const group = new RouteGroup([route])
    const group1 = new RouteGroup([group])

    group.middleware(limiterMiddleware)
    group1.middleware(aclMiddleware)
    group1.middleware(impersonateMiddleware)

    const routesJSON = toRoutesJSON(group.routes)

    assert.containsSubset(routesJSON, [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])

    assert.deepEqual(
      routesJSON[0].middleware.all(),
      new Set([aclMiddleware, impersonateMiddleware, limiterMiddleware, authMiddleware])
    )
  })

  test('define middleware on nested group route and resource', ({ assert }) => {
    class LogMiddleware {
      handle() {}
    }
    class AclMiddleware {
      handle() {}
    }
    class AuthMiddleware {
      handle() {}
    }
    class LimiterMiddleware {
      handle() {}
    }
    class ImpersonateMiddleware {
      handle() {}
    }

    const namedMiddleware = defineNamedMiddleware({
      log: async () => {
        return {
          default: LogMiddleware,
        }
      },
      logGet: async () => {
        return {
          default: LogMiddleware,
        }
      },
      logForm: async () => {
        return {
          default: LogMiddleware,
        }
      },
      logPost: async () => {
        return {
          default: LogMiddleware,
        }
      },
      acl: async () => {
        return {
          default: AclMiddleware,
        }
      },
      limiter: async () => {
        return {
          default: LimiterMiddleware,
        }
      },
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
      impersonate: async () => {
        return {
          default: ImpersonateMiddleware,
        }
      },
    })

    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.middleware(namedMiddleware.log())

    const resource = new RouteResource(app, [], {
      resource: 'posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })
    resource.tap((r) => r.middleware(namedMiddleware.log()))

    resource.tap('create', (r) => {
      r.middleware(namedMiddleware.logGet())
      r.middleware(namedMiddleware.logForm())
    })
    resource.tap(['index', 'show'], (r) => {
      r.middleware(namedMiddleware.logGet())
    })
    resource.tap(['store'], (r) => {
      r.middleware(namedMiddleware.logPost())
      r.middleware(namedMiddleware.logForm())
    })

    const group = new RouteGroup([route, resource])
    group.middleware(namedMiddleware.limiter())
    group.middleware(namedMiddleware.acl())

    const route1 = new Route(app, [], {
      pattern: '1/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route1.middleware(namedMiddleware.log())

    const outerGroup = new RouteGroup([group, route1])
    outerGroup.middleware(namedMiddleware.auth())
    outerGroup.middleware(namedMiddleware.impersonate())

    const routesJSON = toRoutesJSON(outerGroup.routes)

    assert.containsSubset(routesJSON, [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'posts.index',
      },
      {
        pattern: '/posts/create',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'posts.create',
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'root',
        name: 'posts.store',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'posts.show',
      },
      {
        pattern: '/posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: 'posts.edit',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        name: 'posts.update',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'root',
        name: 'posts.destroy',
      },
      {
        pattern: '/1/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])

    assert.containsSubset(
      routesJSON.map((r) => {
        return {
          middleware: [...r.middleware.all()],
        }
      }),
      [
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
            { name: 'logGet', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
            { name: 'logGet', args: undefined },
            { name: 'logForm', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
            { name: 'logPost', args: undefined },
            { name: 'logForm', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
            { name: 'logGet', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'limiter', args: undefined },
            { name: 'acl', args: undefined },
            { name: 'log', args: undefined },
          ],
        },
        {
          middleware: [
            { name: 'auth', args: undefined },
            { name: 'impersonate', args: undefined },
            { name: 'log', args: undefined },
          ],
        },
      ]
    )
  })

  test('prepend middleware to existing brisk route middleware', ({ assert }) => {
    const app = new AppFactory().create()

    async function handler() {}
    function authMiddleware() {}
    function limiterMiddleware() {}

    const route = new BriskRoute(app, [], {
      pattern: '/:id',
      globalMatchers: {},
    })

    route.setHandler(handler)
    route.route!.middleware(authMiddleware)

    const group = new RouteGroup([route])
    group.middleware(limiterMiddleware)

    const routesJSON = toRoutesJSON(group.routes)

    assert.containsSubset(routesJSON, [
      {
        pattern: '/:id',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        handler,
        name: undefined,
      },
    ])

    assert.deepEqual(routesJSON[0].middleware.all(), new Set([limiterMiddleware, authMiddleware]))
  })
})

test.group('Route group | domain', () => {
  test('define routes domain', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    const group = new RouteGroup([route])
    group.domain('blog.adonisjs.com')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        handler,
        name: undefined,
      },
    ])
  })

  test('define route domain in nested groups', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route])
    const apiGroup = new RouteGroup([group])
    apiGroup.domain('blog.adonisjs.com')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        handler,
        name: undefined,
      },
    ])
  })

  test('define domain on resourceful routes', ({ assert }) => {
    const app = new AppFactory().create()

    const resource = new RouteResource(app, [], {
      resource: 'app-posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })
    resource.tap('create', (r) => r.domain('api.adonisjs.com'))

    const group = new RouteGroup([resource])
    group.domain('blog.adonisjs.com')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/app-posts',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.index',
      },
      {
        pattern: '/app-posts/create',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'api.adonisjs.com',
        name: 'app_posts.create',
      },
      {
        pattern: '/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.store',
      },
      {
        pattern: '/app-posts',
        matchers: {},
        meta: {},
        methods: ['POST'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.store',
      },
      {
        pattern: '/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.show',
      },
      {
        pattern: '/app-posts/:id/edit',
        matchers: {},
        meta: {},
        methods: ['GET'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.edit',
      },
      {
        pattern: '/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['PUT', 'PATCH'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.update',
      },
      {
        pattern: '/app-posts/:id',
        matchers: {},
        meta: {},
        methods: ['DELETE'],
        domain: 'blog.adonisjs.com',
        name: 'app_posts.destroy',
      },
    ])
  })

  test('define brisk route domain', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new BriskRoute(app, [], {
      pattern: '/',
      globalMatchers: {},
    })
    route.setHandler(handler)

    const group = new RouteGroup([route])
    group.domain('blog.adonisjs.com')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/',
        matchers: {},
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'blog.adonisjs.com',
        handler,
        name: undefined,
      },
    ])
  })
})

test.group('Route group | matchers', () => {
  test('add matcher to group routes', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route])
    group.where('id', '[a-z]')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: undefined,
        handler,
      },
    ])
  })

  test('add matcher to nested group routes', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })

    const group = new RouteGroup([route])
    group.where('id', '[a-z]')

    const group1 = new RouteGroup([group])
    group1.where('id', '[0-9]')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: undefined,
        handler,
      },
    ])
  })

  test('do not overwrite matcher defined explicitly on the route', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new Route(app, [], {
      pattern: '/:id',
      methods: ['GET'],
      handler,
      globalMatchers: {},
    })
    route.where('id', '[a-zA-Z]')

    const group = new RouteGroup([route])
    group.where('id', '[a-z]')

    const group1 = new RouteGroup([group])
    group1.where('id', '[0-9]')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-zA-Z]') },
        },
        meta: {},
        methods: ['GET'],
        domain: 'root',
        name: undefined,
        handler,
      },
    ])
  })

  test('add matcher resource routes', ({ assert }) => {
    const app = new AppFactory().create()

    const route = new RouteResource(app, [], {
      resource: 'posts',
      controller: '#controllers/posts',
      globalMatchers: {},
      shallow: false,
    })

    const group = new RouteGroup([route])
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
        name: 'posts.destroy',
      },
    ])
  })

  test('add matcher to brisk routes in the group', ({ assert }) => {
    const app = new AppFactory().create()
    async function handler() {}

    const route = new BriskRoute(app, [], {
      pattern: '/:id',
      globalMatchers: {},
    })
    route.setHandler(handler)

    const group = new RouteGroup([route])
    group.where('id', '[a-z]')

    assert.containsSubset(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {},
        methods: ['GET', 'HEAD'],
        domain: 'root',
        name: undefined,
        handler,
      },
    ])
  })
})
