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

import { RouterFactory } from '../../factories/router.ts'
import { HttpRequestFactory } from '../../factories/request.ts'
import { URLBuilderFactory } from '../../factories/url_builder_factory.ts'
import {
  type UrlFor,
  type URLOptions,
  type GetRoutesForMethod,
  type RouteBuilderArguments,
} from '../../src/types/url_builder.ts'

test.group('URLBuilder', () => {
  test('create url for a route by its name', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()
    assert.equal(urlFor('users.show', ['1']), '/users/1')
  })

  test('create url for specific methods', ({ assert }) => {
    const router = new RouterFactory().create()

    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      GET: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      POST: {
        'users.index': {
          params?: {}
          paramsTuple: [string]
        }
      }
      PUT: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      PATCH: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      DELETE: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users', ['POST'], () => {}).as('users.index')
    router.route('/users/:id', ['GET', 'PUT', 'PATCH', 'DELETE'], () => {}).as('users.show')
    router.commit()

    assert.containSubset(urlFor.get('users.show', { id: '1' }), { method: 'GET', url: '/users/1' })
    assert.deepEqual(urlFor.get('users.show', { id: '1' }).form, {
      method: 'GET',
      action: '/users/1',
    })
    assert.equal(`${urlFor.get('users.show', { id: '1' })}`, '/users/1')

    assert.containSubset(urlFor.post('users.index'), {
      method: 'POST',
      url: '/users',
    })
    assert.deepEqual(urlFor.post('users.index').form, {
      method: 'POST',
      action: '/users',
    })
    assert.equal(`${urlFor.post('users.index')}`, '/users')

    assert.containSubset(urlFor.put('users.show', { id: '1' }), {
      method: 'PUT',
      url: '/users/1',
    })
    assert.deepEqual(urlFor.put('users.show', { id: '1' }).form, {
      method: 'PUT',
      action: '/users/1',
    })
    assert.equal(`${urlFor.put('users.show', { id: '1' })}`, '/users/1')

    assert.containSubset(urlFor.patch('users.show', { id: '1' }), {
      method: 'PATCH',
      url: '/users/1',
    })
    assert.deepEqual(urlFor.patch('users.show', { id: '1' }).form, {
      method: 'PATCH',
      action: '/users/1',
    })
    assert.equal(`${urlFor.patch('users.show', { id: '1' })}`, '/users/1')

    assert.containSubset(urlFor.delete('users.show', { id: '1' }), {
      method: 'DELETE',
      url: '/users/1',
    })
    assert.deepEqual(urlFor.delete('users.show', { id: '1' }).form, {
      method: 'DELETE',
      action: '/users/1',
    })
    assert.equal(`${urlFor.delete('users.show', { id: '1' })}`, '/users/1')

    assert.containSubset(urlFor.method('GET', 'users.show', { id: '1' }), {
      method: 'GET',
      url: '/users/1',
    })
    assert.containSubset(urlFor.method('GET', 'users.show', { id: '1' }).form, {
      method: 'GET',
      action: '/users/1',
    })
    assert.equal(`${urlFor.method('GET', 'users.show', { id: '1' })}`, '/users/1')
  })

  test('create url for a route by its name for the home path', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        home: {}
      }
    }>()
      .merge({ router })
      .create()

    router.route('/', ['GET'], () => {}).as('home')
    router.commit()
    assert.equal(urlFor('home'), '/')
  })

  test('create and verify signed routes', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router, encryption })
      .create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrlFor('users.show', { id: '1' }),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed routes for specific methods', ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()

    const { signedUrlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      GET: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      POST: {
        'users.store': {
          params?: {}
          paramsTuple: [string]
        }
      }
      PUT: {
        'users.update': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      PATCH: {
        'users.update': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      DELETE: {
        'users.delete': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
    }>()
      .merge({ router, encryption })
      .create()

    router.route('/users', ['POST'], () => {}).as('users.store')
    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.route('/users/:id', ['PUT', 'PATCH'], () => {}).as('users.update')
    router.route('/users/:id', ['DELETE'], () => {}).as('users.delete')
    router.commit()

    function verifySignature(uri: string) {
      const request = new HttpRequestFactory()
        .merge({
          encryption,
          url: uri,
        })
        .create()
      assert.isTrue(request.hasValidSignature())
    }

    verifySignature(`${signedUrlFor.get('users.show', { id: '1' })}`)
    verifySignature(`${signedUrlFor.post('users.store')}`)
    verifySignature(`${signedUrlFor.put('users.update', { id: '1' })}`)
    verifySignature(`${signedUrlFor.patch('users.update', { id: '1' })}`)
    verifySignature(`${signedUrlFor.delete('users.delete', { id: '1' })}`)
    verifySignature(`${signedUrlFor.method('GET', 'users.show', { id: '1' })}`)
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router, encryption })
      .create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrlFor(
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
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    assert.throws(() => urlFor('/users/:id'), 'Cannot lookup route "/users/:id"')
  })

  test('raise error when unable to lookup route for a given method', ({ assert }) => {
    const router = new RouterFactory().create()
    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router.commit()

    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    assert.throws(
      () => urlFor.post('users.show'),
      'Cannot lookup route "users.show" for method "POST"'
    )
  })

  test('allow missing params when param is optional', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': { paramsTuple: [string?]; params?: { id?: string } }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/:id?', ['GET'], () => {}).as('users.show')
    router.commit()
    assert.equal(urlFor('users.show'), '/users')
    assert.equal(urlFor('users.show', ['1']), '/users/1')
  })

  test('make route with wildcard params', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        'users.list': { paramsTuple: [string[]]; params: { '*': string[] } }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/*', ['GET'], () => {}).as('users.list')
    router.commit()
    assert.equal(urlFor('users.list', { '*': ['1', '2', '3'] }), '/users/1/2/3')
  })

  test('raise error when wildcard params are missing', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users/*', ['GET'], () => {}).as('users.list')
    router.commit()

    assert.throws(
      () => urlFor('users.list'),
      'Cannot make URL for "users.list". Invalid value provided for the wildcard param'
    )
  })

  test('prefix url', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users', ['GET'], () => {}).as('users.index')
    router.commit()

    assert.equal(
      urlFor('users.index', undefined, { prefixUrl: 'https://adonisjs.com' }),
      'https://adonisjs.com/users'
    )
  })

  test('define query string with arrays', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('users', ['GET'], () => {}).as('users.index')
    router.commit()

    assert.equal(
      urlFor('users.index', undefined, {
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
    const { signedUrlFor } = new URLBuilderFactory().merge({ router, encryption }).create()

    router.route('/users', ['GET'], () => {}).as('users.index')
    router.commit()

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrlFor('users.index'),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrlFor } = new URLBuilderFactory().merge({ router, encryption }).create()

    router.route('/users', ['GET'], () => {}).as('users.index')
    router.commit()

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrlFor('users.index', undefined, {
          qs: {
            sort: 'id',
            fields: ['username', 'email'],
          },
        }),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('find route across domains', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        'users.show': {
          params: { id: string }
        }
        'posts.show': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/:id', ['GET'], () => {}).as('users.show')
    router
      .route('/posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    assert.equal(urlFor('posts.show', { id: '1' }), '/posts/1')
  })

  test('make url for a route from specific domain', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        'posts.show': {
          params: { id: string }
        }
        'blog.adonisjs.com@posts.show': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/posts/:id', ['GET'], () => {}).as('posts.show')
    router
      .route('posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    assert.equal(urlFor('blog.adonisjs.com@posts.show', { id: '1' }), '/posts/1')
  })

  test('create signed url for a route from specific domain', ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrlFor } = new URLBuilderFactory<{
      ALL: {
        'posts.show': {
          params: { id: string }
        }
        'blog.adonisjs.com@posts.show': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router, encryption })
      .create()

    router.route('/posts/:id', ['GET'], () => {}).as('posts.show')
    router
      .route('posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    const request = new HttpRequestFactory()
      .merge({
        encryption,
        url: signedUrlFor('blog.adonisjs.com@posts.show', { id: '1' }),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('throw error when mentioned domain is unknown', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('/posts/:id', ['GET'], () => {}).as('posts.show')
    router
      .route('posts/:id', ['GET'], () => {})
      .as('posts.show')
      .domain('blog.adonisjs.com')
    router.commit()

    assert.throws(
      () => urlFor('news.adonisjs.com@posts.show'),
      'Cannot lookup route "news.adonisjs.com@posts.show"'
    )
  })
})

test.group('URLBuilder | types', () => {
  test('return all available routes for a given method', ({ expectTypeOf }) => {
    type Routes = {
      ALL: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
        'users.list': {
          params?: { id?: string }
          paramsTuple?: [string?]
        }
        'users.store': {
          params: {}
          paramsTuple: []
        }
      }
      GET: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
        'users.list': {
          params?: { id?: string }
          paramsTuple?: [string?]
        }
      }
      POST: {
        'users.store': {
          params: {}
          paramsTuple: []
        }
      }
    }

    expectTypeOf<GetRoutesForMethod<Routes, 'GET'>>().toEqualTypeOf<{
      'users.show': {
        params: { id: string }
        paramsTuple: [string]
      }
      'users.list': {
        params?: { id?: string }
        paramsTuple?: [string?]
      }
    }>()

    expectTypeOf<GetRoutesForMethod<Routes, 'POST'>>().toEqualTypeOf<{
      'users.store': {
        params: {}
        paramsTuple: []
      }
    }>()

    expectTypeOf<GetRoutesForMethod<Routes, 'PUT'>>().toEqualTypeOf<never>()
  })

  test('create a URL builder from routes list', ({ expectTypeOf }) => {
    type Routes = {
      ALL: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
        'users.list': {
          params?: { id?: string }
          paramsTuple?: [string?]
        }
        'users.store': {
          params: {}
          paramsTuple: []
        }
      }
      GET: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
        'users.list': {
          params?: { id?: string }
          paramsTuple?: [string?]
        }
      }
      POST: {
        'users.store': {
          params: {}
          paramsTuple: []
        }
      }
    }

    expectTypeOf<GetRoutesForMethod<Routes, 'GET'>>().toEqualTypeOf<{
      'users.show': {
        params: { id: string }
        paramsTuple: [string]
      }
      'users.list': {
        params?: { id?: string }
        paramsTuple?: [string?]
      }
    }>()

    expectTypeOf<UrlFor<Routes>['get']>().parameters.toEqualTypeOf<
      | [
          identifier: 'users.show' | 'users.list',
          params: { id: string } | [string],
          options?: URLOptions | undefined,
        ]
      | [
          identifier: 'users.show' | 'users.list',
          params?: { id?: string } | [string?],
          options?: URLOptions | undefined,
        ]
    >()
  })

  test('return arguments accepted by the URL builder for a given route', ({ expectTypeOf }) => {
    type Routes = {
      ALL: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
        'users.list': {
          params?: { id?: string }
          paramsTuple?: [string?]
        }
        'users.store': {
          params: {}
          paramsTuple: []
        }
      }
      GET: {
        'users.show': {
          params: { id: string }
          paramsTuple: [string]
        }
        'users.list': {
          params?: { id?: string }
          paramsTuple?: [string?]
        }
      }
      POST: {
        'users.store': {
          params: {}
          paramsTuple: []
        }
      }
    }

    expectTypeOf<RouteBuilderArguments<'users.show', Routes['GET']['users.show']>>().toEqualTypeOf<
      [
        identifier: 'users.show',
        params: [string] | { id: string },
        options?: URLOptions | undefined,
      ]
    >()
  })
})
