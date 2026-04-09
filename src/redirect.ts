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
import { encodeUrl, getPreviousUrl } from './helpers.ts'
import type { Router } from './router/main.ts'
import type { HttpResponse } from './response.ts'
import type { ResponseConfig } from './types/response.ts'
import type {
  RoutesList,
  LookupList,
  URLOptions,
  GetRoutesForMethod,
  RouteBuilderArguments,
} from './types/url_builder.ts'
import { safeDecodeURI } from './utils.ts'
import Macroable from '@poppinss/macroable'
import type { HttpContext } from './http_context/main.ts'

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
export class Redirect extends Macroable {
  /**
   * HTTP context reference, set by the response when creating
   * the redirect instance during request handling.
   */
  ctx?: HttpContext

  /**
   * Array of allowed hosts for referrer-based redirects.
   * When empty, only the request's own host is allowed.
   */
  allowedHosts: string[]

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
   * @param config - Redirect configuration
   */
  constructor(
    request: IncomingMessage,
    response: HttpResponse,
    router: Router,
    qs: Qs,
    config: ResponseConfig['redirect']
  ) {
    super()
    this.#request = request
    this.#response = response
    this.#router = router
    this.#qs = qs
    this.allowedHosts = config.allowedHosts
    this.#forwardQueryString = config.forwardQueryString
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
   * Returns the previous URL for redirect back. By default reads
   * the `Referer` header and validates the host.
   *
   * Since `Redirect` extends `Macroable`, this method can be overridden
   * to implement custom logic such as session-based previous URL
   * resolution.
   *
   * @param fallback - URL to return when no valid previous URL is found
   */
  getPreviousUrl(fallback: string): string {
    return getPreviousUrl(this.#request.headers, this.allowedHosts, fallback)
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
   * Enables or disables query string forwarding from the current request.
   *
   * Use this overload to explicitly control query string forwarding,
   * especially useful when `forwardQueryString` is enabled by default
   * in the redirect config and you want to disable it for a specific redirect.
   *
   * @param forward - Whether to forward the query string
   * @returns The Redirect instance for method chaining
   *
   * @example
   * ```ts
   * // Disable query string forwarding for this redirect
   * response.redirect().withQs(false).toPath('/dashboard')
   * ```
   */
  withQs(forward: boolean): this
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
  withQs(name?: Record<string, any> | string | boolean, value?: any): this {
    if (typeof name === 'undefined') {
      this.#forwardQueryString = true
      return this
    }

    if (typeof name === 'boolean') {
      this.#forwardQueryString = name
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
   * Redirects to the previous URL resolved via `getPreviousUrl`.
   *
   * @param fallback - URL to redirect to when no valid previous URL is found
   */
  back(fallback: string = '/') {
    let query: Record<string, any> = {}

    const previousUrl = this.getPreviousUrl(fallback)
    const url = safeDecodeURI(previousUrl, false)

    debug('previous url "%s"', previousUrl)
    debug('previous base url "%s"', url.pathname)

    /**
     * Parse query string from the previous url
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
