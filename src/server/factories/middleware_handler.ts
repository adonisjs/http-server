/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ContainerResolver } from '@adonisjs/fold'
import type { NextFn } from '@poppinss/middleware/types'

import debug from '../../debug.js'
import { httpMiddleware } from '../../tracing_channels.js'
import type { HttpContext } from '../../http_context/main.js'
import { type ParsedGlobalMiddleware } from '../../types/middleware.js'

/**
 * The middleware handler invokes the middleware functions.
 */
export function middlewareHandler(resolver: ContainerResolver<any>, ctx: HttpContext) {
  return function (fn: ParsedGlobalMiddleware, next: NextFn) {
    debug('executing middleware %s', fn.name)
    return httpMiddleware.tracePromise(
      fn.handle,
      fn,
      undefined,
      resolver,
      ctx,
      next
    ) as unknown as Promise<any>
  }
}
