/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

import type { Router } from './main.js'
import { createSignedURL, createURL } from '../utils.js'
import type {
  LookupList,
  InferRouteParams,
  RouteBuilderURLOptions,
  RouteBuilderSignedURLOptions,
  Simplify,
} from '../types/route.js'

type IsAllOptional<T> = keyof T extends never
  ? true
  : {
        [K in keyof T]-?: [undefined] extends [T[K]] ? never : K
      }[keyof T] extends never
    ? true
    : false

/**
 * Creates type-safe URL builder helpers
 */
export function createURLBuilder<Routes extends LookupList>(
  router: Router,
  encryption: Encryption
) {
  let domainsList: string[]
  function getDomainsList() {
    if (!domainsList) {
      domainsList = Object.keys(router.toJSON()).filter((domain) => domain !== 'root')
    }
    return domainsList
  }

  /**
   * Make URL for a route pattern. You may use this method if you have
   * not registered this pattern as a route
   */
  function url<T extends string>(
    identifier: T,
    ...[params, options]: Simplify<
      IsAllOptional<InferRouteParams<T>> extends true
        ? [params?: InferRouteParams<T>, options?: RouteBuilderURLOptions]
        : [params: InferRouteParams<T>, options?: RouteBuilderURLOptions]
    >
  ): string {
    return createURL(identifier, router.qs, params, options)
  }

  /**
   * Make signed URL for a route pattern. You may use this method if you have
   * not registered this pattern as a route
   */
  function signedUrl<T extends string>(
    identifier: T,
    ...[params, options]: Simplify<
      IsAllOptional<InferRouteParams<T>> extends true
        ? [params?: InferRouteParams<T>, options?: RouteBuilderSignedURLOptions]
        : [params: InferRouteParams<T>, options?: RouteBuilderSignedURLOptions]
    >
  ): string {
    return createSignedURL(identifier, router.qs, encryption, params, options)
  }

  /**
   * Generate URL for the given route identifier. The identifier can be the
   * route name, controller.method name or the route pattern.
   */
  function route<Identifier extends keyof Routes & string>(
    identifier: Identifier,
    ...[params, options]: Simplify<
      [undefined] extends [Routes[Identifier]['params']]
        ? [
            params?: Routes[Identifier]['params'] | Routes[Identifier]['paramsTuple'],
            options?: RouteBuilderURLOptions,
          ]
        : [
            params: Routes[Identifier]['params'] | Routes[Identifier]['paramsTuple'],
            options?: RouteBuilderURLOptions,
          ]
    >
  ): string {
    const domain = getDomainsList().find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier

    return createURL(router.findOrFail(routeIdentifier, domain), router.qs, params, options)
  }

  /**
   * Generate a signed URL for the given route identifier. The identifier can be the
   * route name, controller.method name or the route pattern.
   */
  function signedRoute<Identifier extends keyof Routes & string>(
    identifier: Identifier,
    ...[params, options]: Simplify<
      [undefined] extends [Routes[Identifier]['params']]
        ? [
            params?: Routes[Identifier]['params'] | Routes[Identifier]['paramsTuple'],
            options?: RouteBuilderSignedURLOptions,
          ]
        : [
            params: Routes[Identifier]['params'] | Routes[Identifier]['paramsTuple'],
            options?: RouteBuilderSignedURLOptions,
          ]
    >
  ): string {
    const domain = getDomainsList().find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier
    return createSignedURL(
      router.findOrFail(routeIdentifier, domain),
      router.qs,
      encryption,
      params,
      options
    )
  }

  return {
    url,
    signedUrl,
    route,
    signedRoute,
  }
}
