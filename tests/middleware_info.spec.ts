/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { middlewareInfo } from '../src/helpers.ts'
import { RouterFactory } from '../factories/router.ts'

test.group('Middleware info', () => {
  test('get middleware info using closures', async ({ assert }) => {
    const router = new RouterFactory().create()

    const UsersController = () => import('#controllers/users_controller' as any)
    const route = router
      .get('/users', [UsersController, 'index'])
      .use(function authenticate() {})
      .use(function rateLimit() {})

    const middlewareList = await Promise.all(
      Array.from(route.toJSON().middleware.all()).map((middleware) => middlewareInfo(middleware))
    )

    assert.deepEqual(middlewareList, [
      {
        name: 'authenticate',
        type: 'closure',
      },
      {
        name: 'rateLimit',
        type: 'closure',
      },
    ])
  })

  test('get named middleware info', async ({ assert }) => {
    const router = new RouterFactory().create()
    const middleware = router.named({
      auth: () => import('#middleware/auth_middleware' as any),
      rateLimit: () => import('#middleware/rate_limit' as any),
    })

    const UsersController = () => import('#controllers/users_controller' as any)
    const route = router
      .get('/users', [UsersController, 'index'])
      .use(middleware.auth())
      .use(middleware.rateLimit())

    const middlewareList = await Promise.all(
      Array.from(route.toJSON().middleware.all()).map((one) => middlewareInfo(one))
    )

    assert.deepEqual(middlewareList, [
      {
        args: undefined,
        method: 'handle',
        moduleNameOrPath: '#middleware/auth_middleware',
        name: 'auth',
        type: 'named',
      },
      {
        args: undefined,
        method: 'handle',
        moduleNameOrPath: '#middleware/rate_limit',
        name: 'rateLimit',
        type: 'named',
      },
    ])
  })

  test('get global middleware info', async ({ assert }) => {
    const router = new RouterFactory().create()

    router.use([
      () => import('#middleware/auth_middleware' as any),
      () => import('#middleware/rate_limit' as any),
    ])

    const UsersController = () => import('#controllers/users_controller' as any)
    const route = router.get('/users', [UsersController, 'index'])

    const middlewareList = await Promise.all(
      Array.from(route.toJSON().middleware.all()).map((middleware) => middlewareInfo(middleware))
    )

    assert.deepEqual(middlewareList, [
      {
        method: 'handle',
        name: '',
        moduleNameOrPath: '#middleware/auth_middleware',
        type: 'global',
      },
      {
        method: 'handle',
        name: '',
        moduleNameOrPath: '#middleware/rate_limit',
        type: 'global',
      },
    ])
  })
})
