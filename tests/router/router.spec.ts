/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'qs'
import { test } from '@japa/runner'

import { Router } from '../../src/router/main.js'
import { AppFactory } from '../../test_factories/app.js'
import { MiddlewareStore } from '../../src/middleware/store.js'
import { EncryptionFactory } from '../../test_factories/encryption.js'

test.group('Router | add', () => {
  test('add routes', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    const getRoute = router.get('/', '#controllers/home.index')
    const postRoute = router.post('/', '#controllers/home.store')
    const putRoute = router.put('/', '#controllers/home.update')
    const patchRoute = router.patch('/', '#controllers/home.updatePatch')
    const deleteRoute = router.delete('/', '#controllers/home.destroy')
    const anyRoute = router.any('/', '#controllers/home.handle')

    assert.containsSubset(getRoute.toJSON(), {
      pattern: '/',
      methods: ['GET', 'HEAD'],
      meta: {},
      matchers: {},
      domain: 'root',
      name: undefined,
    })

    assert.containsSubset(postRoute.toJSON(), {
      pattern: '/',
      methods: ['POST'],
      meta: {},
      matchers: {},
      domain: 'root',
      name: undefined,
    })

    assert.containsSubset(putRoute.toJSON(), {
      pattern: '/',
      methods: ['PUT'],
      meta: {},
      matchers: {},
      domain: 'root',
      name: undefined,
    })

    assert.containsSubset(patchRoute.toJSON(), {
      pattern: '/',
      methods: ['PATCH'],
      meta: {},
      matchers: {},
      domain: 'root',
      name: undefined,
    })

    assert.containsSubset(deleteRoute.toJSON(), {
      pattern: '/',
      methods: ['DELETE'],
      meta: {},
      matchers: {},
      domain: 'root',
      name: undefined,
    })

    assert.containsSubset(anyRoute.toJSON(), {
      pattern: '/',
      methods: ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      meta: {},
      matchers: {},
      domain: 'root',
      name: undefined,
    })
  })

  test('raise error when route name is duplicate', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('/', async function handler() {}).as('home')
    router.get('home', async function handler() {}).as('home')

    const fn = () => router.commit()
    assert.throws(fn, 'Route with duplicate name found. A route with name "home" already exists')
  })

  test('create nested groups', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', handler)
          })
          .prefix('v1')
      })
      .prefix('api')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          handler,
          pattern: '/api/v1',
        },
      ],
    })
  })

  test('apply middleware in nested groups', ({ assert }) => {
    class AclMiddleware {
      async handle(_: any, __: any, options: { role: 'admin' | 'editor' }) {
        return options
      }
    }

    class AuthMiddleware {
      async handle() {}
    }

    const middleware = {
      acl: async () => {
        return {
          default: AclMiddleware,
        }
      },
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    }

    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], middleware))
    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', handler)
          })
          .middleware('acl', { role: 'admin' })
      })
      .middleware('auth')

    router.commit()

    const routeJSON = router.toJSON()
    assert.containsSubset(routeJSON, {
      root: [
        {
          domain: 'root',
          handler,
          pattern: '/',
        },
      ],
    })

    assert.containsSubset(
      [...routeJSON.root[0].middleware.all()],
      [
        {
          name: 'auth',
          args: undefined,
        },
        {
          name: 'acl',
          args: { role: 'admin' },
        },
      ]
    )
  })

  test('apply domain in nested groups', ({ assert }) => {
    assert.plan(1)

    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', handler)
          })
          .domain('foo.com')
      })
      .domain('bar.com')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      'foo.com': [
        {
          domain: 'foo.com',
          handler,
          pattern: '/',
        },
      ],
    })
  })

  test('apply route matchers on nested groups', ({ assert }) => {
    assert.plan(1)

    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/:user_id/:id', handler)
          })
          .where('id', '[a-z]')
          .where('user_id', '[0-9]')
      })
      .where('id', '[0-9]')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          handler,
          matchers: {
            id: /[a-z]/,
            user_id: /[0-9]/,
          },
          pattern: '/:user_id/:id',
        },
      ],
    })
  })

  test('apply route matchers using shorthand methods', ({ assert }) => {
    assert.plan(1)

    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    const route = router
      .get('/:user_id', handler)
      .where('user_id', router.matchers.number())
      .toJSON()

    assert.deepEqual(route.matchers.user_id.match, /^[0-9]+$/)
  })

  test('test empty string param against the matcher', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router.get('user/:user_id', handler)
    router.get('users/:user_id', handler).where('user_id', router.matchers.number())
    router.commit()

    assert.isNull(router.match('/users/ ', 'GET'))
    assert.isNotNull(router.match('/user/ ', 'GET')) // without matcher
  })

  test('apply route names in group', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', handler).as('home')
          })
          .as('admin')
      })
      .as('api')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          handler,
          matchers: {},
          pattern: '/',
          name: 'api.admin.home',
        },
      ],
    })
  })

  test('define global matcher as a string', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.where('id', '^[0-9]$')

    async function handler() {}

    router.get('/', handler)
    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          handler,
          matchers: {
            id: {
              match: /^[0-9]$/,
            },
          },
          pattern: '/',
          name: undefined,
        },
      ],
    })
  })

  test('define global matcher as a regex', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.where('id', /^[0-9]$/)

    async function handler() {}

    router.get('/', handler)
    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          handler,
          matchers: {
            id: {
              match: /^[0-9]$/,
            },
          },
          pattern: '/',
          name: undefined,
        },
      ],
    })
  })

  test('define global matcher as an object', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.where('id', {
      match: /^[0-9]$/,
      cast: () => {},
    })

    async function handler() {}

    router.get('/', handler)
    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          handler,
          matchers: {
            id: {
              match: /^[0-9]$/,
            },
          },
          pattern: '/',
          name: undefined,
        },
      ],
    })
  })
})

