/**
 * @module @poppinss/http-server
 */

/*
* @poppinss/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

import haye from 'haye'
import { Exception, parseIocReference } from '@poppinss/utils'

import {
  RouteNode,
  MiddlewareStoreContract,
  MiddlewareNode,
  ResolvedMiddlewareNode,
} from '../contracts'

import { exceptionCodes } from '../helpers'

/**
 * Middleware store register and keep all the application middleware at one
 * place. Also middleware are resolved during the registration and any
 * part of the application can read them without extra overhead.
 *
 * The middleware store transparently relies on `Ioc.use` and `Ioc.make`
 * globals. If you are not using the IoC container, then simply register
 * all middleware as plain functions and not `ioc namespaces`.
 *
 * @example
 * ```ts
 * const store = new MiddlewareStore()
 *
 * store.register([
 *   'App/Middleware/Auth'
 * ])
 *
 * store.registerNamed({
 *   auth: 'App/Middleware/Auth'
 * })
 *
 * store.get()
 * ```
 */
export class MiddlewareStore<Context extends any> implements MiddlewareStoreContract<Context> {
  private _list: ResolvedMiddlewareNode<Context>[] = []
  private _named: { [alias: string]: ResolvedMiddlewareNode<Context> } = {}

  /**
   * Resolves the middleware node based upon it's type. If value is a string, then
   * we pre-fetch it from the IoC container upfront. On every request, we just
   * create a new instance of the class and avoid re-fetching it from the IoC
   * container for performance reasons.
   *
   * The annoying part is that one has to create the middleware before registering
   * it, otherwise an exception will be raised.
   */
  private _resolveMiddlewareItem (middleware: MiddlewareNode<Context>): ResolvedMiddlewareNode<Context> {
    return typeof(middleware) === 'function' ? {
      type: 'function',
      value: middleware,
      args: [],
    } : Object.assign(parseIocReference(`${middleware}.handle`, undefined, undefined, true), {
      args: [],
    })
  }

  /**
   * Register an array of global middleware. These middleware are read
   * by HTTP server and executed on every request
   */
  public register (middleware: MiddlewareNode<Context>[]): this {
    this._list = middleware.map(this._resolveMiddlewareItem.bind(this))
    return this
  }

  /**
   * Register named middleware that can be referenced later on routes
   */
  public registerNamed (middleware: { [alias: string]: MiddlewareNode<Context> }): this {
    this._named = Object.keys(middleware).reduce((result, alias) => {
      result[alias] = this._resolveMiddlewareItem(middleware[alias])
      return result
    }, {})

    return this
  }

  /**
   * Return all middleware registered using [[MiddlewareStore.register]]
   * method
   */
  public get (): ResolvedMiddlewareNode<Context>[] {
    return this._list
  }

  /**
   * Returns a single middleware by it's name registered
   * using [[MiddlewareStore.registerNamed]] method.
   */
  public getNamed (name: string): null | ResolvedMiddlewareNode<Context> {
    return this._named[name] || null
  }

  /**
   * A helper method to pre-compile route middleware using the middleware
   * store. Resolved middleware will be attached to `route.meta`
   * property, which can be read later by the middleware
   * processing layer.
   */
  public preCompileMiddleware (route: RouteNode<Context>) {
    route.meta.resolvedMiddleware = route.middleware.map((item) => {
      /**
       * Plain old function
       */
      if (typeof (item) === 'function') {
        return { type: 'function', value: item, args: [] }
      }

      /**
       * Extract middleware name and args from the string
       */
      const [ { name, args } ] = haye.fromPipe(item).toArray()

      /**
       * Get resolved node for the given name and raise exception when that
       * name is missing
       */
      const resolvedMiddleware = this.getNamed(name)
      if (!resolvedMiddleware) {
        throw new Exception(
          `Cannot find named middleware ${name}`,
          500,
          exceptionCodes.E_MISSING_NAMED_MIDDLEWARE,
        )
      }

      resolvedMiddleware.args = args
      return resolvedMiddleware
    })
  }
}
