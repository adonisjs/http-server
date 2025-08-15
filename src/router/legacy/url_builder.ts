/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Router } from '../main.ts'

/**
 * URL builder class is used to create URIs for pre-registered
 * routes.
 *
 * ```ts
 * const builder = new UrlBuilder(encryption, routeFinder)
 *
 * builder
 *  .qs({ sort: 'id' })
 *  .params([category.id])
 *  .make('categories.posts.index')
 * ```
 *
 * @deprecated
 * Instead use "@adonisjs/core/services/url_builder" instead
 */
export class UrlBuilder {
  /**
   * The parameters to apply on the route
   */
  #params: any[] | Record<string, any> = {}

  /**
   * Query string to append to the route
   */
  #qs: Record<string, any> = {}

  /**
   * Should we perform the route lookup or just build the
   * given pattern as it is.
   */
  #shouldPerformLookup = true

  /**
   * BaseURL to append to the constructored URL
   */
  #baseUrl?: string

  /**
   * Route finder for finding route pattern
   */
  #router: Router

  #domain: string | undefined

  constructor(router: Router, domain?: string) {
    this.#router = router
    this.#domain = domain
  }

  /**
   * Prefix a custom base URL to the final URI
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  prefixUrl(url: string): this {
    this.#baseUrl = url
    return this
  }

  /**
   * Disable route lookup. Calling this method considers
   * the "identifier" as the route pattern
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  disableRouteLookup(): this {
    this.#shouldPerformLookup = false
    return this
  }

  /**
   * Append query string to the final URI
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  qs(queryString?: Record<string, any>): this {
    if (!queryString) {
      return this
    }

    this.#qs = queryString
    return this
  }

  /**
   * Specify params to apply to the route pattern
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  params(params?: any[] | Record<string, any>): this {
    if (!params) {
      return this
    }

    this.#params = params
    return this
  }

  /**
   * Generate URL for the given route identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   */
  make(identifier: string): string {
    return this.#router.makeUrl(identifier, this.#params, {
      prefixUrl: this.#baseUrl,
      disableRouteLookup: !this.#shouldPerformLookup,
      domain: this.#domain,
      qs: this.#qs,
    })
  }

  /**
   * Generate a signed URL for the given route identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   *
   * @deprecated
   * Instead use "@adonisjs/core/services/url_builder" instead
   *
   */
  makeSigned(identifier: string, options?: { expiresIn?: string | number; purpose?: string }) {
    return this.#router.makeSignedUrl(identifier, this.#params, {
      prefixUrl: this.#baseUrl,
      disableRouteLookup: !this.#shouldPerformLookup,
      domain: this.#domain,
      qs: this.#qs,
      ...options,
    })
  }
}
