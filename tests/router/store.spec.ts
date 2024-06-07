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
import { execute } from '../../src/router/executor.js'
import { RoutesStore } from '../../src/router/store.js'

test.group('Store | add', () => {
  test('add route without explicit domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })

    assert.deepEqual(store.tree, {
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
                execute,
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
      methods: ['GET'],
      meta: {},
      handler: handler,
      matchers: {},
      domain: 'foo.com',
      execute,
      middleware: new Middleware<any>(),
    })

    assert.deepEqual(store.tree, {
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
                execute,
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

    assert.deepEqual(store.tree, {
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
                execute,
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
                execute,
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

    assert.deepEqual(store.tree, {
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
                execute,
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
                execute,
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
      methods: ['GET', 'POST'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })

    assert.deepEqual(store.tree, {
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
                execute,
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
                execute,
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
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'root',
    })

    assert.deepEqual(store.tree, {
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
                execute,
                middleware: new Middleware<any>(),
              },
              'users/:id': {
                pattern: 'users/:id',
                meta: {
                  params: ['id'],
                },
                handler,
                execute,
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
  test('find route for a given url', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/',
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/', 'GET'), {
      route: {
        pattern: '/',
        handler,
        execute,
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

  test('find route for a given url - pattern priority over route with params', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()

    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/user',
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/user', 'GET'), {
      route: {
        pattern: '/user',
        handler,
        execute,
        middleware: new Middleware<any>(),
        meta: {
          params: [],
        },
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/user',
    })

    assert.deepEqual(store.match('/USER', 'GET'), {
      route: {
        pattern: '/user',
        handler,
        execute,
        middleware: new Middleware<any>(),
        meta: {
          params: [],
        },
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/user',
    })

    assert.deepEqual(store.match('/12345', 'GET'), {
      route: {
        pattern: '/:id',
        handler,
        execute,
        middleware: new Middleware<any>(),
        meta: {
          params: ['id'],
        },
      },
      params: {
        id: '12345',
      },
      subdomains: {},
      routeKey: 'GET-/:id',
    })
  })

  test('find route and parse route params', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/virk', 'GET'), {
      route: {
        pattern: '/:username',
        handler,
        execute,
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
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/virk', 'GET'), {
      route: {
        pattern: '/:username?',
        handler,
        meta: {
          params: ['username'],
        },
        execute,
        middleware: new Middleware<any>(),
      },
      params: {
        username: 'virk',
      },
      subdomains: {},
      routeKey: 'GET-/:username?',
    })

    assert.deepEqual(store.match('/', 'GET'), {
      route: {
        pattern: '/:username?',
        handler,
        execute,
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
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/1', 'GET'), {
      route: {
        pattern: '/:username',
        handler,
        execute,
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

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      handler,
      meta: {},
      matchers: {
        username: { match: new RegExp(/[a-z]+/) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/:id',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/1', 'GET'), {
      route: {
        pattern: '/:id',
        handler,
        meta: {
          params: ['id'],
        },
        execute,
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
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: 'foo.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('foo.com')
    assert.deepEqual(
      store.match('/1', 'GET', {
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
          execute,
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
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      domain: ':subdomain.adonisjs.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('blog.adonisjs.com')
    assert.deepEqual(
      store.match('/1', 'GET', {
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
          execute,
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
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.isNull(store.match('/1', 'POST'))
  })

  test('return null when unable to match the domain', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.isNull(
      store.match('/1', 'POST', {
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
      handler,
      matchers: {},
      meta: {},
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.isNull(store.match('/hello', 'GET'))
  })

  test('do not match param against regex when param is optional and missing', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/users/:id?',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/^[0-9]+$/) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/users', 'GET'), {
      route: {
        pattern: '/users/:id?',
        handler,
        meta: {
          params: ['id'],
        },
        execute,
        middleware: new Middleware<any>(),
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/users/:id?',
    })
  })

  test('match param against regex when param is optional but defined in url', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/users/:id?',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/^[0-9]+$/) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/users/1', 'GET'), {
      route: {
        pattern: '/users/:id?',
        handler,
        meta: {
          params: ['id'],
        },
        execute,
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

    const store = new RoutesStore()
    store.add({
      pattern: '/:username',
      handler,
      meta: {},
      matchers: {
        username: { match: new RegExp(/[a-z]+/) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    store.add({
      pattern: '/:id',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/), cast: (value) => Number(value) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/1', 'GET'), {
      route: {
        pattern: '/:id',
        handler,
        meta: {
          params: ['id'],
        },
        execute,
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

    const store = new RoutesStore()
    store.add({
      pattern: '/:id?',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/), cast: (value) => Number(value) },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/', 'GET'), {
      route: {
        pattern: '/:id?',
        handler,
        meta: {
          params: ['id'],
        },
        execute,
        middleware: new Middleware<any>(),
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/:id?',
    })
  })

  test('cast multiple params', ({ assert }) => {
    async function handler() {}

    const store = new RoutesStore()
    store.add({
      pattern: '/:id/:slug',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/), cast: (value) => Number(value) },
        slug: { cast: (value) => value.toLowerCase() },
      },
      execute,
      middleware: new Middleware<any>(),
      methods: ['GET'],
      domain: 'root',
    })

    assert.deepEqual(store.match('/1/HELLO-WORLD', 'GET'), {
      route: {
        pattern: '/:id/:slug',
        handler,
        meta: {
          params: ['id', 'slug'],
        },
        execute,
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
