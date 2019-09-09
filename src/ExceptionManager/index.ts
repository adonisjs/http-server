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

import { IocContract, IocResolverContract } from '@adonisjs/fold'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { ErrorHandlerNode, ResolvedErrorHandlerNode } from '@ioc:Adonis/Core/Server'

import { useReturnValue } from '../helpers'

/**
 * Exception manager exposes the API to register custom error handler
 * and invoke it when exceptions are raised during the HTTP
 * lifecycle.
 */
export class ExceptionManager {
  /**
   * Resolved copy of error handler
   */
  private _resolvedErrorHandler?: ResolvedErrorHandlerNode

  /**
   * A reference to ioc resolver to resolve the error handler from
   * the IoC container
   */
  private _resolver: IocResolverContract

  constructor (container: IocContract) {
    this._resolver = container.getResolver()
  }

  /**
   * Register a custom error handler
   */
  public registerHandler (handler: ErrorHandlerNode) {
    if (typeof (handler) === 'string') {
      this._resolvedErrorHandler = this._resolver.resolve(handler)
    } else {
      this._resolvedErrorHandler = {
        type: 'function',
        value: handler,
      }
    }
  }

  /**
   * Handle the error
   */
  public async handle (error: any, ctx: HttpContextContract) {
    /**
     * Make response when no error handler has been registered
     */
    if (!this._resolvedErrorHandler) {
      ctx.response.status(error.status || 500).send(error.message)
      return
    }

    /**
     * Invoke the error handler and catch any errors raised by the error
     * handler itself. We don't expect error handlers to raise exceptions.
     * However, during development a broken error handler may raise
     * exceptions.
     */
    try {
      let value: any = null

      if (this._resolvedErrorHandler.type === 'function') {
        value = await this._resolvedErrorHandler.value(error, ctx)
      } else {
        value = await this._resolver.call(this._resolvedErrorHandler, undefined, [error, ctx])
      }

      if (useReturnValue(value, ctx)) {
        ctx.response.send(value)
      }
    } catch (finalError) {
      /**
       * Unexpected block
       */
      ctx.response.status(error.status || 500).send(error.message)
      ctx.logger.fatal(finalError, 'Unexpected exception raised from http exception handler')
    }
  }
}
