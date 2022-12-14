/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import type { HttpContext } from '../../src/http_context/main.js'
import { GetControllerHandlers } from '../../src/types/route.js'

test.group('Router types', () => {
  test('infer route handlers from controller constructor', ({ expectTypeOf }) => {
    class HomeControllerClass {
      async index() {}
      async store({}: HttpContext) {}
      async show({}: HttpContext, _user: any) {}
      async internalHelper(_ctx: any) {}
      async internalHelper2(_arg: { id: number }) {}
    }

    expectTypeOf<GetControllerHandlers<typeof HomeControllerClass>>().toEqualTypeOf<
      'index' | 'store' | 'show' | 'internalHelper'
    >()
  })
})
