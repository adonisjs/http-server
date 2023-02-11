/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import is from '@sindresorhus/is'
import type { Logger } from '@adonisjs/logger'
import type { Level } from '@adonisjs/logger/types'

import { parseRange } from './helpers.js'
import * as errors from './exceptions.js'
import type { HttpContext } from './http_context/main.js'
import type { HttpError, StatusPageRange, StatusPageRenderer } from './types/server.js'

/**
 * The base HTTP exception handler one can inherit from to handle
 * HTTP exceptions.
 *
 * The HTTP exception handler has support for
 *
 * - Ability to render exceptions by calling the render method on the exception.
 * - Rendering status pages
 * - Pretty printing errors during development
 * - Transforming errors to JSON or HTML using content negotiation
 * - Reporting errors
 */
export class ExceptionHandler {
  /**
   * Whether or not to render debug info. When set to true, the errors
   * will have the complete error stack.
   */
  protected debug: boolean = process.env.NODE_ENV !== 'production'

  /**
   * Whether or not to render status pages. When set to true, the unhandled
   * errors with matching status codes will be rendered using a status
   * page.
   */
  protected renderStatusPages: boolean = process.env.NODE_ENV === 'production'

  /**
   * A collection of error status code range and the view to render.
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {}

  /**
   * Computed from the status pages property
   */
  #expandedStatusPages?: Record<number, StatusPageRenderer>

  /**
   * Renderers for rendering an error.
   */
  protected renderers: {
    html: (error: HttpError, ctx: HttpContext) => Promise<void>
    json: (error: HttpError, ctx: HttpContext) => Promise<void>
    json_api: (error: HttpError, ctx: HttpContext) => Promise<void>
  } = {
    html: async (error: HttpError, ctx: HttpContext) => {
      if (this.isDebuggingEnabled(ctx)) {
        const { default: Youch } = await import('youch')
        const html = await new Youch(error, ctx.request.request).toHTML()
        ctx.response.status(error.status).send(html)

        return
      }

      ctx.response.status(error.status).send(`<p> ${error.message} </p>`)
    },

    json: async (error: HttpError, ctx: HttpContext) => {
      if (this.isDebuggingEnabled(ctx)) {
        const { default: Youch } = await import('youch')
        const json = await new Youch(error, ctx.request.request).toJSON()
        ctx.response.status(error.status).send(json.error)

        return
      }

      ctx.response.status(error.status).send({ message: error.message })
    },

    json_api: async (error: HttpError, ctx: HttpContext) => {
      if (this.isDebuggingEnabled(ctx)) {
        const { default: Youch } = await import('youch')
        const json = await new Youch(error, ctx.request.request).toJSON()
        ctx.response.status(error.status).send(json.error)

        return
      }

      ctx.response.status(error.status).send({
        errors: [
          {
            title: error.message,
            code: error.code,
            status: error.status,
          },
        ],
      })
    },
  }

  /**
   * Enable/disable errors reporting
   */
  protected reportErrors: boolean = true

  /**
   * An array of exception classes to ignore when
   * reporting an error
   */
  protected ignoreExceptions: any[] = [
    errors.E_HTTP_EXCEPTION,
    errors.E_ROUTE_NOT_FOUND,
    errors.E_CANNOT_LOOKUP_ROUTE,
    errors.E_HTTP_REQUEST_ABORTED,
  ]

  /**
   * An array of HTTP status codes to ignore when reporting
   * an error
   */
  protected ignoreStatuses: number[] = [400, 422, 401]

  /**
   * An array of error codes to ignore when reporting
   * an error
   */
  protected ignoreCodes: string[] = []

  constructor(protected logger: Logger) {}

  /**
   * Expands status pages
   */
  #expandStatusPages() {
    if (!this.#expandedStatusPages) {
      this.#expandedStatusPages = Object.keys(this.statusPages).reduce((result, range) => {
        const renderer = this.statusPages[range as StatusPageRange]
        result = Object.assign(result, parseRange(range, renderer))
        return result
      }, {} as Record<number, StatusPageRenderer>)
    }

    return this.#expandedStatusPages
  }

  /**
   * Forcefully tweaking the type of the error object to
   * have known properties.
   */
  #toHttpError(error: unknown): HttpError {
    const httpError: any = is.object(error) ? error : new Error(String(error))
    httpError.message = httpError.message || 'Internal server error'
    httpError.status = httpError.status || 500
    return httpError
  }

  /**
   * Error reporting context
   */
  protected context(ctx: HttpContext): any {
    const requestId = ctx.request.id()
    return requestId
      ? {
          'x-request-id': requestId,
        }
      : {}
  }

  /**
   * The format in which the error should be rendered.
   */
  protected getResponseFormat(ctx: HttpContext): 'html' | 'json' | 'json_api' {
    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'application/vnd.api+json':
        return 'json_api'
      case 'json':
        return 'json'
      case 'html':
      default:
        return 'html'
    }
  }

  /**
   * Returns the log level for an error based upon the error
   * status code.
   */
  protected getErrorLogLevel(error: HttpError): Level {
    if (error.status >= 500) {
      return 'error'
    }

    if (error.status >= 400) {
      return 'warn'
    }

    return 'info'
  }

  /**
   * A boolean to control if errors should be rendered with
   * all the available debugging info.
   */
  protected isDebuggingEnabled(_: HttpContext): boolean {
    return this.debug
  }

  /**
   * Returns a boolean by checking if an error should be reported.
   */
  protected shouldReport(error: HttpError): boolean {
    if (this.reportErrors === false) {
      return false
    }

    if (this.ignoreStatuses.includes(error.status)) {
      return false
    }

    if (error.code && this.ignoreCodes.includes(error.code)) {
      return false
    }

    if (this.ignoreExceptions.find((exception) => error instanceof exception)) {
      return false
    }

    return true
  }

  /**
   * Reports an error during an HTTP request
   */
  async report(error: unknown, ctx: HttpContext) {
    const httpError = this.#toHttpError(error)
    if (!this.shouldReport(httpError)) {
      return
    }

    if (typeof httpError.report === 'function') {
      httpError.report(httpError, ctx)
      return
    }

    /**
     * Log the error using the logger
     */
    const level = this.getErrorLogLevel(httpError)
    this.logger.log(
      level,
      {
        ...(level === 'error' || level === 'fatal' ? { err: httpError } : {}),
        ...this.context(ctx),
      },
      httpError.message
    )
  }

  /**
   * Handles the error during the HTTP request.
   */
  async handle(error: unknown, ctx: HttpContext) {
    const httpError = this.#toHttpError(error)

    /**
     * Self handle exception
     */
    if (typeof httpError.handle === 'function') {
      return httpError.handle(httpError, ctx)
    }

    /**
     * Render status page
     */
    const statusPages = this.#expandStatusPages()
    if (this.renderStatusPages && statusPages[httpError.status]) {
      return statusPages[httpError.status](httpError, ctx)
    }

    /**
     * Use the format renderers.
     */
    const responseFormat = this.getResponseFormat(ctx)
    return this.renderers[responseFormat](httpError, ctx)
  }
}
