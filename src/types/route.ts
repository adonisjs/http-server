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

import type { ServerErrorHandler } from './server.js'
import type { Constructor, LazyImport } from './base.js'
import type { HttpContext } from '../http_context/main.js'
import type { MiddlewareFn, ParsedGlobalMiddleware } from './middleware.js'

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
 * Route node persisted within the routes store
 */
export type StoreRouteNode = {
  /**
   * The execute function to execute the route middleware
   * and the handler
   */
  execute: (
    route: StoreRouteNode,
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

/**
 * Options accepted by "RouteBuilder.url" method
 */
export type RouteBuilderURLOptions = {
  qs?: Record<string, any>
  prefixUrl?: string
}

/**
 * Options accepted by "RouteBuilder.signedUrl" method
 */
export type RouteBuilderSignedURLOptions = RouteBuilderURLOptions & {
  expiresIn?: string | number
  purpose?: string
}

/**
 * Infers param segment from the route identifier.
 */
export type ParamSegment<Identifier extends string> =
  Identifier extends `${infer SegmentA}/${infer SegmentB}`
    ? Param<SegmentA> | ParamSegment<SegmentB>
    : Param<Identifier>
export type Param<Segment extends string> = Segment extends `:${string}?`
  ? never
  : Segment extends `:${infer ParamName}`
    ? ParamName extends `${infer ParamWithoutExt}.${string}`
      ? ParamWithoutExt
      : ParamName
    : never

/**
 * Infers optional param segment from the route identifier.
 */
export type OptionalParamSegment<Identifier extends string> =
  Identifier extends `${infer SegmentA}/${infer SegmentB}`
    ? OptionalParam<SegmentA> | OptionalParamSegment<SegmentB>
    : OptionalParam<Identifier>
export type OptionalParam<Segment extends string> = Segment extends `:${infer ParamName}?`
  ? ParamName
  : never

/**
 * Infers wildcard param segment from the route identifier.
 */
export type WildcardParamSegment<Identifier extends string> =
  Identifier extends `${infer SegmentA}/${infer SegmentB}`
    ? WildcardParam<SegmentA> | WildcardParamSegment<SegmentB>
    : WildcardParam<Identifier>
export type WildcardParam<Segment extends string> = Segment extends '*' ? '*' : never

export type Simplify<T> = { [KeyType in keyof T]: T[KeyType] } & {}

/**
 * Infer route params from the route idenfifier
 */
export type InferRouteParams<Identifier extends string> = Simplify<
  {
    [Key in ParamSegment<Identifier>]: string
  } & {
    [Key in OptionalParamSegment<Identifier>]?: string
  } & {
    [Key in WildcardParamSegment<Identifier>]: string[]
  }
>

/**
 * LookupList type is used by the URLBuilder to provide
 * type-safety when creating URLs.
 *
 * There is no runtime property that matches this type. Its
 * purely for type-inference.
 */
export type LookupList = {
  [identifier: string]: {
    paramsTuple?: [...any[]]
    params?: {
      [name: string]: any
    }
  }
}

/**
 * To be generated by the router and used by the URL builder
 * and the LookupStore
 */
export interface RoutesList {}
