/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { parse } from 'querystring'
import { Router } from '../src/Router'
import { Route } from '../src/Router/Route'
import { RouteGroup } from '../src/Router/Group'
import { BriskRoute } from '../src/Router/BriskRoute'
import { RouteResource } from '../src/Router/Resource'

import { encryption } from '../test-helpers'

test.group('Router', () => {
  test('add route class from the router instance', ({ assert }) => {
    const router = new Router(encryption)

    assert.deepEqual(router.BriskRoute, BriskRoute)
    assert.deepEqual(router.RouteResource, RouteResource)
    assert.deepEqual(router.RouteGroup, RouteGroup)
    assert.deepEqual(router.Route, Route)
  })
})

test.group('Router | add', () => {
  test('add routes', ({ assert }) => {
    const router = new Router(encryption)

    const getRoute = router.get('/', 'HomeController.index')
    const postRoute = router.post('/', 'HomeController.store')
    const putRoute = router.put('/', 'HomeController.update')
    const patchRoute = router.patch('/', 'HomeController.updatePatch')
    const deleteRoute = router.delete('/', 'HomeController.destroy')
    const anyRoute = router.any('/', 'HomeController.handle')

    assert.deepEqual(getRoute.toJSON(), {
      pattern: '/',
      methods: ['HEAD', 'GET'],
      meta: {
        namespace: undefined,
      },
      matchers: {},
      domain: 'root',
      handler: 'HomeController.index',
      middleware: [],
      name: undefined,
    })

    assert.deepEqual(postRoute.toJSON(), {
      pattern: '/',
      methods: ['POST'],
      meta: {
        namespace: undefined,
      },
      matchers: {},
      domain: 'root',
      handler: 'HomeController.store',
      middleware: [],
      name: undefined,
    })

    assert.deepEqual(putRoute.toJSON(), {
      pattern: '/',
      methods: ['PUT'],
      meta: {
        namespace: undefined,
      },
      matchers: {},
      domain: 'root',
      handler: 'HomeController.update',
      middleware: [],
      name: undefined,
    })

    assert.deepEqual(patchRoute.toJSON(), {
      pattern: '/',
      methods: ['PATCH'],
      meta: {
        namespace: undefined,
      },
      matchers: {},
      domain: 'root',
      handler: 'HomeController.updatePatch',
      middleware: [],
      name: undefined,
    })

    assert.deepEqual(deleteRoute.toJSON(), {
      pattern: '/',
      methods: ['DELETE'],
      meta: {
        namespace: undefined,
      },
      matchers: {},
      domain: 'root',
      handler: 'HomeController.destroy',
      middleware: [],
      name: undefined,
    })

    assert.deepEqual(anyRoute.toJSON(), {
      pattern: '/',
      methods: ['HEAD', 'OPTIONS', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
      meta: {
        namespace: undefined,
      },
      matchers: {},
      domain: 'root',
      handler: 'HomeController.handle',
      middleware: [],
      name: undefined,
    })
  })

  test('raise error when route name is duplicate', ({ assert }) => {
    const router = new Router(encryption)

    router.get('/', async function handler() {}).as('home')
    router.get('home', async function handler() {}).as('home')

    const fn = () => router.commit()
    assert.throws(fn, 'E_DUPLICATE_ROUTE_NAME: Duplicate route name "home"')
  })

  test('raise error when prefixing route name of route with undefined name', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler() {}

    try {
      router
        .group(() => {
          router.get('/', handler)
        })
        .prefix('api/v1')
        .as('v1')
    } catch (error) {
      assert.equal(
        error.message,
        'E_CANNOT_DEFINE_GROUP_NAME: All the routes inside a group must have names before calling "Route.group.as"'
      )
    }
  })

  test('raise error when prefixing brisk route name of route with undefined name', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler() {}

    try {
      router
        .group(() => {
          router.on('/').setHandler(handler, 'render')
        })
        .prefix('api/v1')
        .as('v1')
    } catch (error) {
      assert.equal(
        error.message,
        'E_CANNOT_DEFINE_GROUP_NAME: All the routes inside a group must have names before calling "Route.group.as"'
      )
    }
  })

  test('allow nested groups', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1': {
                pattern: '/api/v1',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1': {
                pattern: '/api/v1',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply middleware in nested groups', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', handler)
          })
          .middleware('admin:acl')
      })
      .middleware('auth')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: ['auth', 'admin:acl'],
                name: undefined,
              },
            },
          },
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: ['auth', 'admin:acl'],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply domain in nested groups', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply namespace in nested groups', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler() {}

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', handler)
          })
          .namespace('User')
      })
      .namespace('Admin')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler,
                meta: {
                  namespace: 'User',
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler,
                meta: {
                  namespace: 'User',
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply route matchers in nested groups', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/:user_id/:id',
                  type: 1,
                  val: 'user_id',
                  end: '',
                  matcher: /[0-9]/,
                  cast: undefined,
                },
                {
                  old: '/:user_id/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: /[a-z]/,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/:user_id/:id': {
                pattern: '/:user_id/:id',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/:user_id/:id',
                  type: 1,
                  val: 'user_id',
                  end: '',
                  matcher: /[0-9]/,
                  cast: undefined,
                },
                {
                  old: '/:user_id/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: /[a-z]/,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/:user_id/:id': {
                pattern: '/:user_id/:id',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply route matchers using shorthand methods', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler() {}

    const route = router
      .get('/:user_id', handler)
      .where('user_id', router.matchers.number())
      .toJSON()

    assert.deepEqual(route.matchers.user_id.match, /^[0-9]+$/)
  })

  test('test empty string param against the matcher', ({ assert }) => {
    const router = new Router(encryption)
    async function handler() {}

    router.get('user/:user_id', handler)
    router.get('users/:user_id', handler).where('user_id', router.matchers.number())
    router.commit()

    assert.isNull(router.match('/users/ ', 'GET'))
    assert.isNotNull(router.match('/user/ ', 'GET')) // without matcher
  })

  test('apply route names in group', ({ assert }) => {
    assert.plan(1)

    const router = new Router(encryption)
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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'api.admin.home',
              },
            },
          },
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'api.admin.home',
              },
            },
          },
        },
      },
    })
  })
})

