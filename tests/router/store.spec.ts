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
// @ts-expect-error
import matchit from '@poppinss/matchit'

import type { MatchedRoute, RouteJSON } from '../../src/types/route.ts'
import { parseRoute } from '../../src/helpers.ts'
import { execute } from '../../src/router/executor.ts'
import { RoutesStore } from '../../src/router/store.ts'

function addRoute(
  store: RoutesStore,
  pattern: string,
  options: Partial<Pick<RouteJSON, 'tokens' | 'handler' | 'matchers' | 'methods' | 'domain'>> = {}
) {
  const matchers = options.matchers ?? {}
  store.add({
    pattern,
    tokens: options.tokens ?? parseRoute(pattern, matchers),
    handler: options.handler ?? async function handler() {},
    matchers,
    meta: {},
    execute,
    middleware: new Middleware<any>(),
    methods: options.methods ?? ['GET'],
    domain: options.domain ?? 'root',
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
  test('preserve registration order for equivalent static routes with repeated trailing separators', ({
    assert,
  }) => {
    async function repeatedSeparatorHandler() {}
    async function canonicalHandler() {}

    const store = new RoutesStore()
    for (const [pattern, handler] of [
      ['/users//', repeatedSeparatorHandler],
      ['/users', canonicalHandler],
    ] as const) {
      addRoute(store, pattern, { handler })
    }

    assert.strictEqual(store.match('/users', 'GET', false)?.route.handler, repeatedSeparatorHandler)
  })

  test('preserve registration order across static, parameter, optional, and wildcard routes', ({
    assert,
  }) => {
    const cases = [
      { patterns: ['/:value', '/users'], pathname: '/users', expected: '/:value' },
      { patterns: ['/users', '/:value'], pathname: '/users', expected: '/users' },
      { patterns: ['/:value?', '/'], pathname: '/', expected: '/:value?' },
      { patterns: ['/', '/:value?'], pathname: '/', expected: '/' },
      { patterns: ['/*', '/users'], pathname: '/users', expected: '/*' },
      { patterns: ['/users', '/*'], pathname: '/users', expected: '/users' },
    ]

    for (const { patterns, pathname, expected } of cases) {
      const store = new RoutesStore()
      for (const pattern of patterns) {
        addRoute(store, pattern)
      }

      assert.equal(store.match(pathname, 'GET', false)?.route.pattern, expected)
    }
  })

  test('preserve matchit separator semantics for static routes', ({ assert }) => {
    const cases = [
      {
        patterns: ['/users', 'users/'],
        pathnames: ['/users', '/users/', 'users', 'users/'],
        expected: '/users',
      },
      { patterns: ['//users', '/users'], pathnames: ['/users'], expected: '/users' },
      {
        patterns: ['/teams//users', '/teams/users'],
        pathnames: ['/teams//users'],
        expected: '/teams//users',
      },
      {
        patterns: ['/teams//users', '/teams/users'],
        pathnames: ['/teams/users'],
        expected: '/teams/users',
      },
    ]

    for (const { patterns, pathnames, expected } of cases) {
      const store = new RoutesStore()
      for (const pattern of patterns) {
        addRoute(store, pattern)
      }

      for (const pathname of pathnames) {
        assert.equal(store.match(pathname, 'GET', false)?.route.pattern, expected)
      }
    }
  })

  test('return the same route object for repeated matches and routes with multiple methods', ({
    assert,
  }) => {
    const store = new RoutesStore()
    addRoute(store, '/users', { methods: ['GET', 'POST'] })

    const firstGetMatch = store.match('/users', 'GET', false)!
    const secondGetMatch = store.match('/users/', 'GET', false)!
    const postMatch = store.match('/users', 'POST', false)!

    assert.strictEqual(firstGetMatch.route, secondGetMatch.route)
    assert.strictEqual(firstGetMatch.route, postMatch.route)
    assert.equal(firstGetMatch.routeKey, 'GET-/users')
    assert.equal(postMatch.routeKey, 'POST-/users')
  })

  test('decode parameter and wildcard values only when requested', ({ assert }) => {
    const store = new RoutesStore()
    for (const pattern of ['/users/:name', '/files/*']) {
      addRoute(store, pattern)
    }

    assert.deepEqual(store.match('/users/Romain%20Lanz', 'GET', false)?.params, {
      name: 'Romain%20Lanz',
    })
    assert.deepEqual(store.match('/users/Romain%20Lanz', 'GET', true)?.params, {
      name: 'Romain Lanz',
    })
    assert.deepEqual(store.match('/files/folder%20one/file%20two', 'GET', false)?.params, {
      '*': ['folder%20one', 'file%20two'],
    })
    assert.deepEqual(store.match('/files/folder%20one/file%20two', 'GET', true)?.params, {
      '*': ['folder one', 'file two'],
    })
  })

  test('extract subdomains when matching an indexed static route on an explicit domain', ({
    assert,
  }) => {
    const store = new RoutesStore()
    addRoute(store, '/dashboard', { domain: ':tenant.adonisjs.com' })

    const domainTokens = store.matchDomain('news.adonisjs.com')
    assert.containSubset(
      store.match('/dashboard', 'GET', false, {
        tokens: domainTokens,
        hostname: 'news.adonisjs.com',
      }),
      {
        route: { pattern: '/dashboard' },
        routeKey: ':tenant.adonisjs.com-GET-/dashboard',
        params: {},
        subdomains: { tenant: 'news' },
      }
    )
  })

  test('apply matchers and casts on a dynamic route before an indexed static route', ({
    assert,
  }) => {
    const store = new RoutesStore()
    const matchers = { id: { match: /^\d+$/, cast: Number } }
    addRoute(store, '/:id', { matchers })
    addRoute(store, '/users')

    assert.deepEqual(store.match('/42', 'GET', false)?.params, { id: 42 })
    assert.equal(store.match('/users', 'GET', false)?.route.pattern, '/users')
  })

  test('match the same route as matchit across generated route orders and path spellings', ({
    assert,
  }) => {
    const routeDefinitions = [
      { pattern: '/' },
      { pattern: '' },
      { pattern: '//' },
      { pattern: '///' },
      { pattern: '////' },
      { pattern: '/users' },
      { pattern: 'users/' },
      { pattern: '/users//' },
      { pattern: '/users///' },
      { pattern: '//users' },
      { pattern: '/teams//users' },
      { pattern: '/:value' },
      { pattern: '/:value?' },
      { pattern: '/*' },
      { pattern: '/teams/:id', matchers: { id: { match: /^\d+$/, cast: Number } } },
      { pattern: '/teams/:id?' },
      { pattern: '/teams/*' },
    ]
    const pathnames = [
      '',
      '/',
      '//',
      '///',
      '////',
      'users',
      '/users',
      '/users/',
      '/users//',
      '//users',
      '/teams/users',
      '/teams//users',
      '/teams/42',
      '/teams/Romain%20Lanz',
      '/teams/42/members',
      '/missing',
    ]

    let seed = 42
    function random() {
      seed = (seed * 1_664_525 + 1_013_904_223) >>> 0
      return seed / 2 ** 32
    }

    function captureMatch(callback: () => null | MatchedRoute) {
      try {
        const match = callback()
        return match
          ? {
              status: 'matched',
              routePattern: match.route.pattern,
              routeKey: match.routeKey,
              params: match.params,
            }
          : { status: 'missing' }
      } catch (error) {
        return {
          status: 'threw',
          errorName: (error as Error).constructor.name,
          errorMessage: (error as Error).message,
        }
      }
    }

    for (let iteration = 0; iteration < 250; iteration++) {
      const shuffled = routeDefinitions.slice()
      for (let index = shuffled.length - 1; index > 0; index--) {
        const swapIndex = Math.floor(random() * (index + 1))
        ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
      }

      const definitions = shuffled.slice(0, 1 + Math.floor(random() * 12))
      const tokenLists = definitions.map(({ pattern, matchers }) => parseRoute(pattern, matchers))
      const store = new RoutesStore()
      definitions.forEach(({ pattern, matchers = {} }, index) => {
        addRoute(store, pattern, { tokens: tokenLists[index], matchers })
      })

      for (const [pathnameIndex, pathname] of pathnames.entries()) {
        const shouldDecodeParam = pathnameIndex % 2 === 0
        const expected = captureMatch(() => {
          const matchedTokens = matchit.match(pathname, tokenLists)
          if (!matchedTokens.length) {
            return null
          }

          const pattern = matchedTokens[0].old
          return {
            route: { pattern },
            routeKey: `GET-${pattern}`,
            params: matchit.exec(pathname, matchedTokens, shouldDecodeParam),
          } as MatchedRoute
        })
        const actual = captureMatch(() => store.match(pathname, 'GET', shouldDecodeParam))

        assert.deepEqual(
          actual,
          expected,
          JSON.stringify({ definitions: definitions.map(({ pattern }) => pattern), pathname })
        )
      }
    }
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
