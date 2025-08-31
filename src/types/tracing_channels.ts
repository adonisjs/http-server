/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { RouteJSON } from './route.ts'
import type { HttpContext } from '../http_context/main.ts'
import type { MiddlewareFn, ParsedGlobalMiddleware, ParsedNamedMiddleware } from './middleware.ts'

/**
 * Tracing data structure for HTTP request events
 */
export type HTTPRequestTracingData = {
  /** HTTP context for the traced request */
  ctx: HttpContext
}
/**
 * Tracing data structure for middleware execution events
 */
export type MiddlewareTracingData = {
  /** The middleware being traced */
  middleware: ParsedGlobalMiddleware | ParsedNamedMiddleware | MiddlewareFn
}
/**
 * Tracing data structure for route handler execution events
 */
export type RouteHandlerTracingData = {
  /** The route being traced */
  route: RouteJSON
}
