/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { parse } from 'url'
import { stringify } from 'qs'
import encodeurl from 'encodeurl'
import { IncomingMessage } from 'http'

import { RedirectContract, ResponseContract } from '@ioc:Adonis/Core/Response'
import { RouterContract, MakeUrlOptions } from '@ioc:Adonis/Core/Route'

export class Redirect implements RedirectContract {
  private forwardQueryString = false
  private statusCode = 302
  private queryString: { [key: string]: any } = {}

  constructor (
    private request: IncomingMessage,
    private response: ResponseContract,
    private router: RouterContract
  ) {
  }

  /**
   * Set a custom status code.
   */
  public status (statusCode: number): this {
    this.statusCode = statusCode
    return this
  }

  /**
   * Forward the current QueryString or define one.
   */
  public withQs (): this
  public withQs (values: { [key: string]: any }): this
  public withQs (name: string, value: any): this
  public withQs (name?: { [key: string]: any } | string, value?: any): this {
    if (typeof name === 'undefined') {
      this.forwardQueryString = true
      return this
    }

    if (typeof name === 'string') {
      this.queryString[name] = value
      return this
    }

    this.queryString = name
    return this
  }

  /**
   * Redirect to the previous path.
   */
  public back () {
    const url = (this.request.headers['referer'] || this.request.headers['referrer'] || '/') as string

    return this.toPath(url)
  }

  /**
   * Redirect the request using a route identifier.
   */
  public toRoute (routeIdentifier: string, urlOptions?: MakeUrlOptions, domain?: string) {
    const route = this.router.lookup(routeIdentifier, domain)

    if (!route) {
      throw new Error(`Unable to lookup route for "${routeIdentifier}" identifier`)
    }

    const url = this.router.makeUrl(routeIdentifier, urlOptions, domain) as string
    return this.toPath(url)
  }

  /**
   * Redirect the request using a path.
   */
  public toPath (url: string) {
    let query

    // Extract the current QueryString if we want to forward it.
    if (this.forwardQueryString) {
      const { query: extractedQuery } = parse(this.request.url!, false)
      query = extractedQuery
    }

    // If we define our own QueryString, use it instead of the one forwarded.
    if (Object.keys(this.queryString).length > 0) {
      query = stringify(this.queryString)
    }

    url = query ? `${url}?${query}` : url
    this.response.location(encodeurl(url))
    this.response.safeStatus(this.statusCode)
    this.response.type('text/plain; charset=utf-8')
    this.response.send(`Redirecting to ${url}`)
  }
}
