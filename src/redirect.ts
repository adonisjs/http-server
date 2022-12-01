/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import qs from 'qs'
import { parse } from 'node:url'
import encodeurl from 'encodeurl'
import type { IncomingMessage } from 'node:http'

import type { Response } from './response.js'
import type { Router } from './router/main.js'
import { MakeUrlOptions } from './types/route.js'

/**
 * Exposes the API to construct redirect routes
 */
export class Redirect {
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

  constructor(request: IncomingMessage, response: Response, router: Router) {
    this.#request = request
    this.#response = response
    this.#router = router
  }

  /**
   * Sends response by setting require headers
   */
  #sendResponse(url: string, query: Record<string, any>) {
    const stringified = qs.stringify(query)

    url = stringified ? `${url}?${stringified}` : url
    this.#response.location(encodeurl(url))
    this.#response.safeStatus(this.#statusCode)
    this.#response.type('text/plain; charset=utf-8')
    this.#response.send(`Redirecting to ${url}`)
  }

  /**
   * Returns the referrer url
   */
  #getReferrerUrl(): string {
    let url = this.#request.headers['referer'] || this.#request.headers['referrer'] || '/'
    return Array.isArray(url) ? url[0] : url
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
   * Redirect to the previous path.
   */
  back() {
    let query: Record<string, any> = {}

    const url = parse(this.#getReferrerUrl())

    /**
     * Parse query string from the referrer url
     */
    if (this.#forwardQueryString) {
      query = qs.parse(url.query || '')
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
      query = qs.parse(parse(this.#request.url!).query || '')
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
