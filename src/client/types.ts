/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Types shared with the client. These should never import other types
 */

export type ClientRouteMatchItTokens = {
  /** Original token string */
  old: string
  /** Token type identifier (0=static, 1=param, 2=wildcard, 3=optional) */
  type: 0 | 1 | 2 | 3
  /** Token value */
  val: string
  /** Token end delimiter */
  end: string
}

/**
 * Complete route definition with all metadata, handlers, and execution context
 */
export type ClientRouteJSON = {
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
  handler?: unknown

  /**
   * Tokens to be used to construct the route URL
   */
  tokens: ClientRouteMatchItTokens[]

  /**
   * HTTP methods, the route responds to.
   */
  methods: string[]

  /**
   * The domain for which the route is registered.
   */
  domain: string
}

/**
 * Configuration options for URL generation helpers
 */
export type URLOptions = {
  /** Query string parameters to append to the URL */
  qs?: Record<string, any>
  /** URL prefix to prepend to the generated URL */
  prefixUrl?: string
}

/**
 * LookupList type is used by the URLBuilder to provide
 * type-safety when creating URLs.
 *
 * There is no runtime property that matches this type. Its
 * purely for type-inference.
 */
/**
 * Route definition structure for type-safe URL building
 */
export type LookupListRoute = {
  /** Parameters as a tuple for positional arguments */
  paramsTuple?: [...any[]]
  /** Parameters as a named object */
  params?: {
    [name: string]: any
  }
}

/**
 * Complete route lookup structure organized by HTTP methods and route identifiers
 */
export type LookupList = {
  /** HTTP method to route mapping */
  [method: string]: {
    /** Route identifier to route definition mapping */
    [identifier: string]: LookupListRoute
  }
}

/**
 * Utility type that constructs function arguments for route URL builders based on route parameters
 */
export type RouteBuilderArguments<
  Identifier,
  Route,
  Options extends any = URLOptions,
> = Route extends LookupListRoute
  ? Route['params'] extends undefined
    ? [identifier: Identifier, params?: undefined, options?: Options]
    : [undefined] extends [Route['params']]
      ? [identifier: Identifier, params?: Route['params'] | Route['paramsTuple'], options?: Options]
      : [identifier: Identifier, params: Route['params'] | Route['paramsTuple'], options?: Options]
  : never

/**
 * The urlFor helper is used to make URLs for pre-existing known routes. You can
 * make a URL using the route name, route pattern, or the route controller
 * reference (depends upon enabled lookupStrategies)
 *
 * ```ts
 * urlFor('users.show', [1]) // /users/1
 *
 * // Lookup inside a specific domain
 * urlFor('blog.adonisjs.com@posts.show', [1]) // /posts/1
 * ```
 */
export type UrlFor<Routes extends LookupList, Options extends any = URLOptions> = (<
  Identifier extends keyof Routes['ALL'] & string,
>(
  ...[identifier, params, options]: RouteBuilderArguments<
    Identifier,
    Routes['ALL'][Identifier],
    Options
  >
) => string) & {
  /**
   * Make URL for a GET route. An error will be raised if the route doesn't
   * exist.
   *
   * ```ts
   * urlFor.get('users.show', [1]) // { method: 'get', url: '/users/1' }
   * urlFor.get('users.store', [1]) // Error: Route not found GET@users/store
   * ```
   */
  get<RouteIdentifier extends keyof Routes['GET'] & string>(
    ...[identifier, params, options]: RouteBuilderArguments<
      RouteIdentifier,
      Routes['GET'][RouteIdentifier],
      Options
    >
  ): { method: 'GET'; url: string; form: { action: string; method: 'GET' } }

  /**
   * Make URL for a POST route. An error will be raised if the route doesn't
   * exist.
   *
   * ```ts
   * urlFor.post('users.store') // { method: 'post', url: '/users' }
   * urlFor.post('users.show', [1]) // Error: Route not found POST@users.show
   * ```
   */
  post<RouteIdentifier extends keyof Routes['POST'] & string>(
    ...[identifier, params, options]: RouteBuilderArguments<
      RouteIdentifier,
      Routes['POST'][RouteIdentifier],
      Options
    >
  ): { method: 'POST'; url: string; form: { action: string; method: 'POST' } }

  /**
   * Make URL for a PUT route. An error will be raised if the route doesn't
   * exist.
   *
   * ```ts
   * urlFor.put('users.update', [1]) // { method: 'put', url: '/users/1' }
   * urlFor.put('users.show', [1]) // Error: Route not found PUT@users.show
   * ```
   */
  put<RouteIdentifier extends keyof Routes['PUT'] & string>(
    ...[identifier, params, options]: RouteBuilderArguments<
      RouteIdentifier,
      Routes['PUT'][RouteIdentifier],
      Options
    >
  ): { method: 'PUT'; url: string; form: { action: string; method: 'PUT' } }

  /**
   * Make URL for a PATCH route. An error will be raised if the route doesn't
   * exist.
   *
   * ```ts
   * urlFor.put('users.update', [1]) // { method: 'patch', url: '/users/1' }
   * urlFor.put('users.show', [1]) // Error: Route not found PATCH@users.show
   * ```
   */
  patch<RouteIdentifier extends keyof Routes['PATCH'] & string>(
    ...[identifier, params, options]: RouteBuilderArguments<
      RouteIdentifier,
      Routes['PATCH'][RouteIdentifier],
      Options
    >
  ): { method: 'PATCH'; url: string; form: { action: string; method: 'PATCH' } }

  /**
   * Make URL for a DELETE route. An error will be raised if the route doesn't
   * exist.
   *
   * ```ts
   * urlFor.delete('users.destroy', [1]) // { method: 'delete', url: '/users/1' }
   * urlFor.delete('users.show', [1]) // Error: Route not found DELETE@users.show
   * ```
   */
  delete<RouteIdentifier extends keyof Routes['DELETE'] & string>(
    ...[identifier, params, options]: RouteBuilderArguments<
      RouteIdentifier,
      Routes['DELETE'][RouteIdentifier],
      Options
    >
  ): { method: 'DELETE'; url: string; form: { action: string; method: 'DELETE' } }

  /**
   * Make URL for a custom route method. An error will be raised if the route doesn't
   * exist for the same method.
   */
  method<
    Method extends keyof Routes & string,
    RouteIdentifier extends keyof Routes[Method] & string,
  >(
    method: Method,
    ...[identifier, params, options]: RouteBuilderArguments<
      RouteIdentifier,
      Routes[Method][RouteIdentifier],
      Options
    >
  ): { method: Method; url: string; form: { action: string; method: Method } }
}
