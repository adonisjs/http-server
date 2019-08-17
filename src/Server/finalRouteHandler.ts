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
import { useReturnValue } from './useReturnValue'
import { ResolvedControllerNode, HttpContextContract } from '../contracts'

/**
 * Final handler executes the route handler based on it's resolved
 * type and the response body on various conditions (check method body)
 * for same.
 */
export async function finalRouteHandler<Context extends HttpContextContract> (ctx: Context) {
  const handler = ctx.route!.meta.resolvedHandler as ResolvedControllerNode<Context>
  let profilerAction

  try {
    /**
     * When route handler is a plain function, then execute it
     * as it is.
     */
    if (handler.type === 'function') {
      profilerAction = ctx.profiler.profile('http:route:closure')

      const returnValue = await handler.handler(ctx)
      if (useReturnValue(returnValue, ctx)) {
        ctx.response.send(returnValue)
      }

      profilerAction.end()
      return
    }

    /**
     * Otherwise lookup the controller inside the IoC container
     * and make the response
     */
    profilerAction = ctx.profiler.profile('http:route:controller')

    const returnValue = await callIocReference(handler, [ctx])
    if (useReturnValue(returnValue, ctx)) {
      ctx.response.send(returnValue)
    }

    profilerAction.end()
  } catch (error) {
    profilerAction.end()
    throw error
  }
}
