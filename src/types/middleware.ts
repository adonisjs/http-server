/**
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor } from './base.js'
import type { HttpContext } from '../http_context/main.js'

/**
 * Middleware represented as a class
 */
export type MiddlewareAsClass = Constructor<{
  handle: (ctx: HttpContext, next: Promise<any>, args?: any) => any
}>

/**
 * Returns the arguments accepted by the middleware's handle method
 */
export type GetMiddlewareArgs<Middleware extends MiddlewareAsClass> = Parameters<
  InstanceType<Middleware>['handle']
>[2]

/**
 * The middleware defined as a function on the router or the server
 */
export type MiddlewareFn = (ctx: HttpContext, next: Promise<any>) => any
