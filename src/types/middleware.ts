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

import type { Constructor } from './base.js'
import type { HttpContext } from '../http_context/main.js'

/**
 * Middleware represented as a class
 */
export type MiddlewareAsClass = Constructor<{
  handle: (ctx: HttpContext, next: NextFn, args?: any) => any
}>

/**
 * Check if a union has undefined or null
 */
type HasUndefined<T> = T extends NonNullable<T> ? true : false

/**
 * Returns the arguments accepted by the middleware's handle method
 */
export type GetMiddlewareArgs<Middleware extends MiddlewareAsClass> = HasUndefined<
  Parameters<InstanceType<Middleware>['handle']>[2]
> extends true
  ? [Parameters<InstanceType<Middleware>['handle']>[2]]
  : [Parameters<InstanceType<Middleware>['handle']>[2]?]

/**
 * The middleware defined as a function on the router or the server
 */
export type MiddlewareFn = (ctx: HttpContext, next: NextFn) => any

/**
 * Parsed global middleware
 */
export type ParsedGlobalMiddleware = {
  handle: (
    resolver: ContainerResolver<any>,
    ...args: [ctx: HttpContext, next: NextFn, params?: any]
  ) => any
}
