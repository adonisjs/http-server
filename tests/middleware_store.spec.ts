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
import { HttpContextFactory } from '../test_factories/http_context.js'

test.group('Middleware store', () => {
  test('get handle method object for a named middleware', async ({ assert, expectTypeOf }) => {
    const ctx = new HttpContextFactory().create()
    const nextFn = () => {}

    class AuthMiddleware {
      handle() {
        return this
      }
    }

    const middlewareStore = new MiddlewareStore([], {
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    const authMiddleware = middlewareStore.get('auth')

    expectTypeOf(middlewareStore.get).parameters.toEqualTypeOf<['auth', undefined?]>()
    assert.isFunction(authMiddleware.handle)

    assert.instanceOf(
      await authMiddleware.handle(new Container().createResolver(), [
        ctx,
        nextFn,
        authMiddleware.args,
      ]),
      AuthMiddleware
    )
  })

  test('infer handle method arguments', async ({ assert, expectTypeOf }) => {
    const ctx = new HttpContextFactory().create()
    const nextFn = () => {}

    class AuthMiddleware {
      handle(_: any, __: any, options: { guard: 'web' | 'api' }) {
        return options
      }
    }

    const middlewareStore = new MiddlewareStore([], {
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    const authMiddleware = middlewareStore.get('auth', { guard: 'web' })
    expectTypeOf(middlewareStore.get).parameters.toEqualTypeOf<['auth', { guard: 'web' | 'api' }]>()

    assert.isFunction(authMiddleware.handle)
    assert.deepEqual(
      await authMiddleware.handle(new Container().createResolver(), [
        ctx,
        nextFn,
        authMiddleware.args,
      ]),
      {
        guard: 'web',
      }
    )
  })

  test('infer optional handle method arguments', async ({ assert, expectTypeOf }) => {
    const ctx = new HttpContextFactory().create()
    const nextFn = () => {}

    class AuthMiddleware {
      handle(_: any, __: any, options?: { guard: 'web' | 'api' }) {
        return options
      }
    }

    const middlewareStore = new MiddlewareStore([], {
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    const authMiddleware = middlewareStore.get('auth')
    expectTypeOf(middlewareStore.get).parameters.toEqualTypeOf<
      ['auth', { guard: 'web' | 'api' }?]
    >()

    assert.isFunction(authMiddleware.handle)
    assert.isUndefined(
      await authMiddleware.handle(new Container().createResolver(), [
        ctx,
        nextFn,
        authMiddleware.args,
      ])
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

  test('get handle method object for global middleware', async ({ assert }) => {
    const ctx = new HttpContextFactory().create()
    const nextFn = () => {}

    class BodyParserMiddleware {
      handle() {
        return this
      }
    }

    class SilentAuthMiddleware {
      handle() {
        return this
      }
    }

    const middlewareStore = new MiddlewareStore(
      [
        async () => {
          return { default: BodyParserMiddleware }
        },
        async () => {
          return { default: SilentAuthMiddleware }
        },
      ],
      {}
    )

    const middleware = middlewareStore.list()
    assert.isArray(middleware)
    assert.lengthOf(middleware, 2)
    assert.isFunction(middleware[0].handle)
    assert.isFunction(middleware[1].handle)

    assert.instanceOf(
      await middleware[0].handle(new Container().createResolver(), [ctx, nextFn]),
      BodyParserMiddleware
    )
    assert.instanceOf(
      await middleware[1].handle(new Container().createResolver(), [ctx, nextFn]),
      SilentAuthMiddleware
    )
  })
})
