/*
 * @adonisjs/server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Router } from '../src/Router'
import { Ioc } from '@adonisjs/fold'

import { MiddlewareStore } from '../src/Server/MiddlewareStore'
import { routePreProcessor } from '../src/Server/routePreProcessor'

test.group('Route pre processor', (group) => {
  group.afterEach(() => {
    delete global[Symbol.for('ioc.use')]
    delete global[Symbol.for('ioc.make')]
  })

  test('process route by resolving function based middleware', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    async function middlewareFn () {}

    const route = router.get('/', async function handler () {}).middleware([middlewareFn]).toJSON()
    routePreProcessor(route, middlewareStore)

    assert.deepEqual(route.meta.resolvedMiddleware, [{
      type: 'function',
      value: middlewareFn,
      args: [],
    }])
  })

  test('process route by resolving named middleware', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    async function middlewareFn () {}
    middlewareStore.registerNamed({ auth: middlewareFn })

    const route = router.get('/', async function handler () {}).middleware(['auth:jwt']).toJSON()
    routePreProcessor(route, middlewareStore)

    assert.deepEqual(route.meta.resolvedMiddleware, [{
      type: 'function',
      value: middlewareFn,
      args: ['jwt'],
    }])
  })

  test('process route by resolving IoC bindings', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    class Auth {
      public async handle () {}
    }

    const ioc = new Ioc()
    ioc.bind('App/Middleware/Auth', () => Auth)
    global[Symbol.for('ioc.use')] = ioc.use.bind(ioc)

    middlewareStore.registerNamed({ auth: 'App/Middleware/Auth' })

    const route = router.get('/', async function handler () {}).middleware(['auth:jwt']).toJSON()
    routePreProcessor(route, middlewareStore)

    assert.deepEqual(route.meta.resolvedMiddleware, [{
      type: 'iocObject',
      value: Auth,
      method: 'handle',
      args: ['jwt'],
    }])
  })

  test('resolve function based route handler', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    async function handler () {}

    const route = router.get('/', handler).toJSON()
    routePreProcessor(route, middlewareStore)

    assert.deepEqual(route.meta.resolvedHandler, {
      type: 'function',
      handler: handler,
    })
  })

  test('resolve ioc container binding for route handler', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    class UserController {
      public async store () {}
    }

    const ioc = new Ioc()
    ioc.bind('App/Controllers/Http/UserController', () => UserController)
    global[Symbol.for('ioc.use')] = ioc.use.bind(ioc)

    const route = router.get('/', 'UserController.store').toJSON()
    routePreProcessor(route, middlewareStore)

    assert.deepEqual(route.meta.resolvedHandler, {
      type: 'iocReference',
      namespace: 'App/Controllers/Http/UserController',
      method: 'store',
    })
  })

  test('do not prepend namespace when is absolute namespace', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    class UserController {
      public async store () {}
    }

    const ioc = new Ioc()
    ioc.bind('UserController', () => UserController)
    global[Symbol.for('ioc.use')] = ioc.use.bind(ioc)

    const route = router.get('/', '/UserController.store').toJSON()
    routePreProcessor(route, middlewareStore)

    assert.deepEqual(route.meta.resolvedHandler, {
      type: 'iocReference',
      namespace: 'UserController',
      method: 'store',
    })
  })

  test('raise error when method is missing in controller binding', (assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    class UserController {
      public async store () {}
    }

    const ioc = new Ioc()
    ioc.bind('UserController', () => UserController)
    global[Symbol.for('ioc.use')] = ioc.use.bind(ioc)

    const route = router.get('/', '/UserController').toJSON()
    const fn = () => routePreProcessor(route, middlewareStore)

    assert.throw(fn, 'E_INVALID_IOC_NAMESPACE: Missing method reference on {/UserController} namespace')
  })

  test('raise error when controller method is missing', (_assert) => {
    const middlewareStore = new MiddlewareStore()
    const router = new Router()

    class UserController {
    }

    const ioc = new Ioc()
    ioc.bind('App/Controllers/Http/UserController', () => UserController)
    global[Symbol.for('ioc.use')] = ioc.use.bind(ioc)

    const route = router.get('/', '/UserController.store').toJSON()
    routePreProcessor(route, middlewareStore)
  })
})
