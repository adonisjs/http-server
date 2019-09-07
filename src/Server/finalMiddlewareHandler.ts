/**
 * @module @poppinss/http-server
 */

/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import { callIocReference } from '@poppinss/utils'
import { ResolvedMiddlewareNode } from '@ioc:Adonis/Core/Middleware'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Final middleware handler executes a middleware
 */
export function finalMiddlewareHandler (
  middleware: ResolvedMiddlewareNode,
  params: [HttpContextContract, () => Promise<void>],
): Promise<void> {
  /**
   * Call function right away
   */
  if (middleware.type === 'function') {
    return middleware.value(params[0], params[1], middleware.args)
  }

  const args = ([params[0], params[1]] as any).concat([middleware.args])
  return callIocReference(middleware, args)
}
