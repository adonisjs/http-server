/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { RouteResource } from '../src/Router/Resource'

test.group('Route Resource', () => {
  test('add base resource routes', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/photos',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
      ]
    )
  })

  test('add base nested resource routes', ({ assert }) => {
    const resource = new RouteResource('magazines.ads', 'AdsController', {}, false)

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.index',
          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:magazine_id/ads/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.create',
          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          methods: ['POST'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'AdsController.store',
          name: 'magazines.ads.store',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.show',
          name: 'magazines.ads.show',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.edit',
          name: 'magazines.ads.edit',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id',
          matchers: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'AdsController.update',
          name: 'magazines.ads.update',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id',
          matchers: {},
          methods: ['DELETE'],
          meta: {
            namespace: undefined,
          },
          domain: 'root',
          middleware: [],
          handler: 'AdsController.destroy',
          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('add shallow nested resource routes', ({ assert }) => {
    const resource = new RouteResource('magazines.ads', 'AdsController', {}, true)

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.index',
          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:magazine_id/ads/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.create',
          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          methods: ['POST'],
          meta: {
            namespace: undefined,
          },
          domain: 'root',
          middleware: [],
          handler: 'AdsController.store',
          name: 'magazines.ads.store',
        },
        {
          pattern: '/ads/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.show',
          name: 'magazines.ads.show',
        },
        {
          pattern: '/ads/:id/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.edit',
          name: 'magazines.ads.edit',
        },
        {
          pattern: '/ads/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.update',
          name: 'magazines.ads.update',
        },
        {
          pattern: '/ads/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['DELETE'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.destroy',
          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('mark non-api routes deleted', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.apiOnly()

    assert.isTrue(resource.routes.find((route) => route.name === 'photos.create')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.edit')!.deleted)
  })

  test("mark all other routes as deleted except defined one's", ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.only(['index', 'show'])

    assert.isFalse(resource.routes.find((route) => route.name === 'photos.index')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.create')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.store')!.deleted)
    assert.isFalse(resource.routes.find((route) => route.name === 'photos.show')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.edit')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.update')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.destroy')!.deleted)
  })

  test('mark all defined as delete', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.except(['index', 'show'])

    assert.isTrue(resource.routes.find((route) => route.name === 'photos.index')!.deleted)
    assert.isFalse(resource.routes.find((route) => route.name === 'photos.create')!.deleted)
    assert.isFalse(resource.routes.find((route) => route.name === 'photos.store')!.deleted)
    assert.isTrue(resource.routes.find((route) => route.name === 'photos.show')!.deleted)
    assert.isFalse(resource.routes.find((route) => route.name === 'photos.edit')!.deleted)
    assert.isFalse(resource.routes.find((route) => route.name === 'photos.update')!.deleted)
    assert.isFalse(resource.routes.find((route) => route.name === 'photos.destroy')!.deleted)
  })

  test('define middleware on routes', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.middleware({
      create: ['auth'],
      store: ['auth', 'acl:admin'],
    })

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.index')!.toJSON().middleware,
      []
    )

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.create')!.toJSON().middleware,
      ['auth']
    )

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.store')!.toJSON().middleware,
      ['auth', 'acl:admin']
    )

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.show')!.toJSON().middleware,
      []
    )

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.edit')!.toJSON().middleware,
      []
    )

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.update')!.toJSON().middleware,
      []
    )

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.destroy')!.toJSON().middleware,
      []
    )
  })

  test('define matcher for params', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.where('id', '[a-z]')

    assert.deepEqual(resource.routes.find((route) => route.name === 'photos.index')!['matchers'], {
      id: { match: /[a-z]/ },
    })

    assert.deepEqual(resource.routes.find((route) => route.name === 'photos.create')!['matchers'], {
      id: { match: /[a-z]/ },
    })

    assert.deepEqual(resource.routes.find((route) => route.name === 'photos.store')!['matchers'], {
      id: { match: /[a-z]/ },
    })

    assert.deepEqual(resource.routes.find((route) => route.name === 'photos.show')!['matchers'], {
      id: { match: /[a-z]/ },
    })

    assert.deepEqual(resource.routes.find((route) => route.name === 'photos.edit')!['matchers'], {
      id: { match: /[a-z]/ },
    })

    assert.deepEqual(resource.routes.find((route) => route.name === 'photos.update')!['matchers'], {
      id: { match: /[a-z]/ },
    })

    assert.deepEqual(
      resource.routes.find((route) => route.name === 'photos.destroy')!['matchers'],
      {
        id: { match: /[a-z]/ },
      }
    )
  })

  test('define namespace for all routes', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.namespace('Admin/Controllers')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON().meta.namespace),
      [
        'Admin/Controllers',
        'Admin/Controllers',
        'Admin/Controllers',
        'Admin/Controllers',
        'Admin/Controllers',
        'Admin/Controllers',
        'Admin/Controllers',
      ]
    )
  })

  test('normalize resource name by dropping starting and ending slashes', ({ assert }) => {
    const resource = new RouteResource('/photos/', 'PhotosController', {})

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/photos',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
      ]
    )
  })

  test('create proper route name when resource name is in dash-case', ({ assert }) => {
    const resource = new RouteResource('user-profile', 'ProfileController', {})

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/user-profile',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.index',
          name: 'user_profile.index',
        },
        {
          pattern: '/user-profile/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.create',
          name: 'user_profile.create',
        },
        {
          pattern: '/user-profile',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['POST'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.store',
          name: 'user_profile.store',
        },
        {
          pattern: '/user-profile/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.show',
          name: 'user_profile.show',
        },
        {
          pattern: '/user-profile/:id/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.edit',
          name: 'user_profile.edit',
        },
        {
          pattern: '/user-profile/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.update',
          name: 'user_profile.update',
        },
        {
          pattern: '/user-profile/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['DELETE'],
          domain: 'root',
          middleware: [],
          handler: 'ProfileController.destroy',
          name: 'user_profile.destroy',
        },
      ]
    )
  })

  test('create proper param name when nested resource name is in dash-case', ({ assert }) => {
    const resource = new RouteResource('user-profile.comments', 'CommentsController', {})

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/user-profile/:user_profile_id/comments',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.index',
          name: 'user_profile.comments.index',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.create',
          name: 'user_profile.comments.create',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['POST'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.store',
          name: 'user_profile.comments.store',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.show',
          name: 'user_profile.comments.show',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.edit',
          name: 'user_profile.comments.edit',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.update',
          name: 'user_profile.comments.update',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['DELETE'],
          domain: 'root',
          middleware: [],
          handler: 'CommentsController.destroy',
          name: 'user_profile.comments.destroy',
        },
      ]
    )
  })

  test('define middleware with wildcard', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.middleware({ '*': ['auth'] })

    const registeredMiddleware = resource.routes.reduce((result, route) => {
      result[route.name] = route.toJSON().middleware
      return result
    }, {})

    assert.deepEqual(registeredMiddleware, {
      'photos.index': ['auth'],
      'photos.create': ['auth'],
      'photos.store': ['auth'],
      'photos.show': ['auth'],
      'photos.edit': ['auth'],
      'photos.update': ['auth'],
      'photos.destroy': ['auth'],
    })
  })

  test('define middleware with wildcard and for select routes', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.middleware({ '*': ['auth'], 'update': ['self'] })

    const registeredMiddleware = resource.routes.reduce((result, route) => {
      result[route.name] = route.toJSON().middleware
      return result
    }, {})

    assert.deepEqual(registeredMiddleware, {
      'photos.index': ['auth'],
      'photos.create': ['auth'],
      'photos.store': ['auth'],
      'photos.show': ['auth'],
      'photos.edit': ['auth'],
      'photos.update': ['auth', 'self'],
      'photos.destroy': ['auth'],
    })
  })

  test('define resource name', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.as('public-photos')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON().name),
      [
        'public_photos.index',
        'public_photos.create',
        'public_photos.store',
        'public_photos.show',
        'public_photos.edit',
        'public_photos.update',
        'public_photos.destroy',
      ]
    )
  })

  test('allow re-defining resource name for multiple times', ({ assert }) => {
    const resource = new RouteResource('main-photos', 'PhotosController', {})
    resource.as('public-photos').as('photos')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON().name),
      [
        'photos.index',
        'photos.create',
        'photos.store',
        'photos.show',
        'photos.edit',
        'photos.update',
        'photos.destroy',
      ]
    )
  })

  test('rename the resource param', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.paramFor('photos', 'photo')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/photos',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
          pattern: '/photos/:photo',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'PhotosController.show',
          name: 'photos.show',
        },
        {
          pattern: '/photos/:photo/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'PhotosController.edit',
          name: 'photos.edit',
        },
        {
          pattern: '/photos/:photo',
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
          pattern: '/photos/:photo',
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
      ]
    )
  })

  test('renaming the resource param multiple times should work', ({ assert }) => {
    const resource = new RouteResource('photos', 'PhotosController', {})
    resource.paramFor('photos', 'photo')
    resource.paramFor('photos', 'photo(slug)')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/photos',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
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
          methods: ['GET', 'HEAD'],
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
          pattern: '/photos/:photo(slug)',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'PhotosController.show',
          name: 'photos.show',
        },
        {
          pattern: '/photos/:photo(slug)/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'PhotosController.edit',
          name: 'photos.edit',
        },
        {
          pattern: '/photos/:photo(slug)',
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
          pattern: '/photos/:photo(slug)',
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
      ]
    )
  })

  test('define custom param name for nested resource', ({ assert }) => {
    const resource = new RouteResource('magazines.ads', 'AdsController', {}, false)
    resource.paramFor('magazines', 'mag')
    resource.paramFor('ads', 'ad')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.index',
          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:mag/ads/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.create',
          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          methods: ['POST'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'AdsController.store',
          name: 'magazines.ads.store',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.show',
          name: 'magazines.ads.show',
        },
        {
          pattern: '/magazines/:mag/ads/:ad/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.edit',
          name: 'magazines.ads.edit',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'AdsController.update',
          name: 'magazines.ads.update',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          methods: ['DELETE'],
          meta: {
            namespace: undefined,
          },
          domain: 'root',
          middleware: [],
          handler: 'AdsController.destroy',
          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('nested resource param renaming should not impact the parent resource', ({ assert }) => {
    const mag = new RouteResource('magazines', 'MagazinesController', {}, false)
    mag.paramFor('magazines', 'magazine')

    const resource = new RouteResource('magazines.ads', 'AdsController', {}, false)
    resource.paramFor('magazines', 'mag')
    resource.paramFor('ads', 'ad')

    assert.deepEqual(
      mag.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'MagazinesController.index',
          name: 'magazines.index',
        },
        {
          pattern: '/magazines/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'MagazinesController.create',
          name: 'magazines.create',
        },
        {
          pattern: '/magazines',
          matchers: {},
          methods: ['POST'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'MagazinesController.store',
          name: 'magazines.store',
        },
        {
          pattern: '/magazines/:magazine',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'MagazinesController.show',
          name: 'magazines.show',
        },
        {
          pattern: '/magazines/:magazine/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'MagazinesController.edit',
          name: 'magazines.edit',
        },
        {
          pattern: '/magazines/:magazine',
          matchers: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'MagazinesController.update',
          name: 'magazines.update',
        },
        {
          pattern: '/magazines/:magazine',
          matchers: {},
          methods: ['DELETE'],
          meta: {
            namespace: undefined,
          },
          domain: 'root',
          middleware: [],
          handler: 'MagazinesController.destroy',
          name: 'magazines.destroy',
        },
      ]
    )

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.index',
          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:mag/ads/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.create',
          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          methods: ['POST'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'AdsController.store',
          name: 'magazines.ads.store',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.show',
          name: 'magazines.ads.show',
        },
        {
          pattern: '/magazines/:mag/ads/:ad/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.edit',
          name: 'magazines.ads.edit',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          meta: {
            namespace: undefined,
          },
          middleware: [],
          handler: 'AdsController.update',
          name: 'magazines.ads.update',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          methods: ['DELETE'],
          meta: {
            namespace: undefined,
          },
          domain: 'root',
          middleware: [],
          handler: 'AdsController.destroy',
          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('rename param name for a shallow resource', ({ assert }) => {
    const resource = new RouteResource('magazines.ads', 'AdsController', {}, true)
    resource.paramFor('magazines', 'mag')
    resource.paramFor('ads', 'ad')

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.index',
          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:mag/ads/create',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.create',
          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          methods: ['POST'],
          meta: {
            namespace: undefined,
          },
          domain: 'root',
          middleware: [],
          handler: 'AdsController.store',
          name: 'magazines.ads.store',
        },
        {
          pattern: '/ads/:ad',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.show',
          name: 'magazines.ads.show',
        },
        {
          pattern: '/ads/:ad/edit',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['GET', 'HEAD'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.edit',
          name: 'magazines.ads.edit',
        },
        {
          pattern: '/ads/:ad',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.update',
          name: 'magazines.ads.update',
        },
        {
          pattern: '/ads/:ad',
          matchers: {},
          meta: {
            namespace: undefined,
          },
          methods: ['DELETE'],
          domain: 'root',
          middleware: [],
          handler: 'AdsController.destroy',
          name: 'magazines.ads.destroy',
        },
      ]
    )
  })
})
