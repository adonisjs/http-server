/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { inspect } from 'node:util'
import { Macroable } from '@poppinss/macroable'
import type { StoreRouteNode } from '../types.js'

/**
 * Http context is passed to all route handlers, middleware,
 * error handler and server hooks.
 */
export class HttpContext extends Macroable {
  /**
   * Find if async localstorage is enabled for HTTP requests
   * or not
   */
  // static get usingAsyncLocalStorage() {
  //   return usingAsyncLocalStorage
  // }

  /**
   * Get access to the HTTP context. Available only when
   * "usingAsyncLocalStorage" is true
   */
  // static get(): HttpContext | null {
  //   if (!this.usingAsyncLocalStorage) {
  //     return null
  //   }

  //   return httpContextLocalStorage.getStore() || null
  // }

  /**
   * Get the HttpContext instance or raise an exception if not
   * available
   */
  // static getOrFail(): HttpContext {
  //   /**
  //    * Localstorage is not enabled
  //    */
  //   if (!this.usingAsyncLocalStorage) {
  //     const error = new Exception(
  //       E_INVALID_ALS_ACCESS.message,
  //       E_INVALID_ALS_ACCESS.status,
  //       E_INVALID_ALS_ACCESS.code
  //     )
  //     error.help = E_INVALID_ALS_ACCESS.help.join('\n')
  //     throw error
  //   }

  //   const store = this.get()

  //   /**
  //    * Store is not accessible
  //    */
  //   if (!store) {
  //     const error = new Exception(
  //       E_INVALID_ALS_SCOPE.message,
  //       E_INVALID_ALS_SCOPE.status,
  //       E_INVALID_ALS_SCOPE.code
  //     )
  //     error.help = E_INVALID_ALS_SCOPE.help.join('\n')
  //     throw error
  //   }

  //   return store
  // }

  /**
   * Run a method that doesn't have access to HTTP context from
   * the async local storage.
   */
  // static runOutsideContext<T>(callback: (...args: any[]) => T, ...args: any[]): T {
  //   return httpContextLocalStorage.exit(callback, ...args)
  // }

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

  /**
   * Reference to the current route. Not available inside
   * server middleware
   */
  route?: StoreRouteNode & { params: string[] }

  constructor(public request: any, public response: any, public logger: any, public profiler: any) {
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
  inspect() {
    return inspect(this, false, 1, true)
  }
}