test.group('Router | commit', () => {
  test('commit routes to the store', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}
    router.get('/', handler)
    router.commit()

    assert.deepEqual(router.routes, [])
    assert.containsSubset(router.match('/', 'GET'), {
      params: {},
      route: {
        handler,
        meta: {
          params: [],
        },
        name: undefined,
        pattern: '/',
      },
      routeKey: 'GET-/',
      subdomains: {},
    })
  })

  test('commit routes group to the store', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router.get('/', handler)
      })
      .prefix('api')

    router.commit()

    assert.deepEqual(router.routes, [])
    assert.containsSubset(router.match('/api', 'GET'), {
      params: {},
      route: {
        handler,
        meta: {
          params: [],
        },
        name: undefined,
        pattern: '/api',
      },
      routeKey: 'GET-/api',
      subdomains: {},
    })
  })

  test('define resource inside a group', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router.resource('posts', 'PostController')
      })
      .prefix('api')

    router.commit()

    assert.deepEqual(router.routes, [])
    assert.containsSubset(router.match('/api/posts', 'GET'), {
      params: {},
      route: {
        meta: {
          params: [],
        },
        name: 'posts.index',
        pattern: '/api/posts',
      },
      routeKey: 'GET-/api/posts',
      subdomains: {},
    })
  })

  test('define resource inside nested groups', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router
          .group(() => {
            router.resource('posts', 'PostController')
          })
          .prefix('v1')
      })
      .prefix('api')

    router.commit()

    assert.deepEqual(router.routes, [])
    assert.containsSubset(router.match('/api/v1/posts', 'GET'), {
      params: {},
      route: {
        meta: {
          params: [],
        },
        name: 'posts.index',
        pattern: '/api/v1/posts',
      },
      routeKey: 'GET-/api/v1/posts',
      subdomains: {},
    })
  })

  test('define shallow resource', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.shallowResource('posts.comments', 'CommentsController')
    router.commit()

    assert.deepEqual(router.routes, [])
    assert.containsSubset(router.match('/comments/1', 'GET'), {
      params: {
        id: '1',
      },
      route: {
        meta: {
          params: ['id'],
        },
        name: 'posts.comments.show',
        pattern: '/comments/:id',
      },
      routeKey: 'GET-/comments/:id',
      subdomains: {},
    })
  })

  test('define nested resource', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.resource('posts.comments', 'CommentsController')

    router.commit()

    assert.containsSubset(router.match('posts/2/comments/1', 'GET'), {
      params: {
        id: '1',
        post_id: '2',
      },
      route: {
        meta: {
          params: ['post_id', 'id'],
        },
        name: 'posts.comments.show',
        pattern: '/posts/:post_id/comments/:id',
      },
      routeKey: 'GET-/posts/:post_id/comments/:id',
      subdomains: {},
    })
  })

  test('do not commit route when deleted flag is set to true', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}
    const route = router.get('/', handler)
    route.markAsDeleted()

    router.commit()

    assert.isNull(router.match('/', 'GET'))
  })
})

