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

import { ProfilerActionContract } from '@poppinss/profiler/build/src/Contracts'
import { callIocReference } from '@poppinss/utils'
import { useReturnValue } from './useReturnValue'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ResolvedControllerNode } from '@ioc:Adonis/Core/Server'

/**
 * Final handler executes the route handler based on it's resolved
 * type and the response body on various conditions (check method body)
 * for same.
 */
export async function finalRouteHandler (ctx: HttpContextContract) {
  const handler = ctx.route!.meta.resolvedHandler as ResolvedControllerNode
  let profilerAction: ProfilerActionContract

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
    profilerAction!.end()
    throw error
  }
}
