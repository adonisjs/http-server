/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Store } from '../src/Router/Store'

test.group('Store | add', () => {
  test('add route without explicit domain', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/',
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      middleware: [],
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
                meta: {},
                handler,
                params: [],
                middleware: [],
              },
            },
          },
        },
      },
    })
  })

  test('add route with custom domain', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/',
      methods: ['GET'],
      meta: {},
      handler: handler,
      matchers: {},
      domain: 'foo.com',
      middleware: [],
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
                meta: {},
                handler,
                middleware: [],
                params: [],
              },
            },
          },
        },
      },
    })
  })

  test('raise error when route has duplicate pattern', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/',
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      middleware: [],
    }

    const store = new Store()
    store.add(route)

    const fn = () => store.add(route)
    assert.throws(fn, 'E_DUPLICATE_ROUTE: Duplicate route "GET:/"')
  })

  test('raise error when two params have the same name', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/:id/:id',
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      middleware: [],
    }

    const store = new Store()
    const fn = () => store.add(route)
    assert.throws(
      fn,
      'E_DUPLICATE_ROUTE_PARAM: The "id" param is mentioned twice in the route pattern "/:id/:id"'
    )
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
      middleware: [],
    }

    const store = new Store()
    const fn = () => store.add(route)
    assert.doesNotThrows(fn)
  })

  test('work fine when pattern is same but method is different', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/',
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      middleware: [],
    }

    const store = new Store()
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
                meta: {},
                handler,
                params: [],
                middleware: [],
              },
            },
          },
          POST: {
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
                meta: {},
                handler,
                params: [],
                middleware: [],
              },
            },
          },
        },
      },
    })
  })

  test('work fine when pattern is same but domain is different', ({ assert }) => {
    async function handler() {}
    const route = {
      pattern: '/',
      methods: ['GET'],
      handler: handler,
      matchers: {},
      meta: {},
      domain: 'foo.com',
      middleware: [],
    }

    const store = new Store()
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
                meta: {},
                handler,
                params: [],
                middleware: [],
              },
            },
          },
        },
        'root': {
          GET: {
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
                meta: {},
                handler,
                params: [],
                middleware: [],
              },
            },
          },
        },
      },
    })
  })

  test('add route for multiple methods', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:id',
      methods: ['GET', 'POST'],
      handler: handler,
      matchers: {},
      meta: {},
      middleware: [],
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
                meta: {},
                handler,
                params: ['id'],
                middleware: [],
              },
            },
          },
          POST: {
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
                meta: {},
                handler,
                params: ['id'],
                middleware: [],
              },
            },
          },
        },
      },
    })
  })
})

