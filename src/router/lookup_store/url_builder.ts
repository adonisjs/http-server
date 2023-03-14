/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { RuntimeException } from '@poppinss/utils'
import type { Encryption } from '@adonisjs/encryption'

import type { Qs } from '../../qs.js'
import { parseRoutePattern } from '../parser.js'
import type { RouteFinder } from './route_finder.js'

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
 */
export class UrlBuilder {
  /**
   * Query string parser
   */
  #qsParser: Qs

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
   * Encryption class for making signed URLs
   */
  #encryption: Encryption

  /**
   * Route finder for finding route pattern
   */
  #routeFinder: RouteFinder

  constructor(encryption: Encryption, routeFinder: RouteFinder, qsParser: Qs) {
    this.#qsParser = qsParser
    this.#encryption = encryption
    this.#routeFinder = routeFinder
  }

  /**
   * Raises exception when wildcard values array is missing or
   * has length of zero.
   */
  #ensureHasWildCardValues(pattern: string, values?: string[]) {
    if (!values || !Array.isArray(values) || !values.length) {
      throw new RuntimeException(
        `Cannot make URL for "${pattern}" route. Invalid value provided for wildcard param`
      )
    }
  }

  /*
   * Raises exception when value is not defined
   */
  #ensureHasParamValue(pattern: string, param: string, value: string) {
    if (value === undefined || value === null) {
      throw new RuntimeException(
        `Cannot make URL for "${pattern}" route. Missing value for "${param}" param`
      )
    }
  }

  /**
   * Processes the pattern against the params
   */
  #processPattern(pattern: string): string {
    const uriSegments: string[] = []
    const paramsArray = Array.isArray(this.#params) ? this.#params : null
    const paramsObject = !Array.isArray(this.#params) ? this.#params : {}

    let paramsIndex = 0
    const tokens = parseRoutePattern(pattern)

    for (const token of tokens) {
      /**
       * Expected wildcard param to be at the end always and hence
       * we must break out from the loop
       */
      if (token.type === 0) {
        uriSegments.push(`${token.val}${token.end}`)
      } else if (token.type === 2) {
        const values: string[] = paramsArray ? paramsArray.slice(paramsIndex) : paramsObject['*']
        this.#ensureHasWildCardValues(pattern, values)
        uriSegments.push(`${values.join('/')}${token.end}`)
        break
      } else {
        const paramName = token.val
        const value = paramsArray ? paramsArray[paramsIndex] : paramsObject[paramName]

        /**
         * Type = 1 means param is required
         */
        if (token.type === 1) {
          this.#ensureHasParamValue(pattern, paramName, value)
        }

        paramsIndex++
        if (value !== undefined && value !== null) {
          uriSegments.push(`${value}${token.end}`)
        }
      }
    }

    return `/${uriSegments.join('/')}`
  }

  /**
   * Suffix the query string to the URL
   */
  #suffixQueryString(url: string, qs?: Record<string, any>): string {
    if (qs) {
      const queryString = this.#qsParser.stringify(qs)
      url = queryString ? `${url}?${queryString}` : url
    }

    return url
  }

  /**
   * Prefixes base URL to the uri string
   */
  #prefixBaseUrl(uri: string) {
    return this.#baseUrl ? `${this.#baseUrl}${uri}` : uri
  }

  /**
   * Prefix a custom base URL to the final URI
   */
  prefixUrl(url: string): this {
    this.#baseUrl = url
    return this
  }

  /**
   * Disable route lookup. Calling this method considers
   * the "identifier" as the route pattern
   */
  disableRouteLookup(): this {
    this.#shouldPerformLookup = false
    return this
  }

  /**
   * Append query string to the final URI
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
   */
  make(identifier: string) {
    let url: string

    if (this.#shouldPerformLookup) {
      const route = this.#routeFinder.findOrFail(identifier)
      url = this.#processPattern(route.pattern)
    } else {
      url = this.#processPattern(identifier)
    }

    return this.#suffixQueryString(this.#prefixBaseUrl(url), this.#qs)
  }

  /**
   * Generate a signed URL for the given route identifier. The identifier can be the
   * route name, controller.method name or the route pattern
   * itself.
   */
  makeSigned(identifier: string, options?: { expiresIn?: string | number; purpose?: string }) {
    let url: string

    if (this.#shouldPerformLookup) {
      const route = this.#routeFinder.findOrFail(identifier)
      url = this.#processPattern(route.pattern)
    } else {
      url = this.#processPattern(identifier)
    }

    /*
     * Making the signature from the qualified url. We do not prefix the domain when
     * making signature, since it just makes the signature big.
     *
     * There might be a case, when someone wants to generate signature for the same route
     * on their 2 different domains, but we ignore that case for now and can consider
     * it later (when someone asks for it)
     */
    const signature = this.#encryption.verifier.sign(
      this.#suffixQueryString(url, this.#qs),
      options?.expiresIn,
      options?.purpose
    )

    const qs = Object.assign({}, this.#qs, { signature })
    return this.#suffixQueryString(this.#prefixBaseUrl(url), qs)
  }
}
