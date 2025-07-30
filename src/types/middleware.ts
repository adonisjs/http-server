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
import type { Constructor, LazyImport } from '@poppinss/utils/types'

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
export type GetMiddlewareArgs<Middleware extends MiddlewareAsClass> = Parameters<
  InstanceType<Middleware>['handle']
>[2] extends undefined
  ? []
  : HasUndefined<Parameters<InstanceType<Middleware>['handle']>[2]> extends true
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
  name?: string
  reference: LazyImport<MiddlewareAsClass> | MiddlewareAsClass
  handle: (
    resolver: ContainerResolver<any>,
    ...args: [ctx: HttpContext, next: NextFn, params?: any]
  ) => any
}

/**
 * Parsed named middleware
 */
export type ParsedNamedMiddleware = {
  name: string
  reference: LazyImport<MiddlewareAsClass> | MiddlewareAsClass
  handle: ParsedGlobalMiddleware['handle']
  args: any
}

/**
 * Info node representing a middleware handler
 */
export type MiddlewareHandlerInfo =
  | {
      type: 'closure'
      name: string
    }
  | {
      type: 'named'
      name: string
      args: any | undefined
      method: string
      moduleNameOrPath: string
    }
  | {
      type: 'global'
      name?: string | undefined
      method: string
      moduleNameOrPath: string
    }

/**
 * Info node representing route handler
 */
export type RouteHandlerInfo =
  | {
      type: 'closure'
      name: string
      args?: string
    }
  | {
      type: 'controller'
      method: string
      moduleNameOrPath: string
    }
