/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { EncryptionFactory } from '@adonisjs/encryption/factories'

import { RouterFactory } from '../../factories/router.js'
import { RequestFactory } from '../../factories/request.js'
import { URLBuilderFactory } from '../../factories/url_builder_factory.js'

test.group('URL builder', () => {
  test('create url for a route', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users/:id', ['GET'], () => {})
    router.commit()
    assert.equal(route('/users/:id', { id: '1' }), '/users/1')
  })

  test('create url for a route by its name', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()
    assert.equal(route('users.show', ['1']), '/users/1')
  })

  test('create url for a route by its name for the home path', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/', ['GET'], () => {}).as('home')
    router.commit()
    assert.equal(route('home'), '/')
  })

  test('create url for a route by the handler name', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users/:id', ['GET'], '#controllers/posts')
    router.commit()
    assert.equal(route('#controllers/posts', { id: '1' }), '/users/1')
  })

  test('create url for a route by the handler name for the home path', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/', ['GET'], '#controllers/home')
    router.commit()
    assert.equal(route('#controllers/home'), '/')
  })

  test('create and verify signed routes', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedRoute } = new URLBuilderFactory().merge({ router, encryption }).create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedRoute('users.show', { id: '1' }),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedRoute } = new URLBuilderFactory().merge({ router, encryption }).create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedRoute(
          'users.show',
          { id: '1' },
          {
            qs: {
              sort: 'id',
              fields: ['username', 'email'],
            },
          }
        ),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('raise error when unable to lookup route', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    assert.throws(() => route('/users/:id'), 'Cannot lookup route "/users/:id"')
  })

  test('create url without performing route lookup', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.equal(url('/users/:id', { id: '1' }), '/users/1')
  })

  test('raise error when one or params are missing', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.throws(
      // @ts-expect-error
      () => url('/users/:id', {}),
      'Cannot make URL for "/users/:id". Missing value for the "id" param'
    )
  })

  test('allow missing params when param is optional', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.equal(url('/users/:id?'), '/users')
  })

  test('make route with wildcard params', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.equal(url('/users/*', { '*': ['1', '2', '3'] }), '/users/1/2/3')
  })

  test('raise error when wildcard params are missing', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.throws(
      // @ts-expect-error
      () => url('/users/*'),
      'Cannot make URL for "/users/*". Invalid value provided for the wildcard param'
    )
  })

  test('prefix url', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.equal(
      url('/users', {}, { prefixUrl: 'https://adonisjs.com' }),
      'https://adonisjs.com/users'
    )
  })

  test('define query string with arrays', ({ assert }) => {
    const router = new RouterFactory().create()
    const { url } = new URLBuilderFactory().merge({ router }).create()

    assert.equal(
      url('/users', undefined, {
        qs: {
          sort: 'id',
          fields: ['username', 'email'],
        },
      }),
      '/users?sort=id&fields%5B0%5D=username&fields%5B1%5D=email'
    )
  })

  test('create and verify signed URLs', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrl } = new URLBuilderFactory().merge({ router, encryption }).create()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedUrl('/users'),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrl } = new URLBuilderFactory().merge({ router, encryption }).create()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedUrl(
          '/users',
          {},
          {
            qs: {
              sort: 'id',
              fields: ['username', 'email'],
            },
          }
        ),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('find route across domains', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users/:id', ['GET'], () => {})
    router.route('/posts/:id', ['GET'], () => {}).domain('blog.adonisjs.com')
    router.commit()
    assert.equal(route('/posts/:id', { id: '1' }), '/posts/1')
  })

  test('make url for a route from specific domain', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/posts/:id', ['GET'], () => {}).as('posts.show')
    router
      .route('posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    assert.equal(route('blog.adonisjs.com@posts.show', { id: '1' }), '/posts/1')
  })

  test('find signed url for a route from specific domain', ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedRoute } = new URLBuilderFactory().merge({ router, encryption }).create()

    router.route('/posts/:id', ['GET'], () => {}).as('posts.show')
    router
      .route('posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedRoute('blog.adonisjs.com@posts.show', { id: '1' }),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('throw error when mentioned domain is unknown', ({ assert }) => {
    const router = new RouterFactory().create()
    const { route } = new URLBuilderFactory().merge({ router }).create()

    router.route('/posts/:id', ['GET'], () => {}).as('posts.show')
    router
      .route('posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    assert.throws(
      () => route('news.adonisjs.com@posts.show', { id: '1' }),
      'Cannot lookup route "news.adonisjs.com@posts.show"'
    )
  })
})
