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

import type { HttpContext } from '../http_context/main.js'
import type { MiddlewareFn, ParsedGlobalMiddleware } from './middleware.js'

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
 * Route handler defined as a function
 */
export type RouteFn = (ctx: HttpContext) => any

/**
 * Route handler persisted with the route store
 */
export type StoreRouteHandler =
  | RouteFn
  | {
      name: string
      handle: (
        resolver: ContainerResolver,
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
 * Route node persisted within the routes store
 */
export type StoreRouteNode = {
  /**
   * The execute function to execute the route middleware
   * and the handler
   */
  execute: (route: StoreRouteNode, resolver: ContainerResolver, ctx: HttpContext) => any

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
}

/**
 * An object of routes for a given HTTP method
 */
export type StoreMethodNode = {
  tokens: MatchItRouteToken[][]
  routeKeys: {
    [pattern: string]: string
  }
  routes: {
    [pattern: string]: StoreRouteNode
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
  route: StoreRouteNode

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
 * Shape of a route param matcher
 */
export type RouteMatcher = {
  match?: RegExp
  cast?: (value: string) => any
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
export type RouteJSON = StoreRouteNode & {
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
 */
export type MakeUrlOptions = {
  qs?: Record<string, any>
  domain?: string
  prefixUrl?: string
  disableRouteLookup?: boolean
}

/**
 * Options accepted by makeSignedUrl method
 */
export type MakeSignedUrlOptions = MakeUrlOptions & {
  expiresIn?: string | number
  purpose?: string
}
