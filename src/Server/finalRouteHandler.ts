/*
 * @adonisjs/server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../contracts.ts" />

import { Exception } from '@poppinss/utils'
import { ResolvedControllerNode, HttpContextContract } from '@poppinss/http-server/contracts'
import { useReturnValue } from './useReturnValue'
import { exceptionCodes } from '../helpers'

/**
 * Final handler executes the route handler based on it's resolved
 * type and the response body on various conditions (check method body)
 * for same.
 */
export async function finalRouteHandler<Context extends HttpContextContract> (ctx: Context) {
  const handler = ctx.route!.meta.resolvedHandler as ResolvedControllerNode<Context>

  /**
   * When route handler is a plain function, then execute it
   * as it is.
   */
  if (handler.type === 'function') {
    const returnValue = await handler.handler(ctx)
    if (useReturnValue(returnValue, ctx)) {
      ctx.response.send(returnValue)
    }
    return
  }

  /**
   * Otherwise lookup the controller inside the IoC container
   * and make the response
   */
  const controllerInstance = global['make'](handler.namespace)

  /* istanbul ignore-else */
  if (!controllerInstance[handler.method]) {
    throw new Exception(
      `Cannot find ${handler.namespace}.${handler.method} method`,
      500,
      exceptionCodes.E_MISSING_CONTROLLER_METHOD,
    )
  }

  const returnValue = await controllerInstance[handler.method](ctx)
  if (useReturnValue(returnValue, ctx)) {
    ctx.response.send(returnValue)
  }
}
