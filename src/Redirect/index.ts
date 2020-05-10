/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { parse } from 'url'
import encodeurl from 'encodeurl'
import { IncomingMessage } from 'http'

import { ResponseContract } from '@ioc:Adonis/Core/Response'
import { RedirectContract } from '@ioc:Adonis/Core/Redirect'
import { RouterContract, MakeUrlOptions } from '@ioc:Adonis/Core/Route'

export class Redirect implements RedirectContract {
  private $forwardQueryString = false
  private $statusCode = 302
  private $queryString = new Map<string, any>()

  constructor (
    private request: IncomingMessage,
    private response: ResponseContract,
    private router: RouterContract
  ) {
  }

  private computeQueryString (): string {
    return Array.from(this.$queryString.entries())
      .map(([k, v]) => `${k}=${v}`)
      .join('&')
  }

  /**
   * Set a custom status code.
   */
  public status (statusCode: number): this {
    this.$statusCode = statusCode
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
      this.$forwardQueryString = true
      return this
    }

    if (typeof name === 'string') {
      this.$queryString.set(name, value)
      return this
    }

    Object.keys(name).forEach(key => {
      this.$queryString.set(key, name[key])
    })

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
      throw new Error()
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
    if (this.$forwardQueryString) {
      const { query: extractedQuery } = parse(this.request.url!, false)
      query = extractedQuery
    }

    // If we define our own QueryString, use it instead of the one forwarded.
    if (this.$queryString.size > 0) {
      query = this.computeQueryString()
    }

    url = query ? `${url}?${query}` : url
    this.response.location(encodeurl(url))
    this.response.safeStatus(this.$statusCode)
    this.response.type('text/plain; charset=utf-8')
    this.response.send(`Redirecting to ${url}`)
  }
}