test.group('Router | match', () => {
  test('match route using URL', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.resource('photos', 'PhotosController')
    router.commit()

    assert.containsSubset(router.match('photos', 'GET')!, {
      params: {},
      route: {
        meta: {
          params: [],
        },
        pattern: '/photos',
        name: 'photos.index',
      },
      routeKey: 'GET-/photos',
      subdomains: {},
    })

    assert.containsSubset(router.match('photos/create', 'GET'), {
      params: {},
      route: {
        meta: {
          params: [],
        },
        pattern: '/photos/create',
        name: 'photos.create',
      },
      routeKey: 'GET-/photos/create',
      subdomains: {},
    })

    assert.containsSubset(router.match('photos', 'POST')!, {
      params: {},
      route: {
        meta: {
          params: [],
        },
        pattern: '/photos',
        name: 'photos.store',
      },
      routeKey: 'POST-/photos',
      subdomains: {},
    })

    assert.containsSubset(router.match('photos/1', 'GET')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          params: ['id'],
        },
        pattern: '/photos/:id',
        name: 'photos.show',
      },
      routeKey: 'GET-/photos/:id',
      subdomains: {},
    })

    assert.containsSubset(router.match('photos/1/edit', 'GET')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          params: ['id'],
        },
        pattern: '/photos/:id/edit',
        name: 'photos.edit',
      },
      routeKey: 'GET-/photos/:id/edit',
      subdomains: {},
    })

    assert.containsSubset(router.match('photos/1', 'PUT')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          params: ['id'],
        },
        pattern: '/photos/:id',
        name: 'photos.update',
      },
      routeKey: 'PUT-/photos/:id',
      subdomains: {},
    })

    assert.containsSubset(router.match('photos/1', 'DELETE')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          params: ['id'],
        },
        pattern: '/photos/:id',
        name: 'photos.destroy',
      },
      routeKey: 'DELETE-/photos/:id',
      subdomains: {},
    })
  })

  test('apply uuid matcher when matching route', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('photos/:id', '#controllers/photos.show').where('id', router.matchers.uuid())
    router.commit()

    assert.isNull(router.match('photos/1', 'GET'))
    assert.containsSubset(router.match('photos/78fee49A-3d79-43bc-b93f-1ac4ba9e925B', 'GET'), {
      params: {
        id: '78fee49a-3d79-43bc-b93f-1ac4ba9e925b',
      },
      route: {
        meta: {
          params: ['id'],
        },
        pattern: '/photos/:id',
        name: undefined,
      },
      routeKey: 'GET-/photos/:id',
      subdomains: {},
    })
  })

  test('match route for a specific domain', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router.resource('photos', 'PhotosController')
      })
      .domain(':tenant.adonisjs.com')

    router.commit()

    assert.containsSubset(router.match('photos', 'GET', 'news.adonisjs.com')!, {
      params: {},
      route: {
        meta: {
          params: [],
        },
        pattern: '/photos',
        name: 'photos.index',
      },
      routeKey: ':tenant.adonisjs.com-GET-/photos',
      subdomains: {
        tenant: 'news',
      },
    })
  })
})

test.group('Brisk route', () => {
  test('define brisk route', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router.on('/').setHandler(handler)
    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          domain: 'root',
          matchers: {},
          name: undefined,
          pattern: '/',
          handler,
          methods: ['GET', 'HEAD'],
          meta: {},
        },
      ],
    })
  })

  test('define brisk route inside a group', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router.on('/').setHandler(handler).as('root')
      })
      .prefix('api/v1')
      .as('v1')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          name: 'v1.root',
          matchers: {},
          domain: 'root',
          pattern: '/api/v1',
          handler,
          meta: {},
          methods: ['GET', 'HEAD'],
        },
      ],
    })
  })

  test('register brisk route to store', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    async function handler() {}

    router
      .group(() => {
        router.on('/').setHandler(handler).as('root')
      })
      .prefix('api/v1')
      .as('v1')

    router.commit()

    assert.containsSubset(router.match('/api/v1', 'GET'), {
      params: {},
      route: {
        handler,
        meta: {
          params: [],
        },
        name: 'v1.root',
        pattern: '/api/v1',
      },
      routeKey: 'GET-/api/v1',
      subdomains: {},
    })
  })
})

