/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse } from 'node:url'
import encodeUrl from 'encodeurl'
import type { IncomingMessage } from 'node:http'

import debug from './debug.js'
import type { Qs } from './qs.js'
import { getPreviousUrl } from './helpers.js'
import type { Response } from './response.js'
import type { Router } from './router/main.js'
import type { MakeUrlOptions } from './types/route.js'
import type { ResponseConfig } from './types/response.js'

/**
 * Exposes the API to construct redirect routes
 */
export class Redirect {
  /**
   * Array of allowed hosts for referrer-based redirects.
   * When empty, only the request's own host is allowed.
   */
  allowedHosts: string[]

  /**
   * A boolean to forward the existing query string
   */
  #forwardQueryString = false

  /**
   * The status code for the redirect
   */
  #statusCode = 302

  /**
   * A custom query string to forward
   */
  #queryString: Record<string, any> = {}

  #request: IncomingMessage
  #response: Response
  #router: Router
  #qs: Qs

  constructor(
    request: IncomingMessage,
    response: Response,
    router: Router,
    qs: Qs,
    config: ResponseConfig['redirect']
  ) {
    this.#request = request
    this.#response = response
    this.#router = router
    this.#qs = qs
    this.allowedHosts = config.allowedHosts
    this.#forwardQueryString = config.forwardQueryString
  }

  /**
   * Sends response by setting require headers
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
   * @param fallback - URL to return when no valid previous URL is found
   */
  getPreviousUrl(fallback: string): string {
    return getPreviousUrl(this.#request.headers, this.allowedHosts, fallback)
  }

  /**
   * Set a custom status code.
   */
  status(statusCode: number): this {
    this.#statusCode = statusCode
    return this
  }

  /**
   * Clearing query string values added using the
   * "withQs" method
   */
  clearQs(): this {
    this.#forwardQueryString = false
    this.#queryString = {}
    return this
  }

  /**
   * Define query string for the redirect. Not passing
   * any value will forward the current request query
   * string.
   */
  withQs(): this
  withQs(forward: boolean): this
  withQs(values: Record<string, any>): this
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
    const url = parse(previousUrl)

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
   * Redirect the request using a route identifier.
   */
  toRoute(routeIdentifier: string, params?: any[] | Record<string, any>, options?: MakeUrlOptions) {
    if (options && options.qs) {
      this.withQs(options.qs)
      options.qs = undefined
    }

    const url = this.#router.makeUrl(routeIdentifier, params, options)
    return this.toPath(url)
  }

  /**
   * Redirect the request using a path.
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