test.group('Router | commit', () => {
  test('commit routes to the store', ({ assert }) => {
    const router = new Router(encryption)

    async function handler() {}
    router.get('/', handler)
    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('commit routes group to the store', ({ assert }) => {
    const router = new Router(encryption)

    async function handler() {}
    router
      .group(() => {
        router.get('/', handler)
      })
      .prefix('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/api',
                  type: 0,
                  val: 'api',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api': {
                pattern: '/api',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/api',
                  type: 0,
                  val: 'api',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api': {
                pattern: '/api',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('define resource inside a group', ({ assert }) => {
    const router = new Router(encryption)

    router
      .group(() => {
        router.resource('posts', 'PostController')
      })
      .prefix('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/api/posts',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/posts/create',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/create',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
              [
                {
                  old: '/api/posts/:id/edit',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id/edit',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id/edit',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/api/posts/:id/edit',
                  type: 0,
                  val: 'edit',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/posts': {
                pattern: '/api/posts',
                handler: 'PostController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.index',
              },
              '/api/posts/create': {
                pattern: '/api/posts/create',
                handler: 'PostController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.create',
              },
              '/api/posts/:id': {
                pattern: '/api/posts/:id',
                handler: 'PostController.show',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.show',
              },
              '/api/posts/:id/edit': {
                pattern: '/api/posts/:id/edit',
                handler: 'PostController.edit',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.edit',
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/api/posts',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/posts/create',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/create',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
              [
                {
                  old: '/api/posts/:id/edit',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id/edit',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id/edit',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/api/posts/:id/edit',
                  type: 0,
                  val: 'edit',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/posts': {
                pattern: '/api/posts',
                handler: 'PostController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.index',
              },
              '/api/posts/create': {
                pattern: '/api/posts/create',
                handler: 'PostController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.create',
              },
              '/api/posts/:id': {
                pattern: '/api/posts/:id',
                handler: 'PostController.show',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.show',
              },
              '/api/posts/:id/edit': {
                pattern: '/api/posts/:id/edit',
                handler: 'PostController.edit',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.edit',
              },
            },
          },
          POST: {
            tokens: [
              [
                {
                  old: '/api/posts',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/posts': {
                pattern: '/api/posts',
                handler: 'PostController.store',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.store',
              },
            },
          },
          PUT: {
            tokens: [
              [
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/api/posts/:id': {
                pattern: '/api/posts/:id',
                handler: 'PostController.update',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.update',
              },
            },
          },
          PATCH: {
            tokens: [
              [
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/api/posts/:id': {
                pattern: '/api/posts/:id',
                handler: 'PostController.update',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.update',
              },
            },
          },
          DELETE: {
            tokens: [
              [
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/api/posts/:id': {
                pattern: '/api/posts/:id',
                handler: 'PostController.destroy',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.destroy',
              },
            },
          },
        },
      },
    })
  })

  test('define resource inside nested groups', ({ assert }) => {
    const router = new Router(encryption)

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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
              [
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'edit',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1/posts': {
                pattern: '/api/v1/posts',
                handler: 'PostController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.index',
              },
              '/api/v1/posts/create': {
                pattern: '/api/v1/posts/create',
                handler: 'PostController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.create',
              },
              '/api/v1/posts/:id': {
                pattern: '/api/v1/posts/:id',
                handler: 'PostController.show',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.show',
              },
              '/api/v1/posts/:id/edit': {
                pattern: '/api/v1/posts/:id/edit',
                handler: 'PostController.edit',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.edit',
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
              [
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
              [
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/api/v1/posts/:id/edit',
                  type: 0,
                  val: 'edit',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1/posts': {
                pattern: '/api/v1/posts',
                handler: 'PostController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.index',
              },
              '/api/v1/posts/create': {
                pattern: '/api/v1/posts/create',
                handler: 'PostController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.create',
              },
              '/api/v1/posts/:id': {
                pattern: '/api/v1/posts/:id',
                handler: 'PostController.show',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.show',
              },
              '/api/v1/posts/:id/edit': {
                pattern: '/api/v1/posts/:id/edit',
                handler: 'PostController.edit',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.edit',
              },
            },
          },
          POST: {
            tokens: [
              [
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1/posts': {
                pattern: '/api/v1/posts',
                handler: 'PostController.store',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.store',
              },
            },
          },
          PUT: {
            tokens: [
              [
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/api/v1/posts/:id': {
                pattern: '/api/v1/posts/:id',
                handler: 'PostController.update',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.update',
              },
            },
          },
          PATCH: {
            tokens: [
              [
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/api/v1/posts/:id': {
                pattern: '/api/v1/posts/:id',
                handler: 'PostController.update',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.update',
              },
            },
          },
          DELETE: {
            tokens: [
              [
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/api/v1/posts/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/api/v1/posts/:id': {
                pattern: '/api/v1/posts/:id',
                handler: 'PostController.destroy',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.destroy',
              },
            },
          },
        },
      },
    })
  })

  test('define shallow resource', ({ assert }) => {
    const router = new Router(encryption)

    router.shallowResource('posts.comments', 'CommentsController')
    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/posts/:post_id/comments',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments',
                  type: 1,
                  val: 'post_id',
                  matcher: undefined,
                  cast: undefined,
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
              ],
              [
                {
                  old: '/posts/:post_id/comments/create',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments/create',
                  type: 1,
                  val: 'post_id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/posts/:post_id/comments/create',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
              [
                {
                  old: '/comments/:id',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
              [
                {
                  old: '/comments/:id/edit',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id/edit',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/comments/:id/edit',
                  type: 0,
                  val: 'edit',
                  end: '',
                },
              ],
            ],
            routes: {
              '/posts/:post_id/comments': {
                pattern: '/posts/:post_id/comments',
                handler: 'CommentsController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.index',
              },
              '/posts/:post_id/comments/create': {
                pattern: '/posts/:post_id/comments/create',
                handler: 'CommentsController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.create',
              },
              '/comments/:id': {
                pattern: '/comments/:id',
                handler: 'CommentsController.show',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.show',
              },
              '/comments/:id/edit': {
                pattern: '/comments/:id/edit',
                handler: 'CommentsController.edit',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.edit',
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/posts/:post_id/comments',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments',
                  type: 1,
                  val: 'post_id',
                  matcher: undefined,
                  cast: undefined,
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
              ],
              [
                {
                  old: '/posts/:post_id/comments/create',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments/create',
                  type: 1,
                  val: 'post_id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/posts/:post_id/comments/create',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
              [
                {
                  old: '/comments/:id',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
              [
                {
                  old: '/comments/:id/edit',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id/edit',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
                {
                  old: '/comments/:id/edit',
                  type: 0,
                  val: 'edit',
                  end: '',
                },
              ],
            ],
            routes: {
              '/posts/:post_id/comments': {
                pattern: '/posts/:post_id/comments',
                handler: 'CommentsController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.index',
              },
              '/posts/:post_id/comments/create': {
                pattern: '/posts/:post_id/comments/create',
                handler: 'CommentsController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.create',
              },
              '/comments/:id': {
                pattern: '/comments/:id',
                handler: 'CommentsController.show',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.show',
              },
              '/comments/:id/edit': {
                pattern: '/comments/:id/edit',
                handler: 'CommentsController.edit',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.edit',
              },
            },
          },
          POST: {
            tokens: [
              [
                {
                  old: '/posts/:post_id/comments',
                  type: 0,
                  val: 'posts',
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments',
                  type: 1,
                  val: 'post_id',
                  matcher: undefined,
                  cast: undefined,
                  end: '',
                },
                {
                  old: '/posts/:post_id/comments',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
              ],
            ],
            routes: {
              '/posts/:post_id/comments': {
                pattern: '/posts/:post_id/comments',
                handler: 'CommentsController.store',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.store',
              },
            },
          },
          PUT: {
            tokens: [
              [
                {
                  old: '/comments/:id',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/comments/:id': {
                pattern: '/comments/:id',
                handler: 'CommentsController.update',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.update',
              },
            },
          },
          PATCH: {
            tokens: [
              [
                {
                  old: '/comments/:id',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/comments/:id': {
                pattern: '/comments/:id',
                handler: 'CommentsController.update',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.update',
              },
            },
          },
          DELETE: {
            tokens: [
              [
                {
                  old: '/comments/:id',
                  type: 0,
                  val: 'comments',
                  end: '',
                },
                {
                  old: '/comments/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: undefined,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/comments/:id': {
                pattern: '/comments/:id',
                handler: 'CommentsController.destroy',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'posts.comments.destroy',
              },
            },
          },
        },
      },
    })
  })

  test('do not commit route when deleted flag is set to true', ({ assert }) => {
    const router = new Router(encryption)

    async function handler() {}
    const route = router.get('/', handler)
    route.deleted = true

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [],
      domains: {},
    })
  })

  test('filter resource routes inside a named group', ({ assert }) => {
    const router = new Router(encryption)

    router
      .group(() => {
        router.resource('photos', 'PhotosController').only(['create'])
      })
      .as('v1')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'photos',
                  end: '',
                },
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
            ],
            routes: {
              '/photos/create': {
                pattern: '/photos/create',
                handler: 'PhotosController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'v1.photos.create',
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'photos',
                  end: '',
                },
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
            ],
            routes: {
              '/photos/create': {
                pattern: '/photos/create',
                handler: 'PhotosController.create',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'v1.photos.create',
              },
            },
          },
        },
      },
    })
  })

  test('process routes via pre processor if defined', ({ assert }) => {
    const router = new Router(encryption, (routeJSON) => {
      routeJSON.meta.processed = true
    })

    router.get('/', 'FooHandler.get')
    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler: 'FooHandler.get',
                meta: {
                  processed: true,
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler: 'FooHandler.get',
                meta: {
                  processed: true,
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('process resource via pre processor if defined', ({ assert }) => {
    const router = new Router(encryption, (routeJSON) => {
      routeJSON.meta.processed = true
    })

    router.resource('photos', 'PhotosController').only(['create'])
    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'photos',
                  end: '',
                },
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
            ],
            routes: {
              '/photos/create': {
                pattern: '/photos/create',
                handler: 'PhotosController.create',
                meta: {
                  processed: true,
                  namespace: undefined,
                },
                middleware: [],
                name: 'photos.create',
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'photos',
                  end: '',
                },
                {
                  old: '/photos/create',
                  type: 0,
                  val: 'create',
                  end: '',
                },
              ],
            ],
            routes: {
              '/photos/create': {
                pattern: '/photos/create',
                handler: 'PhotosController.create',
                meta: {
                  processed: true,
                  namespace: undefined,
                },
                middleware: [],
                name: 'photos.create',
              },
            },
          },
        },
      },
    })
  })

  test('process group routes via pre processor if defined', ({ assert }) => {
    const router = new Router(encryption, (routeJSON) => {
      routeJSON.meta.processed = true
    })

    router.group(() => {
      router.get('/', 'FooHandler.get')
    })
    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler: 'FooHandler.get',
                meta: {
                  processed: true,
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler: 'FooHandler.get',
                meta: {
                  processed: true,
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('define global matchers', ({ assert }) => {
    const router = new Router(encryption)
    router.where('id', '^[a-z]+')

    async function handler() {}
    router.get('/:id', handler)
    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: /^[a-z]+/,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/:id': {
                pattern: '/:id',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/:id',
                  type: 1,
                  val: 'id',
                  end: '',
                  matcher: /^[a-z]+/,
                  cast: undefined,
                },
              ],
            ],
            routes: {
              '/:id': {
                pattern: '/:id',
                handler,
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })
})

test.group('Router | match', () => {
  test('match route using URL', ({ assert }) => {
    const router = new Router(encryption)

    router.resource('photos', 'PhotosController')
    router.commit()

    assert.deepEqual(router.match('photos', 'GET')!, {
      params: {},
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos',
        name: 'photos.index',
        handler: 'PhotosController.index',
      },
      routeKey: 'GET-/photos',
      subdomains: {},
    })

    assert.deepEqual(router.match('photos/create', 'GET')!, {
      params: {},
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos/create',
        name: 'photos.create',
        handler: 'PhotosController.create',
      },
      routeKey: 'GET-/photos/create',
      subdomains: {},
    })

    assert.deepEqual(router.match('photos', 'POST')!, {
      params: {},
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos',
        name: 'photos.store',
        handler: 'PhotosController.store',
      },
      routeKey: 'POST-/photos',
      subdomains: {},
    })

    assert.deepEqual(router.match('photos/1', 'GET')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos/:id',
        name: 'photos.show',
        handler: 'PhotosController.show',
      },
      routeKey: 'GET-/photos/:id',
      subdomains: {},
    })

    assert.deepEqual(router.match('photos/1/edit', 'GET')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos/:id/edit',
        name: 'photos.edit',
        handler: 'PhotosController.edit',
      },
      routeKey: 'GET-/photos/:id/edit',
      subdomains: {},
    })

    assert.deepEqual(router.match('photos/1', 'PUT')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos/:id',
        name: 'photos.update',
        handler: 'PhotosController.update',
      },
      routeKey: 'PUT-/photos/:id',
      subdomains: {},
    })

    assert.deepEqual(router.match('photos/1', 'DELETE')!, {
      params: {
        id: '1',
      },
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos/:id',
        name: 'photos.destroy',
        handler: 'PhotosController.destroy',
      },
      routeKey: 'DELETE-/photos/:id',
      subdomains: {},
    })
  })

  test('apply uuid matcher when matching route', ({ assert }) => {
    const router = new Router(encryption)

    router.get('photos/:id', 'PhotosController.show').where('id', router.matchers.uuid())
    router.commit()

    assert.deepEqual(router.match('photos/78fee49A-3d79-43bc-b93f-1ac4ba9e925B', 'GET')!, {
      params: {
        id: '78fee49a-3d79-43bc-b93f-1ac4ba9e925b',
      },
      route: {
        meta: {
          namespace: undefined,
        },
        middleware: [],
        pattern: '/photos/:id',
        name: undefined,
        handler: 'PhotosController.show',
      },
      routeKey: 'GET-/photos/:id',
      subdomains: {},
    })
  })
})

