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

export type HTTPRequestTracingData = { ctx: HttpContext }
export type MiddlewareTracingData = {
  middleware: ParsedGlobalMiddleware | ParsedNamedMiddleware | MiddlewareFn
}
export type RouteHandlerTracingData = {
  route: RouteJSON
}