test.group('Router | Make url', () => {
  test('make url to a given route', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', async function handler() {})
    router.commit()

    const url = router.makeUrl('/posts/:id', { id: 1 })
    assert.equal(url, '/posts/1')
  })

  test("make url to a given route by it's name", ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', async function handler() {}).as('showPost')
    router.commit()

    const url = router.makeUrl('showPost', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test("make url to a given route by it's controller method", ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', '#controllers/posts.index').as('showPost')
    router.commit()

    const url = router.makeUrl('#controllers/posts.index', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test('make url for a specific domain', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', '#controllers/posts.index').as('showPost')
    router
      .get('articles/:id', '#controllers/posts.index')
      .as('showPost')
      .domain('blog.adonisjs.com')

    router.commit()

    const url = router.makeUrl(
      '#controllers/posts.index',
      { id: 1 },
      { domain: 'blog.adonisjs.com' }
    )!

    assert.equal(url, '/articles/1')
  })

  test('prefix url', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', async function handler() {}).as('showPost')
    router.commit()

    const url = router.makeUrl('showPost', { id: 1 }, { prefixUrl: 'https://blog.adonisjs.com' })!
    assert.equal(url, 'https://blog.adonisjs.com/posts/1')
  })

  test('disable routes lookup', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.commit()

    const url = router.makeUrl(
      '/posts/:id',
      { id: 1 },
      { prefixUrl: 'https://blog.adonisjs.com', disableRouteLookup: true }
    )!
    assert.equal(url, 'https://blog.adonisjs.com/posts/1')
  })
})

test.group('Make signed url', () => {
  test('make signed url to a given route', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', async function handler() {})
    router.commit()

    const url = router.makeSignedUrl('/posts/:id', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test("make signed url to a given route by it's name", ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', async function handler() {}).as('showPost')
    router.commit()

    const url = router.makeSignedUrl('showPost', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test("make signed url to a given route by it's controller method", ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', '#controllers/posts.index').as('showPost')
    router.commit()

    const url = router.makeSignedUrl('#controllers/posts.index', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make url for a specific domain', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', '#controllers/posts.index').as('showPost')
    router
      .get('articles/:id', '#controllers/posts.index')
      .as('showPost')
      .domain('blog.adonisjs.com')

    router.commit()

    const url = router.makeSignedUrl(
      '#controllers/posts.index',
      { id: 1 },
      {
        domain: 'blog.adonisjs.com',
      }
    )!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/articles/1')
  })

  test('make signed url with expiry', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', 'PostsController.index')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', { id: 1, expiresIn: '1m' })!
    const qs = parse(url.split('?')[1])

    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url with custom query string', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', 'PostsController.index')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', [1], {
      qs: { page: 1 },
    })!
    const qs = parse(url.split('?')[1])

    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1?page=1')
    assert.equal(Number(qs.page), 1)
  })

  test('prefix url', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router.get('posts/:id', async function handler() {}).as('showPost')
    router.commit()

    const url = router.makeSignedUrl(
      'showPost',
      { id: 1 },
      { prefixUrl: 'https://blog.adonisjs.com' }
    )!

    assert.equal(url.split('?')[0], 'https://blog.adonisjs.com/posts/1')
  })

  test('disable route lookup', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    const url = router.makeSignedUrl(
      '/posts/:id',
      { id: 1 },
      { prefixUrl: 'https://blog.adonisjs.com', disableRouteLookup: true }
    )!

    assert.equal(url.split('?')[0], 'https://blog.adonisjs.com/posts/1')
  })
})

test.group('Regression', () => {
  test('route where matchers should win over group matchers', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router
          .group(() => {
            router.get('/:id', 'HomeController.index').where('id', /^[0-9]$/)
          })
          .where('id', /^[a-z]$/)
      })
      .where('id', /^[a-z0-9]$/)

    router.commit()
    assert.containsSubset(router.toJSON(), {
      root: [
        {
          pattern: '/:id',
          matchers: {
            id: /^[0-9]$/,
          },
        },
      ],
    })
  })

  test('apply prefixes in the correct order', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', 'HomeController.index').prefix('/foo')
          })
          .prefix('/bar')
      })
      .prefix('/baz')

    router.commit()
    assert.containsSubset(router.toJSON(), {
      root: [
        {
          pattern: '/baz/bar/foo',
        },
      ],
    })
  })

  test('route domain should win over group domain', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', 'HomeController.index').domain('foo.com')
          })
          .domain('bar.com')
      })
      .domain('baz.com')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      'foo.com': [
        {
          pattern: '/',
        },
      ],
    })
  })

  test('apply route names in the right order', ({ assert }) => {
    const app = new AppFactory().create()
    const encryption = new EncryptionFactory().create()

    const router = new Router(app, encryption, new MiddlewareStore([], {}))

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', 'HomeController.index').as('showById')
          })
          .as('admin')
      })
      .as('auth')

    router.commit()

    assert.containsSubset(router.toJSON(), {
      root: [
        {
          name: 'auth.admin.showById',
        },
      ],
    })
  })
})
