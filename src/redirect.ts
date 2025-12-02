/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { IncomingMessage } from 'node:http'

import debug from './debug.ts'
import type { Qs } from './qs.ts'
import { encodeUrl } from './helpers.ts'
import type { Router } from './router/main.ts'
import type { HttpResponse } from './response.ts'
import type {
  RoutesList,
  LookupList,
  URLOptions,
  GetRoutesForMethod,
  RouteBuilderArguments,
} from './types/url_builder.ts'
import { safeDecodeURI } from './utils.ts'

/**
 * Provides a fluent API for constructing HTTP redirect responses.
 *
 * The Redirect class allows you to build redirects with custom status codes,
 * query string forwarding, and route-based URL generation. It supports both
 * direct URL redirects and route-based redirects using registered route names.
 *
 * @example
 * ```ts
 * // Basic redirect
 * return response.redirect('https://example.com')
 *
 * // Redirect to a route
 * return response.redirect().toRoute('users.show', { id: 1 })
 *
 * // Redirect with status code and query string
 * return response.redirect()
 *   .status(301)
 *   .withQs({ utm_source: 'newsletter' })
 *   .toPath('/dashboard')
 * ```
 */
export class Redirect {
  /**
   * Flag indicating whether to forward the existing query string from the current request
   */
  #forwardQueryString = false

  /**
   * HTTP status code to use for the redirect response (defaults to 302)
   */
  #statusCode = 302

  /**
   * Custom query string parameters to include in the redirect URL
   */
  #queryString: Record<string, any> = {}

  /**
   * Reference to the Node.js incoming HTTP request
   */
  #request: IncomingMessage

  /**
   * Reference to the AdonisJS response instance
   */
  #response: HttpResponse

  /**
   * Reference to the AdonisJS router instance for URL building
   */
  #router: Router

  /**
   * Query string parser instance
   */
  #qs: Qs

  /**
   * Creates a new Redirect instance for handling HTTP redirects
   * @param request - Node.js incoming HTTP request
   * @param response - AdonisJS response instance
   * @param router - AdonisJS router instance
   * @param qs - Query string parser instance
   */
  constructor(request: IncomingMessage, response: HttpResponse, router: Router, qs: Qs) {
    this.#request = request
    this.#response = response
    this.#router = router
    this.#qs = qs
  }

  /**
   * Sends the redirect response by setting required headers and status code
   * @param url - Target URL for redirection
   * @param query - Query string parameters to append
   */
  #sendResponse(url: string, query: Record<string, any>) {
    const stringified = this.#qs.stringify(query)

    url = stringified ? `${url}?${stringified}` : url
    debug('redirecting to url "%s"', url)

    this.#response.location(encodeUrl(url))
    this.#response.safeStatus(this.#statusCode)
    this.#response.type('text/plain; charset=utf-8')
    this.#response.send(`Redirecting to ${url}`)
  }

  /**
   * Extracts and returns the referrer URL from request headers
   * @returns {string} The referrer URL or '/' if not found
   */
  #getReferrerUrl(): string {
    let url = this.#request.headers['referer'] || this.#request.headers['referrer'] || '/'
    return Array.isArray(url) ? url[0] : url
  }

  /**
   * Sets a custom HTTP status code for the redirect response
   * @param statusCode - HTTP status code to use (e.g., 301, 302, 307)
   * @returns {this} The Redirect instance for method chaining
   */
  status(statusCode: number): this {
    this.#statusCode = statusCode
    return this
  }

  /**
   * Clears any query string values previously added using the withQs method
   * @returns {this} The Redirect instance for method chaining
   */
  clearQs(): this {
    this.#forwardQueryString = false
    this.#queryString = {}
    return this
  }

  /**
   * Forwards the current request's query string to the redirect URL
   *
   * Use this overload when you want to preserve all existing query parameters
   * from the current request in the redirect URL.
   *
   * @returns The Redirect instance for method chaining
   *
   * @example
   * ```ts
   * // If current URL is '/search?q=hello&page=2'
   * response.redirect().withQs().toPath('/results')
   * // Redirects to: '/results?q=hello&page=2'
   * ```
   */
  withQs(): this
  /**
   * Adds multiple query string parameters to the redirect URL
   *
   * Use this overload when you want to add several query parameters at once
   * using an object with key-value pairs.
   *
   * @param values - Object containing query parameter names and values
   * @returns The Redirect instance for method chaining
   *
   * @example
   * ```ts
   * response.redirect().withQs({ page: 1, sort: 'name' }).toPath('/users')
   * // Redirects to: '/users?page=1&sort=name'
   * ```
   */
  withQs(values: Record<string, any>): this
  /**
   * Adds a single query string parameter to the redirect URL
   *
   * Use this overload when you want to add just one query parameter
   * with a specific name and value.
   *
   * @param name - The query parameter name
   * @param value - The query parameter value
   * @returns The Redirect instance for method chaining
   *
   * @example
   * ```ts
   * response.redirect().withQs('success', 'true').toPath('/dashboard')
   * // Redirects to: '/dashboard?success=true'
   * ```
   */
  withQs(name: string, value: any): this
  withQs(name?: Record<string, any> | string, value?: any): this {
    if (typeof name === 'undefined') {
      this.#forwardQueryString = true
      return this
    }

    if (typeof name === 'string') {
      this.#queryString[name] = value
      return this
    }

    Object.assign(this.#queryString, name)
    return this
  }

  /**
   * Redirects to the previous path using the Referer header
   * Falls back to '/' if no referrer is found
   */
  back() {
    let query: Record<string, any> = {}

    const referrerUrl = this.#getReferrerUrl()
    const url = safeDecodeURI(referrerUrl, false)

    debug('referrer url "%s"', referrerUrl)
    debug('referrer base url "%s"', url.pathname)

    /**
     * Parse query string from the referrer url
     */
    if (this.#forwardQueryString) {
      query = this.#qs.parse(url.query || '')
    }

    /**
     * Append custom query string
     */
    Object.assign(query, this.#queryString)

    /**
     * Redirect
     */
    this.#sendResponse(url.pathname || '', query)
  }

  /**
   * Redirects to a route using its identifier (name, pattern, or handler reference)
   * @param args - Route identifier, parameters, and options for URL building
   */
  toRoute<Identifier extends keyof GetRoutesForMethod<RoutesList, 'GET'> & string>(
    ...args: RoutesList extends LookupList
      ? RouteBuilderArguments<Identifier, RoutesList['GET'][Identifier], URLOptions>
      : []
  ) {
    const [identifier, params, options] = args as any[]
    if (options && options.qs) {
      this.withQs(options.qs)
      options.qs = undefined
    }

    const url = (this.#router.urlBuilder.urlFor as any)(identifier, params, options)
    return this.toPath(url)
  }

  /**
   * Redirects to a specific URL path
   * @param url - Target URL path for redirection
   */
  toPath(url: string) {
    let query: Record<string, any> = {}

    /**
     * Extract query string from the current URL
     */
    if (this.#forwardQueryString) {
      query = this.#qs.parse(safeDecodeURI(this.#request.url!, false).query || '')
    }

    /**
     * Assign custom query string
     */
    Object.assign(query, this.#queryString)

    /**
     * Redirect
     */
    this.#sendResponse(url, query)
  }
}
