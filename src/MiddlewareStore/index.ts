/**
 * @module @adonisjs/http-server
 */

/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import { IocContract } from '@adonisjs/fold'
import { IoCResolver } from '@poppinss/utils'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import {
  MiddlewareNode,
  MiddlewareStoreContract,
  ResolvedMiddlewareNode,
} from '@ioc:Adonis/Core/Middleware'

/**
 * Middleware store register and keep all the application middleware at one
 * place. Also middleware are resolved during the registration and any
 * part of the application can read them without extra overhead.
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
export class MiddlewareStore implements MiddlewareStoreContract {
  /**
   * A list of global middleware
   */
  private _list: ResolvedMiddlewareNode[] = []

  /**
   * A map of named middleware. Named middleware are used as reference
   * on the routes
   */
  private _named: { [alias: string]: ResolvedMiddlewareNode } = {}

  /**
   * The resolver to resolve middleware from the IoC container
   */
  private _resolver: IoCResolver

  constructor (container: IocContract) {
    this._resolver = new IoCResolver(container)
  }

  /**
   * Resolves the middleware node based upon it's type. If value is a string, then
   * we pre-fetch it from the IoC container upfront. On every request, we just
   * create a new instance of the class and avoid re-fetching it from the IoC
   * container for performance reasons.
   *
   * The annoying part is that one has to create the middleware before registering
   * it, otherwise an exception will be raised.
   */
  private _resolveMiddleware (middleware: MiddlewareNode): ResolvedMiddlewareNode {
    return typeof(middleware) === 'function' ? {
      type: 'function',
      value: middleware,
      args: [],
    } : Object.assign(this._resolver.resolve(`${middleware}.handle`), { args: [] })
  }

  /**
   * Register an array of global middleware. These middleware are read
   * by HTTP server and executed on every request
   */
  public register (middleware: MiddlewareNode[]): this {
    this._list = middleware.map(this._resolveMiddleware.bind(this))
    return this
  }

  /**
   * Register named middleware that can be referenced later on routes
   */
  public registerNamed (middleware: { [alias: string]: MiddlewareNode }): this {
    this._named = Object.keys(middleware).reduce((result, alias) => {
      result[alias] = this._resolveMiddleware(middleware[alias])
      return result
    }, {})

    return this
  }

  /**
   * Return all middleware registered using [[MiddlewareStore.register]]
   * method
   */
  public get (): ResolvedMiddlewareNode[] {
    return this._list
  }

  /**
   * Returns a single middleware by it's name registered
   * using [[MiddlewareStore.registerNamed]] method.
   */
  public getNamed (name: string): null | ResolvedMiddlewareNode {
    return this._named[name] || null
  }

  /**
   * Invokes a resolved middleware.
   */
  public async invokeMiddleware (
    middleware: ResolvedMiddlewareNode,
    params: [HttpContextContract, () => Promise<void>],
  ) {
    if (middleware.type === 'function') {
      return middleware.value(params[0], params[1], middleware.args)
    }

    const args: any[] = [params[0], params[1]]
    args.push(middleware.args)
    return this._resolver.call(middleware, undefined, args)
  }
}
