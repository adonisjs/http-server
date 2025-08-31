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

import debug from '../../debug.ts'
import { httpMiddleware } from '../../tracing_channels.ts'
import type { HttpContext } from '../../http_context/main.ts'
import { type ParsedGlobalMiddleware } from '../../types/middleware.ts'

/**
 * Creates a middleware execution handler that invokes middleware functions with tracing support
 *
 * This factory function returns a middleware execution handler that:
 * - Executes middleware with debug logging
 * - Provides distributed tracing through tracing channels
 * - Passes the container resolver, HTTP context, and next function to middleware
 *
 * @param resolver - Container resolver for dependency injection
 * @param ctx - HTTP context containing request/response data
 * @returns Middleware execution function
 */
export function middlewareHandler(resolver: ContainerResolver<any>, ctx: HttpContext) {
  /**
   * Executes a single middleware function with tracing and debug logging
   *
   * @param fn - Parsed middleware configuration with handle method
   * @param next - Next function to call the next middleware in the stack
   * @returns Promise that resolves when middleware execution completes
   */
  return function (fn: ParsedGlobalMiddleware, next: NextFn) {
    debug('executing middleware %s', fn.name)
    return httpMiddleware.tracePromise(
      fn.handle,
      httpMiddleware.hasSubscribers ? { middleware: fn } : undefined,
      undefined,
      resolver,
      ctx,
      next
    ) as unknown as Promise<any>
  }
}
