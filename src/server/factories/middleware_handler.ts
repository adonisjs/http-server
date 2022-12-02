/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { NextFn } from '@poppinss/middleware/types'
import type { ContainerResolver } from '@adonisjs/fold'

import type { HttpContext } from '../../http_context/main.js'
import { ParsedGlobalMiddleware } from '../../types/middleware.js'

/**
 * The middleware handler invokes the middleware functions.
 */
export function middlewareHandler(resolver: ContainerResolver, ctx: HttpContext) {
  return function (fn: ParsedGlobalMiddleware, next: NextFn) {
    return fn.handle(resolver, ctx, next)
  }
}
