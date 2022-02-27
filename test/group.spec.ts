/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Route } from '../src/Router/Route'
import { toRoutesJSON } from '../src/helpers'
import { RouteGroup } from '../src/Router/Group'
import { RouteResource } from '../src/Router/Resource'

test.group('Route Group', () => {
  test('add matcher for the given route', ({ assert }) => {
    async function handler() {}

    const group = new RouteGroup([new Route('/:id', ['GET'], handler, {})])
    group.where('id', '[a-z]')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {
          id: { match: new RegExp('[a-z]') },
        },
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        name: undefined,
        handler,
      },
    ])
  })

  test('prepend middleware to existing route middleware', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    route.middleware('auth')

    const group = new RouteGroup([route])
    group.middleware('limitter')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: ['limitter', 'auth'],
        handler,
        name: undefined,
      },
    ])
  })

  test('keep group own middleware in right order', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    route.middleware('auth')

    const group = new RouteGroup([route])
    group.middleware('limitter')
    group.middleware('acl')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: ['limitter', 'acl', 'auth'],
        handler,
        name: undefined,
      },
    ])
  })

  test('define middleware on nested group, route and resource', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    route.middleware('log')

    const resource = new RouteResource('posts', 'PostsController', {})
    resource
      .middleware({
        '*': ['log'],
      })
      .middleware({
        create: ['logGet'],
        index: ['logGet'],
        show: ['logGet'],
      })
      .middleware({
        create: ['logGet', 'logForm'],
        store: ['logPost', 'logForm'],
      })

    const group = new RouteGroup([route, resource])
    group.middleware('limitter')
    group.middleware('acl')

    const route1 = new Route('1/:id', ['GET'], handler, {})
    route1.middleware('log')

    const outerGroup = new RouteGroup([group, route1])
    outerGroup.middleware('auth')
    outerGroup.middleware('impersonate')

    assert.deepEqual(toRoutesJSON(outerGroup.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log'],
        handler,
        name: undefined,
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log', 'logGet'],
        handler: 'PostsController.index',
        name: 'posts.index',
      },
      {
        pattern: '/posts/create',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [
          'auth',
          'impersonate',
          'limitter',
          'acl',
          'log',
          'logGet',
          'logGet',
          'logForm',
        ],
        handler: 'PostsController.create',
        name: 'posts.create',
      },
      {
        pattern: '/posts',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['POST'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log', 'logPost', 'logForm'],
        handler: 'PostsController.store',
        name: 'posts.store',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log', 'logGet'],
        handler: 'PostsController.show',
        name: 'posts.show',
      },
      {
        pattern: '/posts/:id/edit',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log'],
        handler: 'PostsController.edit',
        name: 'posts.edit',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log'],
        handler: 'PostsController.update',
        name: 'posts.update',
      },
      {
        pattern: '/posts/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['DELETE'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'limitter', 'acl', 'log'],
        handler: 'PostsController.destroy',
        name: 'posts.destroy',
      },
      {
        pattern: '/1/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: ['auth', 'impersonate', 'log'],
        handler,
        name: undefined,
      },
    ])
  })

  test('prepend name to the existing route names', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    route.as('list')

    const group = new RouteGroup([route])
    group.as('v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: 'v1.list',
      },
    ])
  })

  test('define routes prefix', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    const group = new RouteGroup([route])
    group.prefix('api/v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/api/v1/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })

  test('define routes domain', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    const group = new RouteGroup([route])
    group.domain('adonisjs.com')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['GET'],
        domain: 'adonisjs.com',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })

  test('define resource inside the group', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    const group = new RouteGroup([resource])

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/photos',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.index',
        name: 'photos.index',
      },
      {
        pattern: '/photos/create',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.create',
        name: 'photos.create',
      },
      {
        pattern: '/photos',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.store',
        name: 'photos.store',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.show',
        name: 'photos.show',
      },
      {
        pattern: '/photos/:id/edit',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.edit',
        name: 'photos.edit',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.update',
        name: 'photos.update',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['DELETE'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.destroy',
        name: 'photos.destroy',
      },
    ])
  })

  test('prepend name to the route resource', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    const group = new RouteGroup([resource])
    group.as('v1')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/photos',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.index',
        name: 'v1.photos.index',
      },
      {
        pattern: '/photos/create',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.create',
        name: 'v1.photos.create',
      },
      {
        pattern: '/photos',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['POST'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.store',
        name: 'v1.photos.store',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.show',
        name: 'v1.photos.show',
      },
      {
        pattern: '/photos/:id/edit',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['HEAD', 'GET'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.edit',
        name: 'v1.photos.edit',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['PUT', 'PATCH'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.update',
        name: 'v1.photos.update',
      },
      {
        pattern: '/photos/:id',
        matchers: {},
        meta: {
          namespace: undefined,
        },
        methods: ['DELETE'],
        domain: 'root',
        middleware: [],
        handler: 'PhotosController.destroy',
        name: 'v1.photos.destroy',
      },
    ])
  })

  test('define routes namespace', ({ assert }) => {
    async function handler() {}

    const route = new Route('/:id', ['GET'], handler, {})
    const group = new RouteGroup([route])
    group.namespace('Admin/Controllers/Http')

    assert.deepEqual(toRoutesJSON(group.routes), [
      {
        pattern: '/:id',
        matchers: {},
        meta: {
          namespace: 'Admin/Controllers/Http',
        },
        methods: ['GET'],
        domain: 'root',
        middleware: [],
        handler,
        name: undefined,
      },
    ])
  })
})
