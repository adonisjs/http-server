/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { parse } from 'querystring'
import { Router } from '../src/Router'
import { BriskRoute } from '../src/Router/BriskRoute'
import { RouteResource } from '../src/Router/Resource'
import { RouteGroup } from '../src/Router/Group'
import { Route } from '../src/Router/Route'
import { Encryption } from '@adonisjs/encryption/build/standalone'

const SECRET = 'averylongrandom32charslongsecret'
const encryption = new Encryption({ secret: SECRET })

test.group('Router', () => {
  test('add route class from the router instance', (assert) => {
    const router = new Router(encryption)

    assert.deepEqual(router.BriskRoute, BriskRoute)
    assert.deepEqual(router.RouteResource, RouteResource)
    assert.deepEqual(router.RouteGroup, RouteGroup)
    assert.deepEqual(router.Route, Route)
  })
})

test.group('Router | add', () => {
  test('add routes', (assert) => {
    const router = new Router(encryption)

    const getRoute = router.get('/', 'HomeController.index')
    const postRoute = router.post('/', 'HomeController.store')
    const putRoute = router.put('/', 'HomeController.update')
    const patchRoute = router.patch('/', 'HomeController.updatePatch')
    const deleteRoute = router.delete('/', 'HomeController.destroy')
    const anyRoute = router.any('/', 'HomeController.handle')

    assert.deepEqual(getRoute.toJSON(), {
      pattern: '/',
      methods: ['GET'],
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

  test('raise error when route name is duplicate', (assert) => {
    const router = new Router(encryption)

    router.get('/', async function handler () {}).as('home')
    router.get('home', async function handler () {}).as('home')

    const fn = () => router.commit()
    assert.throw(fn, 'Duplicate route name `home`')
  })

  test('raise error when prefixing route name of route with undefined name', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    try {
      router.group(() => {
        router.get('/', handler)
      }).prefix('api/v1').as('v1')
    } catch (error) {
      assert.equal(
        error.message,
        'E_MISSING_ROUTE_NAME: All routes inside a group must have names before calling Route.group.as',
      )
    }
  })

  test('raise error when prefixing brisk route name of route with undefined name', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    try {
      router.group(() => {
        router.on('/').setHandler(handler, 'render')
      }).prefix('api/v1').as('v1')
    } catch (error) {
      assert.equal(
        error.message,
        'E_MISSING_ROUTE_NAME: All routes inside a group must have names before calling Route.group.as',
      )
    }
  })

  test('allow nested groups', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.group(() => {
        router.get('/', handler)
      }).prefix('v1')
    }).prefix('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[
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
            ]],
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

  test('apply middleware in nested groups', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.group(() => {
        router.get('/', handler)
      }).middleware('admin:acl')
    }).middleware('auth')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[
              {
                old: '/',
                type: 0,
                val: '/',
                end: '',
              },
            ]],
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

  test('apply domain in nested groups', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.group(() => {
        router.get('/', handler)
      }).domain('foo.com')
    }).domain('bar.com')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'foo.com',
        type: 0,
        val: 'foo.com',
        end: '',
      }]],
      domains: {
        'foo.com': {
          'GET': {
            tokens: [[
              {
                old: '/',
                type: 0,
                val: '/',
                end: '',
              },
            ]],
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

  test('apply namespace in nested groups', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.group(() => {
        router.get('/', handler)
      }).namespace('User')
    }).namespace('Admin')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[
              {
                old: '/',
                type: 0,
                val: '/',
                end: '',
              },
            ]],
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

  test('apply route matchers in nested groups', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.group(() => {
        router.get('/:user_id/:id', handler)
      }).where('id', '[a-z]').where('user_id', '[0-9]')
    }).where('id', '[0-9]')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[
              {
                old: '/:user_id/:id',
                type: 1,
                val: 'user_id',
                end: '',
                matcher: /[0-9]/,
              },
              {
                old: '/:user_id/:id',
                type: 1,
                val: 'id',
                end: '',
                matcher: /[a-z]/,
              },
            ]],
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

  test('apply route names in group', (assert) => {
    assert.plan(1)

    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.group(() => {
        router.get('/', handler).as('home')
      }).as('admin')
    }).as('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[
              {
                old: '/',
                type: 0,
                val: '/',
                end: '',
              },
            ]],
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
  test('commit routes to the store', (assert) => {
    const router = new Router(encryption)

    async function handler () {}
    router.get('/', handler)
    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[{
              old: '/',
              type: 0,
              val: '/',
              end: '',
            }]],
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

  test('commit routes group to the store', (assert) => {
    const router = new Router(encryption)

    async function handler () {}
    router.group(() => {
      router.get('/', handler)
    }).prefix('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[{
              old: '/api',
              type: 0,
              val: 'api',
              end: '',
            }]],
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

  test('define resource inside a group', (assert) => {
    const router = new Router(encryption)

    router.group(() => {
      router.resource('posts', 'PostController')
    }).prefix('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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
          'POST': {
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
          'PUT': {
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
          'PATCH': {
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
          'DELETE': {
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

  test('define resource inside nested groups', (assert) => {
    const router = new Router(encryption)

    router.group(() => {
      router.group(() => {
        router.resource('posts', 'PostController')
      }).prefix('v1')
    }).prefix('api')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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
          'POST': {
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
          'PUT': {
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
          'PATCH': {
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
          'DELETE': {
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

  test('define shallow resource', (assert) => {
    const router = new Router(encryption)

    router.shallowResource('posts.comments', 'CommentsController')
    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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
          'POST': {
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
          'PUT': {
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
          'PATCH': {
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
          'DELETE': {
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

  test('do not commit route when deleted flag is set to true', (assert) => {
    const router = new Router(encryption)

    async function handler () {}
    const route = router.get('/', handler)
    route.deleted = true

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [],
      domains: {},
    })
  })

  test('filter resource routes inside a named group', (assert) => {
    const router = new Router(encryption)

    router.group(() => {
      router.resource('photos', 'PhotosController').only(['create'])
    }).as('v1')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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

  test('process routes via pre processor if defined', (assert) => {
    const router = new Router(encryption, (routeJSON) => {
      routeJSON.meta.processed = true
    })

    router.get('/', 'FooHandler.get')
    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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

  test('process resource via pre processor if defined', (assert) => {
    const router = new Router(encryption, (routeJSON) => {
      routeJSON.meta.processed = true
    })

    router.resource('photos', 'PhotosController').only(['create'])
    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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

  test('process group routes via pre processor if defined', (assert) => {
    const router = new Router(encryption, (routeJSON) => {
      routeJSON.meta.processed = true
    })

    router.group(() => {
      router.get('/', 'FooHandler.get')
    })
    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
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

  test('define global matchers', (assert) => {
    const router = new Router(encryption)
    router.where('id', '^[a-z]+')

    async function handler () {}
    router.get('/:id', handler)
    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[{
              old: '/:id',
              type: 1,
              val: 'id',
              end: '',
              matcher: /^[a-z]+/,
            }]],
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
  test('match route using URL', (assert) => {
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
})

test.group('Router | lookup', () => {
  test('lookup route using controller.method name', (assert) => {
    const router = new Router(encryption)

    router.resource('photos', 'PhotosController')
    router.commit()

    assert.equal(router.lookup('PhotosController.index')!.pattern, '/photos')
    assert.equal(router.lookup('PhotosController.show')!.pattern, '/photos/:id')
  })

  test('lookup route by alias', (assert) => {
    const router = new Router(encryption)

    router.get('/posts/:id', 'PostController.show').as('showPost')
    router.commit()

    assert.equal(router.lookup('showPost')!.pattern, '/posts/:id')
  })

  test('lookup within a domain', (assert) => {
    const router = new Router(encryption)

    router.get('/posts/:id', 'PostController.show')
    router.get('/posts/:id', 'AdonisController.show').domain('adonisjs.com')
    router.commit()

    const route = router.lookup('/posts/:id', 'adonisjs.com')!
    assert.equal(route.domain, 'adonisjs.com')
    assert.equal(route.pattern, '/posts/:id')
  })

  test('return null when unable to lookup route', (assert) => {
    const router = new Router(encryption)

    const route = router.lookup('/posts')
    assert.isNull(route)
  })
})

test.group('Router | forTesting', () => {
  test('auto commit testing routes to the store', (assert) => {
    const router = new Router(encryption)
    router.forTesting()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        'root': {
          'GET': {
            tokens: [[{
              old: '/_test_0',
              type: 0,
              val: '_test_0',
              end: '',
            }]],
            routes: {
              '/_test_0': {
                pattern: '/_test_0',
                handler: router['testsHandler'],
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

test.group('Brisk route', () => {
  test('define brisk route', (assert) => {
    const router = new Router(encryption)
    async function handler () {}

    router.on('/').setHandler(handler, 'render')
    assert.deepEqual(router.toJSON(), [
      {
        name: undefined,
        pattern: '/',
        handler,
        methods: ['GET'],
        matchers: {},
        meta: {
          namespace: undefined,
        },
        domain: 'root',
        middleware: [],
      },
    ])
  })

  test('define brisk route inside a group', (assert) => {
    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.on('/').setHandler(handler, 'render').as('root')
    }).prefix('api/v1').as('v1')

    assert.deepEqual(router.toJSON(), [
      {
        name: 'v1.root',
        pattern: '/api/v1',
        handler,
        methods: ['GET'],
        matchers: {},
        meta: {
          namespace: undefined,
        },
        domain: 'root',
        middleware: [],
      },
    ])
  })

  test('register brisk route to store', (assert) => {
    const router = new Router(encryption)
    async function handler () {}

    router.group(() => {
      router.on('/').setHandler(handler, 'render').as('root')
    }).prefix('api/v1').as('v1')

    router.commit()

    assert.deepEqual(router['store'].tree, {
      tokens: [[{
        old: 'root',
        type: 0,
        val: 'root',
        end: '',
      }]],
      domains: {
        root: {
          GET: {
            tokens: [[
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
            ]],
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
  test('make url to a given route', (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', async function handler () {})
    router.commit()

    const url = router.makeUrl('/posts/:id', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test('make url to a given route by it\'s name', (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', async function handler () {}).as('showPost')
    router.commit()

    const url = router.makeUrl('showPost', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test('make url to a given route by it\'s controller method', (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.makeUrl('PostsController.index', { id: 1 })!
    assert.equal(url, '/posts/1')
  })

  test('make url to a given route by and append domain to it', (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.index').domain('blog.adonisjs.com')
    router.commit()

    const url = router.makeUrl('PostsController.index', { id: 1 })
    assert.equal(url, '//blog.adonisjs.com/posts/1')
  })
})

test.group('Make signed url', () => {
  test('make signed url to a given route', (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', async function handler () {})
    router.commit()

    const url = router.makeSignedUrl('/posts/:id', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url to a given route by it\'s name', (assert) => {
    const router = new Router(encryption)

    router.get('posts/:id', async function handler () {}).as('showPost')
    router.commit()

    const url = router.makeSignedUrl('showPost', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url to a given route by it\'s controller method', (assert) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index').as('showPost')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', { id: 1 })!
    const qs = parse(url.split('?')[1])
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url to a given route and append domain to it', (assert) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index').domain('blog.adonisjs.com')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', { id: 1 })!
    const qs = parse(url.split('?')[1])

    assert.isTrue(url.startsWith('//blog.adonisjs.com/posts/1?signature='))
    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url with expiry', (assert) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', { id: 1, expiresIn: '1m' })!
    const qs = parse(url.split('?')[1])

    assert.equal(encryption.verifier.unsign(qs.signature as string), '/posts/1')
  })

  test('make signed url with custom query string', (assert) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', {
      id: 1,
      qs: { page: 1 },
    })!
    const qs = parse(url.split('?')[1])

    assert.equal(
      encryption.verifier.unsign(qs.signature as string),
      '/posts/1?page=1',
    )
    assert.equal(Number(qs.page), 1)
  })

  test('make signed url with domain with query string', (assert) => {
    const router = new Router(encryption)

    router.get('posts/:id', 'PostsController.index').domain('blog.adonisjs.com')
    router.commit()

    const url = router.makeSignedUrl('PostsController.index', {
      id: 1,
      qs: { page: 1 },
    })!
    const qs = parse(url.split('?')[1])

    assert.equal(
      encryption.verifier.unsign(qs.signature as string),
      '/posts/1?page=1',
    )
    assert.equal(Number(qs.page), 1)
  })
})
