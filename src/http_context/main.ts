/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import Macroable from '@poppinss/macroable'
import type { Logger } from '@adonisjs/logger'
import { RuntimeException } from '@poppinss/utils'
import { ContainerResolver } from '@adonisjs/fold'

import type { Request } from '../request.js'
import type { Response } from '../response.js'
import { asyncLocalStorage } from './local_storage.js'
import type { StoreRouteNode } from '../types/route.js'

/**
 * Http context encapsulates properties for a given HTTP request. The
 * context class can be extended using macros and getters.
 */
export class HttpContext extends Macroable {
  /**
   * Find if async localstorage is enabled for HTTP requests
   * or not
   */
  static get usingAsyncLocalStorage() {
    return asyncLocalStorage.isEnabled
  }

  /**
   * Get access to the HTTP context. Available only when
   * "usingAsyncLocalStorage" is true
   */
  static get(): HttpContext | null {
    if (!this.usingAsyncLocalStorage || !asyncLocalStorage.storage) {
      return null
    }

    return asyncLocalStorage.storage.getStore() || null
  }

  /**
   * Get the HttpContext instance or raise an exception if not
   * available
   */
  static getOrFail(): HttpContext {
    /**
     * Localstorage is not enabled
     */
    if (!this.usingAsyncLocalStorage || !asyncLocalStorage.storage) {
      throw new RuntimeException(
        'HTTP context is not available. Enable "useAsyncLocalStorage" inside "config/app.ts" file'
      )
    }

    const store = this.get()
    if (!store) {
      throw new RuntimeException('Http context is not available outside of an HTTP request')
    }

    return store
  }

  /**
   * Run a method that doesn't have access to HTTP context from
   * the async local storage.
   */
  static runOutsideContext<T>(callback: (...args: any[]) => T, ...args: any[]): T {
    if (!asyncLocalStorage.storage) {
      return callback(...args)
    }

    return asyncLocalStorage.storage.exit(callback, ...args)
  }

  /**
   * Reference to the current route. Not available inside
   * server middleware
   */
  route?: StoreRouteNode

  /**
   * A unique key for the current route
   */
  routeKey?: string

  /**
   * Route params
   */
  params: Record<string, any> = {}

  /**
   * Route subdomains
   */
  subdomains: Record<string, any> = {}

  constructor(
    public request: Request,
    public response: Response,
    public logger: Logger,
    public containerResolver: ContainerResolver<any>
  ) {
    super()

    /*
     * Creating the circular reference. We do this, since request and response
     * are meant to be extended and at times people would want to access
     * other ctx properties like `logger`, `profiler` inside those
     * extended methods.
     */
    this.request.ctx = this
    this.response.ctx = this
  }

  /**
   * A helper to see top level properties on the context object
   */
  /* c8 ignore next 3 */
  inspect() {
    return inspect(this, false, 1, true)
  }
}
