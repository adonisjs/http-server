/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Route } from '../src/Router/Route'

test.group('Route', () => {
  test('create a basic route', (assert) => {
    async function handler () {}
    const route = new Route('/', ['GET'], handler, {})

    assert.deepEqual(route.toJSON(), {
      pattern: '/',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('prefix route', (assert) => {
    async function handler () {}
    const route = new Route('/', ['GET'], handler, {})
    route.prefix('admin')

    assert.deepEqual(route.toJSON(), {
      pattern: '/admin',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('handle leading slash in pattern', (assert) => {
    async function handler () {}
    const route = new Route('/blog', ['GET'], handler, {})

    assert.deepEqual(route.toJSON(), {
      pattern: '/blog',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('handle leading slash in pattern along with prefix', (assert) => {
    async function handler () {}
    const route = new Route('/blog', ['GET'], handler, {})
    route.prefix('admin')

    assert.deepEqual(route.toJSON(), {
      pattern: '/admin/blog',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define matchers for params', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {})
    route.where('id', '^[a-z]+$')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {
        id: /^[a-z]+$/,
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define global matchers for params', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {
      id: /^[a-z]+$/,
    })

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {
        id: /^[a-z]+$/,
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('give preference to local matcher over global', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {
      id: /^[a-z]+$/,
    })
    route.where('id', '(.*)')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {
        id: /(.*)/,
      },
      domain: 'root',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define route domain', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {})
    route.domain('foo.com')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'foo.com',
      handler,
      name: undefined,
      middleware: [],
    })
  })

  test('define an array of route middleware', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {})
    route.middleware(['auth', 'acl:admin'])

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: ['auth', 'acl:admin'],
    })
  })

  test('define route middleware as a string', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {})
    route.middleware('auth')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      name: undefined,
      middleware: ['auth'],
    })
  })

  test('give name to the route', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {})
    route.as('showPost')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: undefined,
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      middleware: [],
      name: 'showPost',
    })
  })

  test('define route namespace', (assert) => {
    async function handler () {}
    const route = new Route('posts/:id', ['GET'], handler, {})
    route.namespace('App/Controllers')

    assert.deepEqual(route.toJSON(), {
      pattern: '/posts/:id',
      meta: {
        namespace: 'App/Controllers',
      },
      methods: ['GET'],
      matchers: {},
      domain: 'root',
      handler,
      middleware: [],
      name: undefined,
    })
  })
})