test.group('Brisk route', () => {
  test('define brisk route', ({ assert }) => {
    const router = new Router(encryption)
    async function handler() {}

    router.on('/').setHandler(handler, 'render')
    router.commit()

    assert.deepEqual(router.toJSON(), {
      root: [
        {
          name: undefined,
          pattern: '/',
          handler,
          methods: ['HEAD', 'GET'],
          middleware: [],
          meta: {
            namespace: undefined,
          },
        },
      ],
    })
  })

  test('define brisk route inside a group', ({ assert }) => {
    const router = new Router(encryption)
    async function handler() {}

    router
      .group(() => {
        router.on('/').setHandler(handler, 'render').as('root')
      })
      .prefix('api/v1')
      .as('v1')

    router.commit()

    assert.deepEqual(router.toJSON(), {
      root: [
        {
          name: 'v1.root',
          pattern: '/api/v1',
          handler,
          middleware: [],
          meta: {
            namespace: undefined,
          },
          methods: ['HEAD', 'GET'],
        },
      ],
    })
  })

  test('register brisk route to store', ({ assert }) => {
    const router = new Router(encryption)
    async function handler() {}

    router
      .group(() => {
        router.on('/').setHandler(handler, 'render').as('root')
      })
      .prefix('api/v1')
      .as('v1')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1': {
                pattern: '/api/v1',
                meta: {
                  namespace: undefined,
                },
                handler,
                middleware: [],
                name: 'v1.root',
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'api',
                  end: '',
                },
                {
                  old: '/api/v1',
                  type: 0,
                  val: 'v1',
                  end: '',
                },
              ],
            ],
            routes: {
              '/api/v1': {
                pattern: '/api/v1',
                meta: {
                  namespace: undefined,
                },
                handler,
                middleware: [],
                name: 'v1.root',
              },
            },
          },
        },
      },
    })
  })
})

