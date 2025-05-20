/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { StoreRouteNode } from './route.js'
import type { HttpContext } from '../http_context/main.js'
import type { MiddlewareFn, ParsedGlobalMiddleware, ParsedNamedMiddleware } from './middleware.js'

export type HTTPRequestTracingData = HttpContext
export type MiddlewareTracingData = ParsedGlobalMiddleware | ParsedNamedMiddleware | MiddlewareFn
export type RouteHandlerTracingData = StoreRouteNode
