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
import { RequestFactory } from '../../factories/request.ts'
import { URLBuilderFactory } from '../../factories/url_builder_factory.ts'

test.group('URLBuilder', () => {
  test('create url for a route by route name', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
    }>()
      .merge({ router })
      .create()

    router.get('/users/:id', () => {})
    router.commit()
    assert.equal(urlFor('/users/:id', { id: '1' }), '/users/1')
  })

  test('create url for a specific methods', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      GET: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      POST: {
        '/users': {
          params?: {}
          paramsTuple: [string]
        }
      }
      PUT: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      PATCH: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      DELETE: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users', ['POST'], () => {})
    router.route('/users/:id', ['GET', 'PUT', 'PATCH', 'DELETE'], () => {})
    router.commit()

    assert.containsSubset(urlFor.get('/users/:id', { id: '1' }), { method: 'get', url: '/users/1' })
    assert.equal(`${urlFor.get('/users/:id', { id: '1' })}`, '/users/1')

    assert.containsSubset(urlFor.post('/users'), {
      method: 'post',
      url: '/users',
    })
    assert.equal(`${urlFor.post('/users')}`, '/users')

    assert.containsSubset(urlFor.put('/users/:id', { id: '1' }), {
      method: 'put',
      url: '/users/1',
    })
    assert.equal(`${urlFor.put('/users/:id', { id: '1' })}`, '/users/1')

    assert.containsSubset(urlFor.patch('/users/:id', { id: '1' }), {
      method: 'patch',
      url: '/users/1',
    })
    assert.equal(`${urlFor.patch('/users/:id', { id: '1' })}`, '/users/1')

    assert.containsSubset(urlFor.delete('/users/:id', { id: '1' }), {
      method: 'delete',
      url: '/users/1',
    })
    assert.equal(`${urlFor.delete('/users/:id', { id: '1' })}`, '/users/1')

    assert.containsSubset(urlFor.method('GET', '/users/:id', { id: '1' }), {
      method: 'GET',
      url: '/users/1',
    })
    assert.equal(`${urlFor.method('GET', '/users/:id', { id: '1' })}`, '/users/1')
  })

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

  test('create url for a route by the handler name', ({ assert }) => {
    const router = new RouterFactory().create()
    router.lookupStrategies(['controller'])

    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        '#controllers/posts': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/:id', ['GET'], '#controllers/posts')
    router.commit()
    assert.equal(urlFor('#controllers/posts', { id: '1' }), '/users/1')
  })

  test('create url for a route by the handler name for the home path', ({ assert }) => {
    const router = new RouterFactory().create()
    router.lookupStrategies(['controller'])

    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        '#controllers/home': {}
      }
    }>()
      .merge({ router })
      .create()

    router.route('/', ['GET'], '#controllers/home')
    router.commit()
    assert.equal(urlFor('#controllers/home'), '/')
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

    const request = new RequestFactory()
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
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      GET: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      POST: {
        '/users': {
          params?: {}
          paramsTuple: [string]
        }
      }
      PUT: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      PATCH: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
      DELETE: {
        '/users/:id': {
          params: { id: string }
          paramsTuple: [string]
        }
      }
    }>()
      .merge({ router, encryption })
      .create()

    router.route('/users', ['POST'], () => {})
    router.route('/users/:id', ['GET', 'PUT', 'PATCH', 'DELETE'], () => {})
    router.commit()

    function verifySignature(uri: string) {
      const request = new RequestFactory()
        .merge({
          encryption,
          url: uri,
        })
        .create()
      assert.isTrue(request.hasValidSignature())
    }

    verifySignature(`${signedUrlFor.get('/users/:id', { id: '1' })}`)
    verifySignature(`${signedUrlFor.post('/users')}`)
    verifySignature(`${signedUrlFor.put('/users/:id', { id: '1' })}`)
    verifySignature(`${signedUrlFor.patch('/users/:id', { id: '1' })}`)
    verifySignature(`${signedUrlFor.delete('/users/:id', { id: '1' })}`)
    verifySignature(`${signedUrlFor.method('GET', '/users/:id', { id: '1' })}`)
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

    const request = new RequestFactory()
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

  test('allow missing params when param is optional', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        '/users/:id?': { paramsTuple: [string?]; params?: { id?: string } }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/:id?', ['GET'], () => {}).as('users.show')
    router.commit()
    assert.equal(urlFor('/users/:id?'), '/users')
  })

  test('make route with wildcard params', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory<{
      ALL: {
        '/users/*': { paramsTuple: [string[]]; params: { '*': string[] } }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/*', ['GET'], () => {}).as('users.show')
    router.commit()
    assert.equal(urlFor('/users/*', { '*': ['1', '2', '3'] }), '/users/1/2/3')
  })

  test('raise error when wildcard params are missing', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users/*', ['GET'], () => {}).as('users.show')
    router.commit()

    assert.throws(
      () => urlFor('/users/*'),
      'Cannot make URL for "/users/*". Invalid value provided for the wildcard param'
    )
  })

  test('prefix url', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users', ['GET'], () => {}).as('users.show')
    router.commit()

    assert.equal(
      urlFor('/users', undefined, { prefixUrl: 'https://adonisjs.com' }),
      'https://adonisjs.com/users'
    )
  })

  test('define query string with arrays', ({ assert }) => {
    const router = new RouterFactory().create()
    const { urlFor } = new URLBuilderFactory().merge({ router }).create()

    router.route('/users', ['GET'], () => {}).as('users.show')
    router.commit()

    assert.equal(
      urlFor('/users', undefined, {
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

    router.route('/users', ['GET'], () => {}).as('users.show')
    router.commit()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedUrlFor('/users'),
      })
      .create()

    assert.isTrue(request.hasValidSignature())
  })

  test('create and verify signed URLs with query string', async ({ assert }) => {
    const router = new RouterFactory().create()
    const encryption = new EncryptionFactory().create()
    const { signedUrlFor } = new URLBuilderFactory().merge({ router, encryption }).create()

    router.route('/users', ['GET'], () => {}).as('users.show')
    router.commit()

    const request = new RequestFactory()
      .merge({
        encryption,
        url: signedUrlFor('/users', undefined, {
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
        '/users/:id': {
          params: { id: string }
        }
        '/posts/:id': {
          params: { id: string }
        }
      }
    }>()
      .merge({ router })
      .create()

    router.route('/users/:id', ['GET'], () => {})
    router.route('/posts/:id', ['GET'], () => {}).domain('blog.adonisjs.com')
    router.commit()

    assert.equal(urlFor('/posts/:id', { id: '1' }), '/posts/1')
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

    const request = new RequestFactory()
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
