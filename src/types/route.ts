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
import { type ClientRouteJSON, type ClientRouteMatchItTokens } from '../client/types.ts'

/**
 * Configuration for matching and casting route parameters
 */
export type RouteMatcher = {
  /** Regular expression to match parameter values */
  match?: RegExp
  /** Function to cast string parameter values to specific types */
  cast?: (value: string) => any
}

/**
 * Route token structure used internally by the router
 */
export type MatchItRouteToken = RouteMatcher & ClientRouteMatchItTokens

/**
 * Extracts method names from a controller class that accept HttpContext as first parameter
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
 * Route handler implemented as a function that accepts HTTP context
 */
export type RouteFn = (ctx: HttpContext) => any

/**
 * Route handler representation stored in the route registry
 */
export type StoreRouteHandler =
  | RouteFn
  | {
      /** Optional name for the handler */
      name?: string
      /** Method name on the controller */
      method: string
      /** Dynamic import expression for lazy loading */
      importExpression: string | null
      /** Reference to controller class or method */
      reference: string | [LazyImport<Constructor<any>> | Constructor<any>, any?]
      /** Handler execution function */
      handle: (
        resolver: ContainerResolver<any>,
        ...args: [ctx: HttpContext, ...injections: any[]]
      ) => any
    }

/**
 * Middleware representation stored with route information
 */
export type StoreRouteMiddleware =
  MiddlewareFn | ({ name?: string; args?: any[] } & ParsedGlobalMiddleware)

/**
 * Route storage structure for a specific HTTP method containing tokens and route mappings
 */
export type StoreMethodNode = {
  /** Array of route tokens for pattern matching */
  tokens: MatchItRouteToken[][]
  /** Mapping from route patterns to unique route keys */
  routeKeys: {
    [pattern: string]: string
  }
  /** Mapping from route patterns to route definitions */
  routes: {
    [pattern: string]: RouteJSON
  }
}

/**
 * Domain-specific route storage containing method-based route organization
 */
export type StoreDomainNode = {
  /** HTTP method to method node mapping */
  [method: string]: StoreMethodNode
}

/**
 * Complete route tree structure organizing routes by domains and methods
 */
export type StoreRoutesTree = {
  /** Global route tokens for pattern matching */
  tokens: MatchItRouteToken[][]
  /** Domain-based route organization */
  domains: {
    [domain: string]: StoreDomainNode
  }
}

/**
 * Result of successful route matching containing route details and extracted parameters
 */
export type MatchedRoute = {
  /** The matched route definition */
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
 * Collection of parameter matchers indexed by parameter name
 */
export type RouteMatchers = {
  /** Parameter name to matcher mapping */
  [param: string]: RouteMatcher
}

/**
 * Complete route definition with all metadata, handlers, and execution context
 */
export type RouteJSON = Pick<ClientRouteJSON, 'name' | 'methods' | 'domain' | 'pattern'> & {
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
   * Matchers for route params.
   */
  matchers: RouteMatchers
}

/**
 * Standard RESTful resource action names for CRUD operations
 */
export type ResourceActionNames =
  'create' | 'index' | 'store' | 'show' | 'edit' | 'update' | 'destroy'

/**
 * @deprecated Options for URL generation (use URLBuilder instead)
 */
export type MakeUrlOptions = {
  /** Query string parameters to append */
  qs?: Record<string, any>
  /** Domain name to use for the URL */
  domain?: string
  /** Prefix to prepend to the generated URL */
  prefixUrl?: string
  /** Whether to disable route lookup optimization */
  disableRouteLookup?: boolean
}

/**
 * @deprecated Options for signed URL generation (use URLBuilder instead)
 */
export type MakeSignedUrlOptions = MakeUrlOptions & {
  /** Expiration time for the signed URL */
  expiresIn?: string | number
  /** Purpose identifier for the signed URL */
  purpose?: string
}
