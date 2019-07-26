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

import { callIocReference } from '@poppinss/utils'
import { ResolvedMiddlewareNode } from '../contracts'

/**
 * Final middleware handler executes a middleware
 */
export function finalMiddlewareHandler<Context> (
  middleware: ResolvedMiddlewareNode<Context>,
  params: [Context, () => Promise<void>],
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
