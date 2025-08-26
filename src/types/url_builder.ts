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

import { type Prettify } from '@poppinss/utils/types'

/**
 * Options accepted by "urlFor" helper
 */
export type URLOptions = {
  qs?: Record<string, any>
  prefixUrl?: string
}

/**
 * Options accepted by "signedUrlFor" helper
 */
export type SignedURLOptions = URLOptions & {
  expiresIn?: string | number
  purpose?: string
}

/**
 * Returns params for a route identifier
 */
export type RouteBuilderArguments<
  Identifier,
  Route,
  Options extends any = URLOptions,
> = Route extends LookupListRoute
  ? Prettify<
      Route['params'] extends undefined
        ? [identifier: Identifier, params?: undefined, options?: Options]
        : [undefined] extends [Route['params']]
          ? [
              identifier: Identifier,
              params?: Route['params'] | Route['paramsTuple'],
              options?: Options,
            ]
          : [
              identifier: Identifier,
              params: Route['params'] | Route['paramsTuple'],
              options?: Options,
            ]
    >
  : never

/**
 * LookupList type is used by the URLBuilder to provide
 * type-safety when creating URLs.
 *
 * There is no runtime property that matches this type. Its
 * purely for type-inference.
 */
export type LookupListRoute = {
  paramsTuple?: [...any[]]
  params?: {
    [name: string]: any
  }
}
export type LookupList = {
  [method: string]: {
    [identifier: string]: LookupListRoute
  }
}

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
  ): { method: 'get'; url: string }

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
  ): { method: 'post'; url: string }

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
  ): { method: 'put'; url: string }

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
  ): { method: 'patch'; url: string }

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
  ): { method: 'delete'; url: string }

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
  ): { method: Method; url: string }
}

/**
 * Helper to get routes for a given method from Routes
 */
export type GetRoutesForMethod<Routes, Method> = {
  [K in keyof Routes]: Method extends K ? Routes[Method] : never
}[keyof Routes]

/**
 * To be generated by the router and used by the URL builder
 * and the LookupStore
 */
export interface RoutesList {}