test.group('Router | Make url', () => {
  test('make url to a given route', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', async function handler() {})
    router.commit()

    const url = router.makeUrl('/posts/:id', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test("make url to a given route by it's name", ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', async function handler() {}).as('showPost')
    router.commit()

    const url = router.makeUrl('showPost', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test("make url to a given route by it's controller method", ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.makeUrl('PostsController.index', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test('make url using the builder', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.builder().params([1]).make('PostsController.index')
    assert.equal(url, '/posts/1')
  })

  test('add query string to the url', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.builder().params([1]).qs({ name: 'virk' }).make('PostsController.index')
    assert.equal(url, '/posts/1?name=virk')
  })

  test('prefix url', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router
      .builder()
      .params([1])
      .qs({ name: 'virk' })
      .prefixUrl('http://blog.adonisjs.com')
      .make('PostsController.index')

    assert.equal(url, 'http://blog.adonisjs.com/posts/1?name=virk')
  })

  test('make url for a domain', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.get('article/:id', 'PostsController.index').domain(':blog.adonisjs.com')
    router.commit()

    const url = router
      .builderForDomain(':blog.adonisjs.com')
      .params([1])
      .qs({ name: 'virk' })
      .make('PostsController.index')

    assert.equal(url, '/article/1?name=virk')
  })

  test('make url for a wildcard route', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/*', async function handler() {})
    router.commit()

    assert.equal(router.makeUrl('/posts/*', { '*': ['1', 'foo'] })!, '/posts/1/foo')
    assert.equal(router.makeUrl('/posts/*', ['1', 'foo'])!, '/posts/1/foo')
  })

  test('make url for a wildcard route after a named param', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id/*', async function handler() {})
    router.commit()

    assert.equal(router.makeUrl('/posts/:id/*', ['1', 'foo'])!, '/posts/1/foo')
    assert.equal(router.makeUrl('/posts/:id/*', { 'id': 1, '*': ['foo'] })!, '/posts/1/foo')
  })

  test('raise exception when wildcard params are missing', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/*', async function handler() {})
    router.commit()

    assert.throws(
      () => router.makeUrl('/posts/*', [])!,
      'E_CANNOT_MAKE_ROUTE_URL: "*" param is required to make URL for "/posts/*" route'
    )
    assert.throws(
      () => router.makeUrl('/posts/*', {})!,
      'E_CANNOT_MAKE_ROUTE_URL: "*" param is required to make URL for "/posts/*" route'
    )
    assert.throws(
      () => router.makeUrl('/posts/*', { '*': '' })!,
      'E_CANNOT_MAKE_ROUTE_URL: "*" param is required to make URL for "/posts/*" route'
    )
  })
})

test.group('Make signed url', () => {
  test('make signed url to a given route', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', async function handler() {})
    router.commit()

    const url = router.makeSignedUrl('/posts/:id', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test("make signed url to a given route by it's name", ({ assert }) => {
    const router = new Router(encryption)

    router.get('posts/:id', async function handler() {}).as('showPost')
    router.commit()

    const url = router.makeSignedUrl('showPost', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test("make signed url to a given route by it's controller method", ({ assert }) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url with expiry', ({ assert }) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', { id: 1, expiresIn: '1m' })!
    const qs = parse(url.split('?')[1])

    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url with custom query string', ({ assert }) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', {
      id: 1,
      qs: { page: 1 },
    })!
    const qs = parse(url.split('?')[1])

    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1?page=1')
    assert.equal(Number(qs.page), 1)
  })

  test('make url using the builder', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.builder().params([1]).makeSigned('PostsController.index')
    const qs = parse(url.split('?')[1])

    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('add query string to the url', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router
      .builder()
      .params([1])
      .qs({ name: 'virk' })
      .makeSigned('PostsController.index')

    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1?name=virk')
  })

  test('prefix url', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router
      .builder()
      .params([1])
      .qs({ name: 'virk' })
      .prefixUrl('http://blog.adonisjs.com')
      .makeSigned('PostsController.index')

    const qs = parse(url.split('?')[1])

    /**
     * We intentionally do not add prefix url to the signature
     */
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1?name=virk')
  })

  test('make url for a domain', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.get('article/:id', 'PostsController.index').domain(':blog.adonisjs.com')
    router.commit()

    const url = router
      .builderForDomain(':blog.adonisjs.com')
      .params([1])
      .qs({ name: 'virk' })
      .makeSigned('PostsController.index')

    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/article/1?name=virk')
  })

  test('make url for a wildcard route', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/*', async function handler() {})
    router.commit()

    const url = router.makeSignedUrl('/posts/*', { '*': ['1', 'foo'] })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1/foo')
  })

  test('make url for a wildcard route after a named param', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/:id/*', async function handler() {})
    router.commit()

    const url = router.makeSignedUrl('/posts/:id/*', { 'id': '1', '*': ['foo'] })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1/foo')
  })

  test('raise exception when wildcard params are missing', ({ assert }) => {
    const router = new Router(encryption)
    router.get('posts/*', async function handler() {})
    router.commit()

    assert.throws(
      () => router.makeSignedUrl('/posts/*', [])!,
      'E_CANNOT_MAKE_ROUTE_URL: "*" param is required to make URL for "/posts/*" route'
    )
    assert.throws(
      () => router.makeSignedUrl('/posts/*', {})!,
      'E_CANNOT_MAKE_ROUTE_URL: "*" param is required to make URL for "/posts/*" route'
    )
    assert.throws(
      () => router.makeSignedUrl('/posts/*', { '*': '' })!,
      'E_CANNOT_MAKE_ROUTE_URL: "*" param is required to make URL for "/posts/*" route'
    )
  })
})

test.group('Regression', () => {
  test('route where matchers should win over group domain', ({ assert }) => {
    const router = new Router(encryption)

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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  cast: undefined,
                  old: '/:id',
                  type: 1,
                  val: 'id',
                  matcher: /^[0-9]$/,
                  end: '',
                },
              ],
            ],
            routes: {
              '/:id': {
                pattern: '/:id',
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  cast: undefined,
                  old: '/:id',
                  type: 1,
                  val: 'id',
                  matcher: /^[0-9]$/,
                  end: '',
                },
              ],
            ],
            routes: {
              '/:id': {
                pattern: '/:id',
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply prefixes in the correct order', ({ assert }) => {
    const router = new Router(encryption)

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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
            tokens: [
              [
                {
                  old: '/baz/bar/foo',
                  type: 0,
                  val: 'baz',
                  end: '',
                },
                {
                  old: '/baz/bar/foo',
                  type: 0,
                  val: 'bar',
                  end: '',
                },
                {
                  old: '/baz/bar/foo',
                  type: 0,
                  val: 'foo',
                  end: '',
                },
              ],
            ],
            routes: {
              '/baz/bar/foo': {
                pattern: '/baz/bar/foo',
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
          GET: {
            tokens: [
              [
                {
                  old: '/baz/bar/foo',
                  type: 0,
                  val: 'baz',
                  end: '',
                },
                {
                  old: '/baz/bar/foo',
                  type: 0,
                  val: 'bar',
                  end: '',
                },
                {
                  old: '/baz/bar/foo',
                  type: 0,
                  val: 'foo',
                  end: '',
                },
              ],
            ],
            routes: {
              '/baz/bar/foo': {
                pattern: '/baz/bar/foo',
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('route domain should win over group domain', ({ assert }) => {
    const router = new Router(encryption)

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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('apply route names in the right order', ({ assert }) => {
    const router = new Router(encryption)

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

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'auth.admin.showById',
              },
            },
          },
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
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: [],
                name: 'auth.admin.showById',
              },
            },
          },
        },
      },
    })
  })

  test('apply middleware in the right order', ({ assert }) => {
    const router = new Router(encryption)

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', 'HomeController.index').middleware('bar').middleware('baz')
          })
          .middleware('group1Bar')
          .middleware('group1Baz')
      })
      .middleware('group2Bar')
      .middleware('group2Baz')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: ['group2Bar', 'group2Baz', 'group1Bar', 'group1Baz', 'bar', 'baz'],
                name: undefined,
              },
            },
          },
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
                handler: 'HomeController.index',
                meta: {
                  namespace: undefined,
                },
                middleware: ['group2Bar', 'group2Baz', 'group1Bar', 'group1Baz', 'bar', 'baz'],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })

  test('route namespace should win', ({ assert }) => {
    const router = new Router(encryption)

    router
      .group(() => {
        router
          .group(() => {
            router.get('/', 'HomeController.index').namespace('Main')
          })
          .namespace('Auth')
      })
      .namespace('Shop')

    router.commit()

    assert.deepEqual(router['store'].tree, {
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
          HEAD: {
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
                handler: 'HomeController.index',
                meta: {
                  namespace: 'Main',
                },
                middleware: [],
                name: undefined,
              },
            },
          },
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
                handler: 'HomeController.index',
                meta: {
                  namespace: 'Main',
                },
                middleware: [],
                name: undefined,
              },
            },
          },
        },
      },
    })
  })
})
