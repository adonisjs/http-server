/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { AppFactory } from '@adonisjs/application/test_factories/app'

import { RouteResource } from '../../src/router/resource.js'

const BASE_URL = new URL('./app/', import.meta.url)

test.group('Route Resource', () => {
  test('define resource routes', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
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
      ]
    )
  })

  test('cleanup leading and trailing slashes', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: '/photos/',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
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
      ]
    )
  })

  test('define resource with a parent path', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'v1/photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/v1/photos',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'v_1_photos.index',
        },
        {
          pattern: '/v1/photos/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'v_1_photos.create',
        },
        {
          pattern: '/v1/photos',
          matchers: {},
          meta: {},
          methods: ['POST'],
          domain: 'root',

          name: 'v_1_photos.store',
        },
        {
          pattern: '/v1/photos/:id',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'v_1_photos.show',
        },
        {
          pattern: '/v1/photos/:id/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'v_1_photos.edit',
        },
        {
          pattern: '/v1/photos/:id',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',

          name: 'v_1_photos.update',
        },
        {
          pattern: '/v1/photos/:id',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',

          name: 'v_1_photos.destroy',
        },
      ]
    )
  })

  test('raise error when resource name is a slash', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)

    assert.throws(
      () =>
        new RouteResource(app, [], {
          resource: '/',
          controller: '#controllers/photos',
          globalMatchers: {},
          shallow: false,
        }),
      'Invalid resource name "/"'
    )
  })

  test('define nested resource routes', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'magazines.ads',
      controller: '#controllers/ads',
      globalMatchers: {},
      shallow: false,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:magazine_id/ads/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          methods: ['POST'],
          domain: 'root',
          meta: {},

          name: 'magazines.ads.store',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.show',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.edit',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id',
          matchers: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          meta: {},

          name: 'magazines.ads.update',
        },
        {
          pattern: '/magazines/:magazine_id/ads/:id',
          matchers: {},
          methods: ['DELETE'],
          meta: {},
          domain: 'root',

          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('add shallow nested resource routes', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'magazines.ads',
      controller: '#controllers/ads',
      globalMatchers: {},
      shallow: true,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:magazine_id/ads/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:magazine_id/ads',
          matchers: {},
          methods: ['POST'],
          meta: {},
          domain: 'root',

          name: 'magazines.ads.store',
        },
        {
          pattern: '/ads/:id',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.show',
        },
        {
          pattern: '/ads/:id/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.edit',
        },
        {
          pattern: '/ads/:id',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',

          name: 'magazines.ads.update',
        },
        {
          pattern: '/ads/:id',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',

          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('mark non-api routes deleted', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: true,
    })

    resource.apiOnly()

    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.create')!.isDeleted())
    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.edit')!.isDeleted())
  })

  test("mark all routes as deleted except the defined one's", ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: true,
    })
    resource.only(['index', 'show'])

    assert.isFalse(resource.routes.find((route) => route.getName() === 'photos.index')!.isDeleted())
    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.create')!.isDeleted())
    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.store')!.isDeleted())
    assert.isFalse(resource.routes.find((route) => route.getName() === 'photos.show')!.isDeleted())
    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.edit')!.isDeleted())
    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.update')!.isDeleted())
    assert.isTrue(
      resource.routes.find((route) => route.getName() === 'photos.destroy')!.isDeleted()
    )
  })

  test('mark routes for defined actions as deleted', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: true,
    })
    resource.except(['index', 'show'])

    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.index')!.isDeleted())
    assert.isFalse(
      resource.routes.find((route) => route.getName() === 'photos.create')!.isDeleted()
    )
    assert.isFalse(resource.routes.find((route) => route.getName() === 'photos.store')!.isDeleted())
    assert.isTrue(resource.routes.find((route) => route.getName() === 'photos.show')!.isDeleted())
    assert.isFalse(resource.routes.find((route) => route.getName() === 'photos.edit')!.isDeleted())
    assert.isFalse(
      resource.routes.find((route) => route.getName() === 'photos.update')!.isDeleted()
    )
    assert.isFalse(
      resource.routes.find((route) => route.getName() === 'photos.destroy')!.isDeleted()
    )
  })

  test('tap into route by action name', ({ assert }) => {
    assert.plan(1)

    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: true,
    })

    resource.tap('create', (route) => {
      assert.equal(route.getName()!, 'photos.create')
    })
  })

  test('tap into multiple routes by action names', ({ assert }) => {
    assert.plan(2)

    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: true,
    })

    resource.tap(['create', 'show'], (route) => {
      assert.oneOf(route.getName()!, ['photos.create', 'photos.show'])
    })
  })

  test('define matcher for params', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: true,
    })

    resource.where('id', '[a-z]')
    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.index')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )

    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.create')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )

    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.store')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )

    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.show')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )

    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.edit')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )

    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.update')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )

    assert.deepEqual(
      resource.routes.find((route) => route.getName() === 'photos.destroy')!.toJSON().matchers,
      {
        id: { match: /[a-z]/ },
      }
    )
  })

  test('create snake_case route names when resource name is in dash case', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'user-profile',
      controller: '#controllers/profile',
      globalMatchers: {},
      shallow: true,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/user-profile',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.index',
        },
        {
          pattern: '/user-profile/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.create',
        },
        {
          pattern: '/user-profile',
          matchers: {},
          meta: {},
          methods: ['POST'],
          domain: 'root',

          name: 'user_profile.store',
        },
        {
          pattern: '/user-profile/:id',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.show',
        },
        {
          pattern: '/user-profile/:id/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.edit',
        },
        {
          pattern: '/user-profile/:id',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',

          name: 'user_profile.update',
        },
        {
          pattern: '/user-profile/:id',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',

          name: 'user_profile.destroy',
        },
      ]
    )
  })

  test('create snake_case param and route names when nested resource name is in dash-case', ({
    assert,
  }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'user-profile.comments',
      controller: '#controllers/comments',
      globalMatchers: {},
      shallow: false,
    })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/user-profile/:user_profile_id/comments',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.comments.index',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.comments.create',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments',
          matchers: {},
          meta: {},
          methods: ['POST'],
          domain: 'root',

          name: 'user_profile.comments.store',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.comments.show',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'user_profile.comments.edit',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',

          name: 'user_profile.comments.update',
        },
        {
          pattern: '/user-profile/:user_profile_id/comments/:id',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',

          name: 'user_profile.comments.destroy',
        },
      ]
    )
  })

  test('define base prefix for resource route names', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

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
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'main-photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })
    assert.deepEqual(
      resource.routes.map((route) => route.toJSON().name),
      [
        'main_photos.index',
        'main_photos.create',
        'main_photos.store',
        'main_photos.show',
        'main_photos.edit',
        'main_photos.update',
        'main_photos.destroy',
      ]
    )

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

    resource.as('photos')
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

  test('do not normalize resource name', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'main-photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    assert.deepEqual(
      resource.routes.map((route) => route.toJSON().name),
      [
        'main_photos.index',
        'main_photos.create',
        'main_photos.store',
        'main_photos.show',
        'main_photos.edit',
        'main_photos.update',
        'main_photos.destroy',
      ]
    )

    resource.as('publicPhotos', false)
    assert.deepEqual(
      resource.routes.map((route) => route.toJSON().name),
      [
        'publicPhotos.index',
        'publicPhotos.create',
        'publicPhotos.store',
        'publicPhotos.show',
        'publicPhotos.edit',
        'publicPhotos.update',
        'publicPhotos.destroy',
      ]
    )
  })

  test('rename the resource param', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    resource.params({ photos: 'photo' })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
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
          pattern: '/photos/:photo',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'photos.show',
        },
        {
          pattern: '/photos/:photo/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'photos.edit',
        },
        {
          pattern: '/photos/:photo',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',

          name: 'photos.update',
        },
        {
          pattern: '/photos/:photo',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',

          name: 'photos.destroy',
        },
      ]
    )
  })

  test('rename the resource param multiple times', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'photos',
      controller: '#controllers/photos',
      globalMatchers: {},
      shallow: false,
    })

    resource.params({ photos: 'photo' })
    resource.params({ photos: 'photo(slug)' })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
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
          pattern: '/photos/:photo(slug)',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'photos.show',
        },
        {
          pattern: '/photos/:photo(slug)/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'photos.edit',
        },
        {
          pattern: '/photos/:photo(slug)',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',

          name: 'photos.update',
        },
        {
          pattern: '/photos/:photo(slug)',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',

          name: 'photos.destroy',
        },
      ]
    )
  })

  test('define custom param name for nested resource', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'magazines.ads',
      controller: '#controllers/ads',
      globalMatchers: {},
      shallow: false,
    })

    resource.params({ ads: 'ad', magazines: 'mag' })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:mag/ads/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          methods: ['POST'],
          domain: 'root',
          meta: {},

          name: 'magazines.ads.store',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.show',
        },
        {
          pattern: '/magazines/:mag/ads/:ad/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.edit',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          meta: {},

          name: 'magazines.ads.update',
        },
        {
          pattern: '/magazines/:mag/ads/:ad',
          matchers: {},
          methods: ['DELETE'],
          meta: {},
          domain: 'root',

          name: 'magazines.ads.destroy',
        },
      ]
    )
  })

  test('rename param name for a shallow resource', ({ assert }) => {
    const app = new AppFactory().create(BASE_URL)
    const resource = new RouteResource(app, [], {
      resource: 'magazines.ads',
      controller: '#controllers/ads',
      globalMatchers: {},
      shallow: true,
    })

    resource.params({ ads: 'ad', magazines: 'mag' })

    assert.containsSubset(
      resource.routes.map((route) => route.toJSON()),
      [
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.index',
        },
        {
          pattern: '/magazines/:mag/ads/create',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.create',
        },
        {
          pattern: '/magazines/:mag/ads',
          matchers: {},
          methods: ['POST'],
          meta: {},
          domain: 'root',
        },
        {
          pattern: '/ads/:ad',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.show',
        },
        {
          pattern: '/ads/:ad/edit',
          matchers: {},
          meta: {},
          methods: ['GET', 'HEAD'],
          domain: 'root',

          name: 'magazines.ads.edit',
        },
        {
          pattern: '/ads/:ad',
          matchers: {},
          meta: {},
          methods: ['PUT', 'PATCH'],
          domain: 'root',
          name: 'magazines.ads.update',
        },
        {
          pattern: '/ads/:ad',
          matchers: {},
          meta: {},
          methods: ['DELETE'],
          domain: 'root',
          name: 'magazines.ads.destroy',
        },
      ]
    )
  })
})
