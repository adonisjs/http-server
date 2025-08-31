/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:url'
import type { IncomingMessage } from 'node:http'

import debug from './debug.ts'
import type { Qs } from './qs.ts'
import { encodeUrl } from './helpers.ts'
import type { Response } from './response.ts'
import type { Router } from './router/main.ts'
import type {
  RoutesList,
  LookupList,
  URLOptions,
  GetRoutesForMethod,
  RouteBuilderArguments,
} from './types/url_builder.ts'

/**
 * Exposes the API to construct redirect routes
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
  #response: Response

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
  constructor(request: IncomingMessage, response: Response, router: Router, qs: Qs) {
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
   * Defines query string parameters for the redirect URL
   * - No arguments: forwards current request query string
   * - Object argument: adds multiple key-value pairs
   * - String arguments: adds single key-value pair
   * @param name - Query parameter name or object of parameters
   * @param value - Value for the query parameter (when name is string)
   * @returns {this} The Redirect instance for method chaining
   */
  withQs(): this
  withQs(values: Record<string, any>): this
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
    const url = parse(referrerUrl)

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
      query = this.#qs.parse(parse(this.#request.url!).query || '')
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
