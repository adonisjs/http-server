/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import Middleware from '@poppinss/middleware'

import { parseRoute } from '../../src/helpers.ts'
import { execute } from '../../src/router/executor.ts'
import { RoutesStore } from '../../src/router/store.ts'

function addRoute(store: RoutesStore, pattern: string) {
  store.add({
    pattern,
    tokens: parseRoute(pattern),
    handler() {},
    matchers: {},
    meta: {},
    execute,
    middleware: new Middleware<any>(),
    methods: ['GET'],
    domain: 'root',
  })
}

test.group('Store | add', () => {
  test('add route without explicit domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      tokens: parseRoute('/'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })

    assert.containSubset(store.tree, {
      tokens: [
        [
          {
            old: 'root',
            type: 0,
            val: 'root',
            end: '',
          },
        ],
      ],
      domains: {
        root: {
          GET: {
            routeKeys: {
              '/': 'GET-/',
            },
            tokens: [
              [
                {
                  old: '/',
                  type: 0,
                  val: '/',
                  end: '',
                },
              ],
            ],
            routes: {
              '/': {
                pattern: '/',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
      },
    })
  })

  test('add route with a custom domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      tokens: parseRoute('/'),
      methods: ['GET'],
      meta: {},
      handler: handler,
      matchers: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    })

    assert.containSubset(store.tree, {
      tokens: [
        [
          {
            old: 'foo.com',
            type: 0,
            val: 'foo.com',
            end: '',
          },
        ],
      ],
      domains: {
        'foo.com': {
          GET: {
            routeKeys: {
              '/': 'foo.com-GET-/',
            },
            tokens: [
              [
                {
                  old: '/',
                  type: 0,
                  val: '/',
                  end: '',
                },
              ],
            ],
            routes: {
              '/': {
                pattern: '/',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
      },
    })
  })

  test('raise error when duplicate routes are found', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/',
      tokens: parseRoute('/'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    }

    const store = new RoutesStore()
    store.add(route)

    assert.throws(() => store.add(route), 'Duplicate route found. "GET: /" route already exists')
  })

  test('raise error when duplicate params are found', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/:id/:id',
      tokens: parseRoute('/:id/:id'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    }

    const store = new RoutesStore()
    assert.throws(() => store.add(route), 'Duplicate param "id" found in "/:id/:id')
  })

  test('allow static path name same as the param name', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/id/:id',
      tokens: parseRoute('id/:id'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    }

    const store = new RoutesStore()
    assert.doesNotThrows(() => store.add(route))
  })

  test('allow duplicate routes across multiple methods', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/',
      tokens: parseRoute('/'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    }

    const store = new RoutesStore()
    store.add(route)
    store.add(Object.assign({}, route, { methods: ['POST'] }))

    assert.containSubset(store.tree, {
      tokens: [
        [
          {
            old: 'foo.com',
            type: 0,
            val: 'foo.com',
            end: '',
          },
        ],
      ],
      domains: {
        'foo.com': {
          GET: {
            routeKeys: {
              '/': 'foo.com-GET-/',
            },
            tokens: [
              [
                {
                  old: '/',
                  type: 0,
                  val: '/',
                  end: '',
                },
              ],
            ],
            routes: {
              '/': {
                pattern: '/',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
          POST: {
            routeKeys: {
              '/': 'foo.com-POST-/',
            },
            tokens: [
              [
                {
                  old: '/',
                  type: 0,
                  val: '/',
                  end: '',
                },
              ],
            ],
            routes: {
              '/': {
                pattern: '/',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
      },
    })
  })

  test('allow duplicate routes across multiple domains', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/',
      tokens: parseRoute('/'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    }

    const store = new RoutesStore()
    store.add(route)
    store.add(Object.assign({}, route, { domain: 'root' }))

    assert.containSubset(store.tree, {
      tokens: [
        [
          {
            old: 'foo.com',
            type: 0,
            val: 'foo.com',
            end: '',
          },
        ],
        [
          {
            old: 'root',
            type: 0,
            val: 'root',
            end: '',
          },
        ],
      ],
      domains: {
        'foo.com': {
          GET: {
            routeKeys: {
              '/': 'foo.com-GET-/',
            },
            tokens: [
              [
                {
                  old: '/',
                  type: 0,
                  val: '/',
                  end: '',
                },
              ],
            ],
            routes: {
              '/': {
                pattern: '/',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
        'root': {
          GET: {
            routeKeys: {
              '/': 'GET-/',
            },
            tokens: [
              [
                {
                  old: '/',
                  type: 0,
                  val: '/',
                  end: '',
                },
              ],
            ],
            routes: {
              '/': {
                pattern: '/',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
      },
    })
  })

  test('add route for multiple methods', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      methods: ['GET', 'POST'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })

    assert.containSubset(store.tree, {
      tokens: [
        [
          {
            old: 'root',
            type: 0,
            val: 'root',
            end: '',
          },
        ],
      ],
      domains: {
        root: {
          GET: {
            routeKeys: {
              '/:id': 'GET-/:id',
            },
            tokens: [
              [
                {
                  old: '/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  cast: undefined,
                  matcher: undefined,
                },
              ],
            ],
            routes: {
              '/:id': {
                pattern: '/:id',
                meta: {
                  params: ['id'],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
          POST: {
            routeKeys: {
              '/:id': 'POST-/:id',
            },
            tokens: [
              [
                {
                  old: '/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  cast: undefined,
                  matcher: undefined,
                },
              ],
            ],
            routes: {
              '/:id': {
                pattern: '/:id',
                meta: {
                  params: ['id'],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
      },
    })
  })

  test('add multiple routes', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: 'users',
      tokens: parseRoute('users'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })
    store.add({
      pattern: 'users/:id',
      tokens: parseRoute('users/:id'),
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })

    assert.containSubset(store.tree, {
      tokens: [
        [
          {
            old: 'root',
            type: 0,
            val: 'root',
            end: '',
          },
        ],
      ],
      domains: {
        root: {
          GET: {
            routeKeys: {
              'users': 'GET-users',
              'users/:id': 'GET-users/:id',
            },
            tokens: [
              [
                {
                  old: 'users',
                  type: 0,
                  val: 'users',
                  end: '',
                },
              ],
              [
                {
                  old: 'users/:id',
                  type: 0,
                  val: 'users',
                  end: '',
                },
                {
                  old: 'users/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  cast: undefined,
                  matcher: undefined,
                },
              ],
            ],
            routes: {
              'users': {
                pattern: 'users',
                meta: {
                  params: [],
                },
                handler,
                middleware: new Middleware<any>(),
              },
              'users/:id': {
                pattern: 'users/:id',
                meta: {
                  params: ['id'],
                },
                handler,
                middleware: new Middleware<any>(),
              },
            },
          },
        },
      },
    })
  })
})

test.group('Store | match', () => {
  test('invalidate the last match when adding a route', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/health')
    assert.isNull(store.match('/users/1', 'GET', false))
    addRoute(store, '/users/:id')
    assert.equal(store.match('/users/1', 'GET', false)?.params.id, '1')
  })

  test('decode params when reusing the last route match', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/users/:id')
    assert.equal(store.match('/users/hello%20world', 'GET', false)?.params.id, 'hello%20world')
    assert.equal(store.match('/users/hello%20world', 'GET', true)?.params.id, 'hello world')
  })

  test('find route for a given url', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      tokens: parseRoute('/'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/', 'GET', false), {
      route: {
        pattern: '/',
        handler,
        middleware: new Middleware<any>(),
        meta: {
          params: [],
        },
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/',
    })
  })

  test('find route and parse route params', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      tokens: parseRoute('/:username'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/virk', 'GET', false), {
      route: {
        pattern: '/:username',
        handler,
        middleware: new Middleware<any>(),
        meta: {
          params: ['username'],
        },
      },
      params: {
        username: 'virk',
      },
      subdomains: {},
      routeKey: 'GET-/:username',
    })
  })

  test('find route and parse optional route params', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:username?',
      tokens: parseRoute('/:username?'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/virk', 'GET', false), {
      route: {
        pattern: '/:username?',
        handler,
        meta: {
          params: ['username'],
        },
        middleware: new Middleware<any>(),
      },
      params: {
        username: 'virk',
      },
      subdomains: {},
      routeKey: 'GET-/:username?',
    })

    assert.containSubset(store.match('/', 'GET', false), {
      route: {
        pattern: '/:username?',
        handler,
        middleware: new Middleware<any>(),
        meta: {
          params: ['username'],
        },
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/:username?',
    })
  })

  test('match routes in the order they are registered', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      tokens: parseRoute('/:username'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/1', 'GET', false), {
      route: {
        pattern: '/:username',
        handler,
        middleware: new Middleware<any>(),
        meta: {
          params: ['username'],
        },
      },
      params: {
        username: '1',
      },
      subdomains: {},
      routeKey: 'GET-/:username',
    })
  })

  test('do not let the static index shadow an earlier dynamic route', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/:username')
    addRoute(store, '/virk')
    assert.equal(store.match('/virk', 'GET', false)?.route.pattern, '/:username')
    assert.equal(store.match('/virk', 'GET', false)?.params.username, 'virk')
  })

  test('preserve registration order across static prefix groups', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/users/:id')
    addRoute(store, '/users/admin')
    assert.equal(store.match('/users/admin', 'GET', false)?.route.pattern, '/users/:id')
  })

  test('preserve registration order for routes without a static prefix', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/:section/admin')
    addRoute(store, '/users/:id')
    assert.equal(store.match('/users/admin', 'GET', false)?.route.pattern, '/:section/admin')
  })

  test('match optional and wildcard routes through the static prefix index', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/users/:id?')
    addRoute(store, '/files/*')
    assert.equal(store.match('/users', 'GET', false)?.route.pattern, '/users/:id?')
    assert.equal(store.match('/files/a/b', 'GET', false)?.route.pattern, '/files/*')
  })

  test('index static routes registered after a dynamic route', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/users/:id')
    addRoute(store, '/health')
    addRoute(store, '/metrics')

    /**
     * A dynamic route registered first must not keep later static routes out of
     * the exact lookup table. Only routes that actually shadow them may.
     */
    assert.deepEqual(Object.keys(store.tree.domains.root.GET.staticRoutes ?? {}), [
      '/health',
      '/metrics',
    ])

    assert.equal(store.match('/health', 'GET', false)?.route.pattern, '/health')
    assert.equal(store.match('/metrics', 'GET', false)?.route.pattern, '/metrics')
    assert.equal(store.match('/users/1', 'GET', false)?.params.id, '1')
  })

  test('keep matching static routes that an earlier route shadows', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/*')
    addRoute(store, '/health')

    assert.deepEqual(Object.keys(store.tree.domains.root.GET.staticRoutes ?? {}), [])
    assert.equal(store.match('/health', 'GET', false)?.route.pattern, '/*')
    assert.deepEqual(store.match('/health', 'GET', false)?.params, { '*': ['health'] })
  })

  test('do not let a trailing slash pattern shadow the static index', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/health/')
    addRoute(store, '/health')

    assert.deepEqual(Object.keys(store.tree.domains.root.GET.staticRoutes ?? {}), [])
    assert.equal(store.match('/health', 'GET', false)?.route.pattern, '/health/')
  })

  test('return null for a repeated non matching url', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/users/:id')

    assert.isNull(store.match('/nope', 'GET', false))
    assert.isNull(store.match('/nope', 'GET', false))
  })

  test('do not resurrect the last route after adding a route', ({ assert }) => {
    const store = new RoutesStore()
    addRoute(store, '/users/:id')
    assert.equal(store.match('/users/7', 'GET', false)?.route.pattern, '/users/:id')

    addRoute(store, '/health')

    /**
     * Registration clears the memo of the last match. No url may resolve to the
     * previously matched route just because the memo was invalidated.
     */
    assert.isNull(store.match('\0', 'GET', false))
    assert.isNull(store.match('', 'GET', false))
    assert.equal(store.match('/users/7', 'GET', false)?.route.pattern, '/users/:id')
  })

  test('match routes past the small table threshold', ({ assert }) => {
    const store = new RoutesStore()
    for (let index = 0; index < 120; index++) {
      addRoute(store, `/static/${index}`)
    }
    for (let index = 0; index < 120; index++) {
      addRoute(store, `/dynamic/${index}/:id`)
    }

    assert.equal(store.match('/static/0', 'GET', false)?.route.pattern, '/static/0')
    assert.equal(store.match('/static/119', 'GET', false)?.route.pattern, '/static/119')
    assert.equal(store.match('/dynamic/119/7', 'GET', false)?.params.id, '7')
    assert.isNull(store.match('/static/120', 'GET', false))
  })

  test('test params against matchers before matching', ({ assert }) => {
    async function handler() {}
    const matchers = {
      username: { match: new RegExp(/[a-z]+/) },
      id: { match: new RegExp(/[0-9]+/) },
    }

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      tokens: parseRoute('/:username', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/1', 'GET', false), {
      route: {
        pattern: '/:id',
        handler,
        meta: {
          params: ['id'],
        },
        middleware: new Middleware<any>(),
      },
      params: {
        id: '1',
      },
      subdomains: {},
      routeKey: 'GET-/:id',
    })
  })

  test('match hostname against route domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      tokens: parseRoute('/'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'foo.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('foo.com')
    assert.deepEqual(domain, [
      {
        end: '',
        old: 'foo.com',
        type: 0,
        val: 'foo.com',
      },
    ])
  })

  test('match hostname against a dynamic route domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      tokens: parseRoute('/'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: ':tenant.foo.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('adonisjs.foo.com')
    assert.deepEqual(domain, [
      {
        old: ':tenant.foo.com',
        type: 1,
        val: 'tenant',
        end: '.foo.com',
        matcher: undefined,
        cast: undefined,
      },
    ])
  })

  test('return empty array when no domains have been registered', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.matchDomain('blog.adonisjs.com'), [])
  })

  test('return empty array when unable to match the route domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'foo.adonisjs.com',
    })

    assert.deepEqual(store.matchDomain('blog.adonisjs.com'), [])
  })

  test('match routes for a domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      tokens: parseRoute('/:username'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'foo.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('foo.com')
    assert.containSubset(
      store.match('/1', 'GET', false, {
        tokens: domain,
        hostname: 'foo.com',
      }),
      {
        route: {
          pattern: '/:id',
          handler,
          meta: {
            params: ['id'],
          },
          middleware: new Middleware<any>(),
        },
        params: {
          id: '1',
        },
        subdomains: {},
        routeKey: 'foo.com-GET-/:id',
      }
    )
  })

  test('match routes for a dynamic domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: ':subdomain.adonisjs.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('blog.adonisjs.com')
    assert.containSubset(
      store.match('/1', 'GET', false, {
        tokens: domain,
        hostname: 'blog.adonisjs.com',
      }),
      {
        route: {
          pattern: '/:id',
          handler,
          meta: {
            params: ['id'],
          },
          middleware: new Middleware<any>(),
        },
        params: {
          id: '1',
        },
        subdomains: {
          subdomain: 'blog',
        },
        routeKey: ':subdomain.adonisjs.com-GET-/:id',
      }
    )
  })

  test('return null when unable to match the method', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.isNull(store.match('/1', 'POST', false))
  })

  test('return null when unable to match the domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.isNull(
      store.match('/1', 'POST', false, {
        tokens: [{ old: 'foo.com', end: '', type: 0, val: 'foo.com' }],
        hostname: 'foo.com',
      })
    )
  })

  test('return null when unable to match the route pattern', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      tokens: parseRoute('/'),
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.isNull(store.match('/hello', 'GET', false))
  })

  test('do not match param against regex when param is optional and missing', ({ assert }) => {
    async function handler() {}
    const matchers = {
      id: { match: new RegExp(/^[0-9]+$/) },
    }

    const store = new RoutesStore()
    store.add({
      pattern: '/users/:id?',
      tokens: parseRoute('/users/:id?', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/users', 'GET', false), {
      route: {
        pattern: '/users/:id?',
        handler,
        meta: {
          params: ['id'],
        },
        middleware: new Middleware<any>(),
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/users/:id?',
    })
  })

  test('match param against regex when param is optional but defined in url', ({ assert }) => {
    async function handler() {}
    const matchers = {
      id: { match: new RegExp(/^[0-9]+$/) },
    }

    const store = new RoutesStore()
    store.add({
      pattern: '/users/:id?',
      tokens: parseRoute('/users/:id?', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/users/1', 'GET', false), {
      route: {
        pattern: '/users/:id?',
        handler,
        meta: {
          params: ['id'],
        },
        middleware: new Middleware<any>(),
      },
      params: {
        id: '1',
      },
      subdomains: {},
      routeKey: 'GET-/users/:id?',
    })
  })

  test('cast params using route matchers', ({ assert }) => {
    async function handler() {}
    const matchers = {
      username: { match: new RegExp(/[a-z]+/) },
      id: { match: new RegExp(/[0-9]+/), cast: (value: string) => Number(value) },
    }

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      tokens: parseRoute('/:username', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/:id',
      tokens: parseRoute('/:id', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/1', 'GET', false), {
      route: {
        pattern: '/:id',
        handler,
        meta: {
          params: ['id'],
        },
        middleware: new Middleware<any>(),
      },
      params: {
        id: 1,
      },
      subdomains: {},
      routeKey: 'GET-/:id',
    })
  })

  test('do not cast optional params when not passed in the URL', ({ assert }) => {
    async function handler() {}
    const matchers = {
      id: { match: new RegExp(/[0-9]+/), cast: (value: string) => Number(value) },
    }

    const store = new RoutesStore()
    store.add({
      pattern: '/:id?',
      tokens: parseRoute('/:id?', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/', 'GET', false), {
      route: {
        pattern: '/:id?',
        handler,
        meta: {
          params: ['id'],
        },
        middleware: new Middleware<any>(),
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/:id?',
    })
  })

  test('cast multiple params', ({ assert }) => {
    async function handler() {}
    const matchers = {
      id: { match: new RegExp(/[0-9]+/), cast: (value: string) => Number(value) },
      slug: { cast: (value: string) => value.toLowerCase() },
    }

    const store = new RoutesStore()
    store.add({
      pattern: '/:id/:slug',
      tokens: parseRoute('/:id/:slug', matchers),
      handler,
      meta: {},
      matchers,
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.containSubset(store.match('/1/HELLO-WORLD', 'GET', false), {
      route: {
        pattern: '/:id/:slug',
        handler,
        meta: {
          params: ['id', 'slug'],
        },
        middleware: new Middleware<any>(),
      },
      params: {
        id: 1,
        slug: 'hello-world',
      },
      subdomains: {},
      routeKey: 'GET-/:id/:slug',
    })
  })
})
