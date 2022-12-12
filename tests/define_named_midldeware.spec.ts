/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { defineNamedMiddleware } from '../src/define_middleware.js'

test.group('Define named middleware', () => {
  test('define a collection of named middleware', ({ assert, expectTypeOf }) => {
    class AuthMiddleware {
      handle() {}
    }

    const namedMiddleware = defineNamedMiddleware({
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    expectTypeOf(namedMiddleware).toHaveProperty('auth')
    expectTypeOf(namedMiddleware.auth).parameters.toEqualTypeOf<[]>()
    expectTypeOf(namedMiddleware.auth()).toMatchTypeOf<{ name: 'auth'; args: undefined }>()

    assert.isObject(namedMiddleware)
    assert.property(namedMiddleware, 'auth')
    assert.containsSubset(namedMiddleware.auth(), { name: 'auth', args: undefined })
  })

  test('infer types for middleware options', ({ assert, expectTypeOf }) => {
    class AuthMiddleware {
      handle(_: any, __: any, _options: { guard: 'web' | 'api' }) {}
    }

    const namedMiddleware = defineNamedMiddleware({
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    expectTypeOf(namedMiddleware).toHaveProperty('auth')
    expectTypeOf(namedMiddleware.auth).parameters.toEqualTypeOf<[{ guard: 'web' | 'api' }]>()
    expectTypeOf(namedMiddleware.auth({ guard: 'web' })).toMatchTypeOf<{
      name: 'auth'
      args: { guard: 'web' }
    }>()

    assert.isObject(namedMiddleware)
    assert.property(namedMiddleware, 'auth')
    assert.containsSubset(namedMiddleware.auth({ guard: 'web' }), {
      name: 'auth',
      args: { guard: 'web' },
    })
  })

  test('infer types for middleware optional options', ({ assert, expectTypeOf }) => {
    class AuthMiddleware {
      handle(_: any, __: any, _options?: { guard: 'web' | 'api' }) {}
    }

    const namedMiddleware = defineNamedMiddleware({
      auth: async () => {
        return {
          default: AuthMiddleware,
        }
      },
    })

    expectTypeOf(namedMiddleware).toHaveProperty('auth')
    expectTypeOf(namedMiddleware.auth).parameters.toEqualTypeOf<[{ guard: 'web' | 'api' }?]>()
    assert.containsSubset(namedMiddleware.auth(), { name: 'auth', args: undefined })

    assert.isObject(namedMiddleware)
    assert.property(namedMiddleware, 'auth')
    assert.containsSubset(namedMiddleware.auth({ guard: 'web' }), {
      name: 'auth',
      args: { guard: 'web' },
    })
    assert.containsSubset(namedMiddleware.auth(), {
      name: 'auth',
      args: undefined,
    })
  })
})