test.group('Store | match', () => {
  test('match url for given method', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/', 'GET'), {
      route: {
        pattern: '/',
        handler,
        params: [],
        middleware: [],
        meta: {},
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/',
    })
  })

  test('match url with params', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/virk', 'GET'), {
      route: {
        pattern: '/:username',
        handler,
        params: ['username'],
        middleware: [],
        meta: {},
      },
      params: {
        username: 'virk',
      },
      subdomains: {},
      routeKey: 'GET-/:username',
    })
  })

  test('match url with optional params', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username?',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/virk', 'GET'), {
      route: {
        pattern: '/:username?',
        handler,
        meta: {},
        params: ['username'],
        middleware: [],
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
        params: ['username'],
        middleware: [],
        meta: {},
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/:username?',
    })
  })

  test('match routes from top to bottom', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/virk', 'GET'), {
      route: {
        pattern: '/:username',
        handler,
        params: ['username'],
        middleware: [],
        meta: {},
      },
      params: {
        username: 'virk',
      },
      subdomains: {},
      routeKey: 'GET-/:username',
    })
  })

  test('test url against matchers', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      meta: {},
      matchers: {
        username: { match: new RegExp(/[a-z]+/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    store.add({
      pattern: '/:id',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/1', 'GET'), {
      route: {
        pattern: '/:id',
        handler,
        meta: {},
        params: ['id'],
        middleware: [],
      },
      params: {
        id: '1',
      },
      subdomains: {},
      routeKey: 'GET-/:id',
    })
  })

  test('match domain for urls', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      domain: 'foo.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('foo.com')
    assert.deepEqual(
      store.match('/1', 'GET', {
        storeMatch: domain,
        value: 'foo.com',
      }),
      {
        route: {
          pattern: '/:id',
          handler,
          meta: {},
          params: ['id'],
          middleware: [],
        },
        params: {
          id: '1',
        },
        subdomains: {},
        routeKey: 'foo.com-GET-/:id',
      }
    )
  })

  test('match for dynamic domains', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      domain: ':subdomain.adonisjs.com',
      methods: ['GET'],
    })

    const domain = store.matchDomain('blog.adonisjs.com')
    assert.deepEqual(
      store.match('/1', 'GET', {
        storeMatch: domain,
        value: 'blog.adonisjs.com',
      }),
      {
        route: {
          pattern: '/:id',
          handler,
          meta: {},
          params: ['id'],
          middleware: [],
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

  test('return empty array when unable to match the route domain', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
      domain: 'foo.adonisjs.com',
    })

    assert.deepEqual(store.matchDomain('blog.adonisjs.com'), [])
  })

  test('return null when unable to match the method', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:id',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    assert.isNull(store.match('/1', 'POST'))
  })

  test('return null when unable to match the route url', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/',
      handler,
      matchers: {},
      meta: {},
      middleware: [],
      methods: ['GET'],
    })

    assert.isNull(store.match('/hello', 'GET'))
  })

  test('do not execute regex when param is optional and missing', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/users/:id?',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/^[0-9]+$/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/users', 'GET'), {
      route: {
        pattern: '/users/:id?',
        handler,
        meta: {},
        params: ['id'],
        middleware: [],
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/users/:id?',
    })
  })

  test('do execute regex when param is optional and defined in url', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/users/:id?',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/^[0-9]+$/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/users/1', 'GET'), {
      route: {
        pattern: '/users/:id?',
        handler,
        meta: {},
        params: ['id'],
        middleware: [],
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

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      meta: {},
      matchers: {
        username: { match: new RegExp(/[a-z]+/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    store.add({
      pattern: '/:id',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/), cast: (value) => Number(value) },
      },
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/1', 'GET'), {
      route: {
        pattern: '/:id',
        handler,
        meta: {},
        params: ['id'],
        middleware: [],
      },
      params: {
        id: 1,
      },
      subdomains: {},
      routeKey: 'GET-/:id',
    })
  })

  test('do not cast optional params', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      meta: {},
      matchers: {
        username: { match: new RegExp(/[a-z]+/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    store.add({
      pattern: '/:id?',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/), cast: (value) => Number(value) },
      },
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/', 'GET'), {
      route: {
        pattern: '/:id?',
        handler,
        meta: {},
        params: ['id'],
        middleware: [],
      },
      params: {},
      subdomains: {},
      routeKey: 'GET-/:id?',
    })
  })

  test('cast multiple params', ({ assert }) => {
    async function handler() {}

    const store = new Store()
    store.add({
      pattern: '/:username',
      handler,
      meta: {},
      matchers: {
        username: { match: new RegExp(/[a-z]+/) },
      },
      middleware: [],
      methods: ['GET'],
    })

    store.add({
      pattern: '/:id/:slug',
      handler,
      meta: {},
      matchers: {
        id: { match: new RegExp(/[0-9]+/), cast: (value) => Number(value) },
        slug: { cast: (value) => value.toLowerCase() },
      },
      middleware: [],
      methods: ['GET'],
    })

    assert.deepEqual(store.match('/1/HELLO-WORLD', 'GET'), {
      route: {
        pattern: '/:id/:slug',
        handler,
        meta: {},
        params: ['id', 'slug'],
        middleware: [],
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
