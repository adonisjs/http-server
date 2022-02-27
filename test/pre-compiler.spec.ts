/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Router } from '../src/Router'
import { Ioc } from '@adonisjs/fold'

import { MiddlewareStore } from '../src/MiddlewareStore'
import { PreCompiler } from '../src/Server/PreCompiler'

import { encryption } from '../test-helpers'

test.group('Route precompiler', () => {
  test('process route by resolving function based middleware', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    async function middlewareFn() {}

    const route = router
      .get('/', async function handler() {})
      .middleware([middlewareFn])
      .toJSON()
    preCompiler.compileRoute(route)

    assert.deepEqual(route.meta.resolvedMiddleware, [
      {
        type: 'function',
        value: middlewareFn,
        args: [],
      },
    ])
  })

  test('process route by resolving named middleware', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    async function middlewareFn() {
      return {
        default: class Middleware {
          public async handle() {}
        },
      }
    }
    middlewareStore.registerNamed({ auth: middlewareFn })

    const route = router
      .get('/', async function handler() {})
      .middleware(['auth:jwt'])
      .toJSON()

    preCompiler.compileRoute(route)
    assert.deepEqual(route.meta.resolvedMiddleware, [
      {
        type: 'lazy-import',
        value: middlewareFn,
        args: ['jwt'],
      },
    ])
  })

  test('process route by resolving middleware from container', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    class Auth {
      public async handle() {}
    }

    ioc.bind('App/Middleware/Auth', () => Auth)
    middlewareStore.registerNamed({ auth: 'App/Middleware/Auth' })

    const route = router
      .get('/', async function handler() {})
      .middleware(['auth:jwt'])
      .toJSON()
    preCompiler.compileRoute(route)

    assert.deepEqual(route.meta.resolvedMiddleware, [
      {
        type: 'binding',
        namespace: 'App/Middleware/Auth',
        method: 'handle',
        args: ['jwt'],
      },
    ])
  })

  test('resolve function based route handler', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    async function handler() {}

    const route = router.get('/', handler).toJSON()
    preCompiler.compileRoute(route)

    assert.deepEqual(route.meta.resolvedHandler, {
      type: 'function',
      handler: handler,
    })
  })

  test('resolve route handler from the container', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    class UserController {
      public async store() {}
    }

    ioc.bind('App/Controllers/Http/UserController', () => UserController)

    const route = router.get('/', 'UserController.store').toJSON()
    preCompiler.compileRoute(route)

    assert.deepEqual(route.meta.resolvedHandler, {
      type: 'binding',
      namespace: 'App/Controllers/Http/UserController',
      method: 'store',
    })
  })

  test('do not prepend namespace when absolute namespace is passed', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    class UserController {
      public async store() {}
    }

    ioc.bind('UserController', () => UserController)

    const route = router.get('/', '/UserController.store').toJSON()
    preCompiler.compileRoute(route)

    assert.deepEqual(route.meta.resolvedHandler, {
      type: 'binding',
      namespace: 'UserController',
      method: 'store',
    })
  })

  test('raise exception when binding is missing', ({ assert }) => {
    const ioc = new Ioc()

    const middlewareStore = new MiddlewareStore(ioc)
    const router = new Router(encryption)
    const preCompiler = new PreCompiler(ioc, middlewareStore)

    const route = router.get('/', '/UserController.store').toJSON()
    const fn = () => preCompiler.compileRoute(route)

    assert.throws(
      fn,
      'E_IOC_LOOKUP_FAILED: Cannot resolve "/UserController" namespace from the IoC Container'
    )
  })
})
