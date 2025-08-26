/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Middleware from '@poppinss/middleware'
import type { ContainerResolver } from '@adonisjs/fold'
import type { Constructor, LazyImport } from '@poppinss/utils/types'

import type { ServerErrorHandler } from './server.ts'
import type { HttpContext } from '../http_context/main.ts'
import type { MiddlewareFn, ParsedGlobalMiddleware } from './middleware.ts'

/**
 * Shape of a route param matcher
 */
export type RouteMatcher = {
  match?: RegExp
  cast?: (value: string) => any
}

/**
 * Route token stored by matchit library
 */
export type MatchItRouteToken = RouteMatcher & {
  old: string
  type: 0 | 1 | 2 | 3
  val: string
  end: string
}

/**
 * Returns a union of methods from a controller that accepts
 * the context as the first argument.
 */
export type GetControllerHandlers<Controller extends Constructor<any>> = {
  [K in keyof InstanceType<Controller>]: InstanceType<Controller>[K] extends (
    ctx: HttpContext,
    ...args: any[]
  ) => any
    ? K
    : never
}[keyof InstanceType<Controller>]

/**
 * Route handler defined as a function
 */
export type RouteFn = (ctx: HttpContext) => any

/**
 * Route handler persisted with the route store
 */
export type StoreRouteHandler =
  | RouteFn
  | {
      name?: string
      method: string
      importExpression: string | null
      reference: string | [LazyImport<Constructor<any>> | Constructor<any>, any?]
      handle: (
        resolver: ContainerResolver<any>,
        ...args: [ctx: HttpContext, ...injections: any[]]
      ) => any
    }

/**
 * The middleware persisted with the route store
 */
export type StoreRouteMiddleware =
  | MiddlewareFn
  | ({ name?: string; args?: any[] } & ParsedGlobalMiddleware)

/**
 * An object of routes for a given HTTP method
 */
export type StoreMethodNode = {
  tokens: MatchItRouteToken[][]
  routeKeys: {
    [pattern: string]: string
  }
  routes: {
    [pattern: string]: RouteJSON
  }
}

/**
 * Each domain node container an object of methods. Each method
 * object has nested routes.
 */
export type StoreDomainNode = {
  [method: string]: StoreMethodNode
}

/**
 * Routes tree stored within the routes store
 */
export type StoreRoutesTree = {
  tokens: MatchItRouteToken[][]
  domains: {
    [domain: string]: StoreDomainNode
  }
}

/**
 * Shape of the matched route for a pattern, method and domain.
 */
export type MatchedRoute = {
  route: RouteJSON

  /**
   * A unique key for the looked up route
   */
  routeKey: string

  /**
   * Route params
   */
  params: Record<string, any>

  /**
   * Route subdomains (if part of a subdomain)
   */
  subdomains: Record<string, any>
}

/**
 * A collection of route matchers
 */
export type RouteMatchers = {
  [param: string]: RouteMatcher
}

/**
 * Representation of a route as JSON
 */
export type RouteJSON = {
  /**
   * The execute function to execute the route middleware
   * and the handler
   */
  execute: (
    route: RouteJSON,
    resolver: ContainerResolver<any>,
    ctx: HttpContext,
    errorResponder: ServerErrorHandler['handle']
  ) => any

  /**
   * A unique name for the route
   */
  name?: string

  /**
   * Route URI pattern
   */
  pattern: string

  /**
   * Route handler
   */
  handler: StoreRouteHandler

  /**
   * Route middleware
   */
  middleware: Middleware<StoreRouteMiddleware>

  /**
   * Additional metadata associated with the route
   */
  meta: Record<string, any>

  /**
   * Tokens to be used to construct the route URL
   */
  tokens: MatchItRouteToken[]

  /**
   * HTTP methods, the route responds to.
   */
  methods: string[]

  /**
   * The domain for which the route is registered.
   */
  domain: string

  /**
   * Matchers for route params.
   */
  matchers: RouteMatchers
}

/**
 * Resource action names
 */
export type ResourceActionNames =
  | 'create'
  | 'index'
  | 'store'
  | 'show'
  | 'edit'
  | 'update'
  | 'destroy'

/**
 * Options accepted by makeUrl method
 * @deprecated
 */
export type MakeUrlOptions = {
  qs?: Record<string, any>
  domain?: string
  prefixUrl?: string
  disableRouteLookup?: boolean
}

/**
 * Options accepted by makeSignedUrl method
 * @deprecated
 */
export type MakeSignedUrlOptions = MakeUrlOptions & {
  expiresIn?: string | number
  purpose?: string
}
