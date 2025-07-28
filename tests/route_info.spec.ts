/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { routeInfo } from '../src/helpers.ts'
import { RouterFactory } from '../factories/router.ts'

test.group('Route handler info', () => {
  test('get route handler info using closure', async ({ assert }) => {
    const router = new RouterFactory().create()

    async function handler() {}
    const route = router.get('/', handler)

    assert.deepEqual(await routeInfo(route.toJSON()), {
      args: undefined,
      name: 'handler',
      type: 'closure',
    })
  })

  test('get route controller info using dynamic import reference', async ({ assert }) => {
    const router = new RouterFactory().create()

    const UsersController = () => import('#controllers/users_controller' as any)
    const route = router.get('/users', [UsersController])

    assert.deepEqual(await routeInfo(route.toJSON()), {
      method: 'handle',
      moduleNameOrPath: '#controllers/users_controller',
      type: 'controller',
    })
  })

  test('get route controller info using dynamic import reference from a collection', async ({
    assert,
  }) => {
    const router = new RouterFactory().create()

    const controllers = {
      Users: () => import('#controllers/users_controller' as any),
    }
    const route = router.get('/users', [controllers.Users])

    assert.deepEqual(await routeInfo(route.toJSON()), {
      method: 'handle',
      moduleNameOrPath: '#controllers/users_controller',
      type: 'controller',
    })
  })

  test('get route controller info using direct reference', async ({ assert }) => {
    const router = new RouterFactory().create()

    class UsersController {
      index() {}
    }
    const route = router.get('/users', [UsersController, 'index'])

    assert.deepEqual(await routeInfo(route.toJSON()), {
      method: 'index',
      moduleNameOrPath: 'UsersController',
      type: 'controller',
    })
  })
})
