/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'
import type { AreAllOptional, InferRouteParams, Prettify } from '@poppinss/types'

import type { Router } from './router/main.js'
import { createSignedURL, createURL } from './utils.js'
import type {
  LookupList,
  URLOptions,
  SignedURLOptions,
  RouteBuilderArguments,
} from './types/url_builder.js'

/**
 * URLBuilder offers a type-safe API for generating URLs for a pre-registered
 * route or a route pattern. For example
 *
 * ```ts
 * import { route, url } from '@adonisjs/core/services/url_builder'
 *
 * route('users.update', { id: 10 })
 * url('/users/:id', { id: 10 })
 * ```
 */
export class URLBuilder<Routes extends LookupList> {
  #router: Router
  #encryption: Encryption
  #domainsList?: string[]

  /**
   * Returns the list of known domains registered with the router
   * and caches the result.
   */
  #getDomainsList() {
    if (!this.#domainsList) {
      this.#domainsList = Object.keys(this.#router.toJSON()).filter((domain) => domain !== 'root')
    }
    return this.#domainsList
  }

  /**
   * Make URL for a route pattern. You may use this method if you have
   * not registered this pattern as a route.
   */
  url = <T extends string>(
    identifier: T,
    ...[params, options]: Prettify<
      AreAllOptional<InferRouteParams<T>> extends true
        ? [params?: InferRouteParams<T>, options?: URLOptions]
        : [params: InferRouteParams<T>, options?: URLOptions]
    >
  ): string => {
    return createURL(identifier, this.#router.qs, params, options)
  }

  /**
   * Make signed URL for a route pattern. You may use this method if you have
   * not registered this pattern as a route
   */
  signedUrl = <T extends string>(
    identifier: T,
    ...[params, options]: Prettify<
      AreAllOptional<InferRouteParams<T>> extends true
        ? [params?: InferRouteParams<T>, options?: SignedURLOptions]
        : [params: InferRouteParams<T>, options?: SignedURLOptions]
    >
  ): string => {
    return createSignedURL(identifier, this.#router.qs, this.#encryption, params, options)
  }

  /**
   * Generate URL for the given route identifier. The identifier can be the
   * route name or the "controller.method" name.
   */
  route = <Identifier extends keyof Routes & string>(
    ...[identifier, params, options]: RouteBuilderArguments<Routes, Identifier, URLOptions>
  ): string => {
    const domain = this.#getDomainsList().find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier

    return createURL(
      this.#router.findOrFail(routeIdentifier, domain),
      this.#router.qs,
      params,
      options
    )
  }

  /**
   * Generate a signed URL for the given route identifier. The identifier can
   * be the route name or the "controller.method" name.
   */
  signedRoute = <Identifier extends keyof Routes & string>(
    ...[identifier, params, options]: RouteBuilderArguments<Routes, Identifier, SignedURLOptions>
  ): string => {
    const domain = this.#getDomainsList().find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier

    return createSignedURL(
      this.#router.findOrFail(routeIdentifier, domain),
      this.#router.qs,
      this.#encryption,
      params,
      options
    )
  }

  constructor(router: Router, encryption: Encryption) {
    this.#router = router
    this.#encryption = encryption
  }
}
