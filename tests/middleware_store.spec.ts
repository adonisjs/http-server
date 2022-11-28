/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { Container } from '@adonisjs/fold'
import { MiddlewareStore } from '../src/middleware/store.js'

test.group('Middleware store', () => {
  test('get handle method object for a named middleware', async ({ assert }) => {
    const middlewareStore = new MiddlewareStore([], {
      // @ts-expect-error (import does not exists)
      auth: () => import('#middleware/auth'),
    })

    const authMiddleware = middlewareStore.get('auth', [])
    assert.isFunction(authMiddleware.handle)

    await assert.rejects(
      () => authMiddleware.handle(new Container()),
      /ERR_PACKAGE_IMPORT_NOT_DEFINED #middleware\/auth/
    )
  })

  test('cache handle methods by middleware name', async ({ assert }) => {
    const middlewareStore = new MiddlewareStore([], {
      // @ts-expect-error (import does not exists)
      auth: () => import('#middleware/auth'),
    })

    const authMiddleware = middlewareStore.get('auth', [])
    const authMiddleware1 = middlewareStore.get('auth', [])

    assert.deepEqual(authMiddleware, authMiddleware1)

    /**
     * Top level objects are different
     */
    assert.notStrictEqual(authMiddleware, authMiddleware1)

    /**
     * Handle methods are shared
     */
    assert.strictEqual(authMiddleware.handle, authMiddleware1.handle)
  })

  test('resolve global middleware to handle method objects', async ({ assert }) => {
    const middlewareStore = new MiddlewareStore(
      // @ts-expect-error (imports does not exists)
      [() => import('#middleware/bodyparser'), () => import('#middleware/silent_auth')],
      {}
    )

    const middleware = middlewareStore.list()
    assert.isArray(middleware)
    assert.lengthOf(middleware, 2)
    assert.isFunction(middleware[0].handle)
    assert.isFunction(middleware[1].handle)

    await assert.rejects(
      () => middleware[0].handle(new Container()),
      /ERR_PACKAGE_IMPORT_NOT_DEFINED #middleware\/bodyparser/
    )

    await assert.rejects(
      () => middleware[1].handle(new Container()),
      /ERR_PACKAGE_IMPORT_NOT_DEFINED #middleware\/silent_auth/
    )
  })
})
