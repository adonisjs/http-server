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

import type { HttpContext } from '../http_context/main.ts'

/**
 * Middleware represented as a class constructor that implements a handle method
 */
export type MiddlewareAsClass = Constructor<{
  handle: (ctx: HttpContext, next: NextFn, args?: any) => any
}>

/**
 * Utility type to check if a union type includes undefined or null values
 */
type HasUndefined<T> = T extends NonNullable<T> ? true : false

/**
 * Extracts and returns the argument types accepted by a middleware's handle method
 * Returns an empty array if no args, otherwise returns the args type as a tuple
 */
export type GetMiddlewareArgs<Middleware extends MiddlewareAsClass> = Parameters<
  InstanceType<Middleware>['handle']
>[2] extends undefined
  ? []
  : HasUndefined<Parameters<InstanceType<Middleware>['handle']>[2]> extends true
    ? [Parameters<InstanceType<Middleware>['handle']>[2]]
    : [Parameters<InstanceType<Middleware>['handle']>[2]?]

/**
 * Middleware defined as a function that accepts HTTP context and next function
 */
export type MiddlewareFn = (ctx: HttpContext, next: NextFn) => any

/**
 * Representation of a parsed global middleware with its metadata and execution handler
 */
export type ParsedGlobalMiddleware = {
  /** Optional name for the middleware */
  name?: string
  /** Reference to the middleware class or lazy import */
  reference: LazyImport<MiddlewareAsClass> | MiddlewareAsClass
  /** Handler function that executes the middleware */
  handle: (
    resolver: ContainerResolver<any>,
    ...args: [ctx: HttpContext, next: NextFn, params?: any]
  ) => any
}

/**
 * Representation of a parsed named middleware with its metadata, arguments and execution handler
 */
export type ParsedNamedMiddleware = {
  /** Name identifier for the middleware */
  name: string
  /** Reference to the middleware class or lazy import */
  reference: LazyImport<MiddlewareAsClass> | MiddlewareAsClass
  /** Handler function that executes the middleware */
  handle: ParsedGlobalMiddleware['handle']
  /** Arguments to pass to the middleware */
  args: any
}

/**
 * Information node describing different types of middleware handlers and their metadata
 */
export type MiddlewareHandlerInfo =
  | {
      /** Type identifier for closure middleware */
      type: 'closure'
      /** Name of the closure middleware */
      name: string
    }
  | {
      /** Type identifier for named middleware */
      type: 'named'
      /** Name of the named middleware */
      name: string
      /** Arguments to pass to the middleware */
      args: any | undefined
      /** Method name on the middleware class */
      method: string
      /** Module name or file path for the middleware */
      moduleNameOrPath: string
    }
  | {
      /** Type identifier for global middleware */
      type: 'global'
      /** Optional name for the global middleware */
      name?: string | undefined
      /** Method name on the middleware class */
      method: string
      /** Module name or file path for the middleware */
      moduleNameOrPath: string
    }

/**
 * Information node describing different types of route handlers and their metadata
 */
export type RouteHandlerInfo =
  | {
      /** Type identifier for closure route handler */
      type: 'closure'
      /** Name of the closure handler */
      name: string
      /** Optional arguments for the closure */
      args?: string
    }
  | {
      /** Type identifier for controller route handler */
      type: 'controller'
      /** Method name on the controller class */
      method: string
      /** Module name or file path for the controller */
      moduleNameOrPath: string
    }
