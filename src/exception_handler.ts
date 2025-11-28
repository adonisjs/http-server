/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import is from '@sindresorhus/is'
import Macroable from '@poppinss/macroable'
import type { Level } from '@adonisjs/logger/types'

import * as errors from './errors.ts'
import { parseRange } from './utils.ts'
import type { HttpContext } from './http_context/main.ts'
import { canWriteResponseBody } from './router/factories/use_return_value.ts'
import type { HttpError, StatusPageRange, StatusPageRenderer } from './types/server.ts'

/**
 * The base HTTP exception handler that provides comprehensive error handling capabilities.
 *
 * This class can be inherited to create custom exception handlers for your application.
 * It provides built-in support for:
 *
 * - Self-handling exceptions via their own render/handle methods
 * - Custom status page rendering for different HTTP error codes
 * - Debug-friendly error display during development
 * - Content negotiation for JSON, JSON API, and HTML error responses
 * - Configurable error reporting and logging
 * - Validation error handling with field-specific messages
 *
 * @example
 * ```ts
 * export default class HttpExceptionHandler extends ExceptionHandler {
 *   protected debug = app.inDev
 *   protected renderStatusPages = app.inProduction
 *
 *   protected statusPages = {
 *     '404': (error, ctx) => ctx.view.render('errors/404')
 *   }
 * }
 * ```
 */
export class ExceptionHandler extends Macroable {
  /**
   * Cached expanded status pages mapping individual status codes to their renderers
   * Computed from the statusPages property when first accessed
   */
  #expandedStatusPages?: Record<number, StatusPageRenderer>

  /**
   * Controls whether to include debug information in error responses
   * When enabled, errors include complete stack traces and detailed debugging info
   * Defaults to true in non-production environments
   */
  protected debug: boolean = process.env.NODE_ENV !== 'production'

  /**
   * Controls whether to render custom status pages for unhandled errors
   * When enabled, errors with matching status codes use configured status page renderers
   * Defaults to true in production environments
   */
  protected renderStatusPages: boolean = process.env.NODE_ENV === 'production'

  /**
   * Mapping of HTTP status code ranges to their corresponding page renderers
   * Supports ranges like '400-499' or individual codes like '404'
   */
  protected statusPages: Record<StatusPageRange, StatusPageRenderer> = {}

  /**
   * Controls whether errors should be reported to logging systems
   * When disabled, errors are handled but not logged or reported
   */
  protected reportErrors: boolean = true

  /**
   * Array of exception class constructors to exclude from error reporting
   * These exceptions are handled but not logged or reported to external systems
   */
  protected ignoreExceptions: any[] = [
    errors.E_HTTP_EXCEPTION,
    errors.E_ROUTE_NOT_FOUND,
    errors.E_CANNOT_LOOKUP_ROUTE,
    errors.E_HTTP_REQUEST_ABORTED,
  ]

  /**
   * Array of HTTP status codes to exclude from error reporting
   * Errors with these status codes are handled but not logged
   */
  protected ignoreStatuses: number[] = [400, 422, 401]

  /**
   * Array of custom error codes to exclude from error reporting
   * Errors with these codes are handled but not logged
   */
  protected ignoreCodes: string[] = []

  /**
   * Expands status page ranges into individual status code mappings
   * Creates a cached lookup table for faster status page resolution
   * @returns Mapping of status codes to renderers
   */
  #expandStatusPages() {
    if (!this.#expandedStatusPages) {
      this.#expandedStatusPages = Object.keys(this.statusPages).reduce(
        (result, range) => {
          const renderer = this.statusPages[range as StatusPageRange]
          result = Object.assign(result, parseRange(range, renderer))
          return result
        },
        {} as Record<number, StatusPageRenderer>
      )
    }

    return this.#expandedStatusPages
  }

  /**
   * Normalizes any thrown value into a standardized HttpError object
   * Ensures the error has required properties like message and status
   * @param error - Any thrown value (Error, string, object, etc.)
   * @returns {HttpError} Normalized error object with status and message
   */
  protected toHttpError(error: unknown): HttpError {
    const httpError: any = is.object(error) ? error : new Error(String(error))
    if (!httpError.message) {
      httpError.message = 'Internal server error'
    }
    if (!httpError.status) {
      httpError.status = 500
    }
    return httpError
  }

  /**
   * Provides additional context information for error reporting
   * Includes request ID when available for correlation across logs
   * @param ctx - HTTP context containing request information
   * @returns Additional context data for error reporting
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
   * Determines the appropriate log level based on HTTP status code
   * 5xx errors are logged as 'error', 4xx as 'warn', others as 'info'
   * @param error - HTTP error object with status code
   * @returns {Level} Appropriate logging level for the error
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
   * Determines whether debug information should be included in error responses
   * Override this method to implement context-specific debug control
   * @param _ - HTTP context (unused in base implementation)
   * @returns {boolean} True if debugging should be enabled
   */
  protected isDebuggingEnabled(_: HttpContext): boolean {
    return this.debug
  }

  /**
   * Determines whether an error should be reported to logging systems
   * Checks against ignore lists for exceptions, status codes, and error codes
   * @param error - HTTP error to evaluate for reporting
   * @returns {boolean} True if the error should be reported
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
   * Renders an error as a JSON response
   * In debug mode, includes full stack trace using Youch
   * @param error - HTTP error to render
   * @param ctx - HTTP context for the request
   */
  async renderErrorAsJSON(error: HttpError, ctx: HttpContext) {
    if (this.isDebuggingEnabled(ctx)) {
      const { Youch } = await import('youch')
      const json = await new Youch().toJSON(error)
      ctx.response.status(error.status).send(json)
      return
    }

    ctx.response.status(error.status).send({ message: error.message })
  }

  /**
   * Renders an error as a JSON API compliant response
   * Follows JSON API specification for error objects
   * @param error - HTTP error to render
   * @param ctx - HTTP context for the request
   */
  async renderErrorAsJSONAPI(error: HttpError, ctx: HttpContext) {
    if (this.isDebuggingEnabled(ctx)) {
      const { Youch } = await import('youch')
      const json = await new Youch().toJSON(error)
      ctx.response.status(error.status).send(json)
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
  }

  /**
   * Renders an error as an HTML response
   * Uses status pages if configured, otherwise shows debug info or simple message
   * @param error - HTTP error to render
   * @param ctx - HTTP context for the request
   */
  async renderErrorAsHTML(error: HttpError, ctx: HttpContext) {
    /**
     * Render status page
     */
    const statusPages = this.#expandStatusPages()
    if (this.renderStatusPages && statusPages[error.status]) {
      const statusPageResponse = await statusPages[error.status](error, ctx)

      /**
       * Use return value and convert it into a response
       */
      if (canWriteResponseBody(statusPageResponse, ctx)) {
        return ctx.response.safeStatus(error.status).send(statusPageResponse)
      }

      return statusPageResponse
    }

    if (this.isDebuggingEnabled(ctx)) {
      const { Youch } = await import('youch')
      const html = await new Youch().toHTML(error, {
        request: ctx.request.request,
        cspNonce: 'nonce' in ctx.response ? (ctx.response.nonce as string) : undefined,
      })
      ctx.response.status(error.status).send(html)
      return
    }

    ctx.response.status(error.status).send(`<p> ${error.message} </p>`)
  }

  /**
   * Renders validation error messages as a JSON response
   * Returns errors in a simple format with field-specific messages
   * @param error - Validation error containing messages array
   * @param ctx - HTTP context for the request
   */
  async renderValidationErrorAsJSON(error: HttpError, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: error.messages,
    })
  }

  /**
   * Renders validation error messages as JSON API compliant response
   * Transforms validation messages to JSON API error object format
   * @param error - Validation error containing messages array
   * @param ctx - HTTP context for the request
   */
  async renderValidationErrorAsJSONAPI(error: HttpError, ctx: HttpContext) {
    ctx.response.status(error.status).send({
      errors: error.messages.map((message: any) => {
        return {
          title: message.message,
          code: message.rule,
          source: {
            pointer: message.field,
          },
          meta: message.meta,
        }
      }),
    })
  }

  /**
   * Renders validation error messages as an HTML response
   * Creates simple HTML list of field errors separated by line breaks
   * @param error - Validation error containing messages array
   * @param ctx - HTTP context for the request
   */
  async renderValidationErrorAsHTML(error: HttpError, ctx: HttpContext) {
    ctx.response
      .status(error.status)
      .type('html')
      .send(
        error.messages
          .map((message: any) => {
            return `${message.field} - ${message.message}`
          })
          .join('<br />')
      )
  }

  /**
   * Renders an error to the appropriate response format based on content negotiation
   * Supports HTML, JSON API, and JSON formats based on Accept headers
   * @param error - HTTP error to render
   * @param ctx - HTTP context for the request
   */
  renderError(error: HttpError, ctx: HttpContext) {
    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'application/vnd.api+json':
        return this.renderErrorAsJSONAPI(error, ctx)
      case 'json':
        return this.renderErrorAsJSON(error, ctx)
      case 'html':
      default:
        return this.renderErrorAsHTML(error, ctx)
    }
  }

  /**
   * Renders validation errors to the appropriate response format based on content negotiation
   * Supports HTML, JSON API, and JSON formats for validation error messages
   * @param error - Validation error to render
   * @param ctx - HTTP context for the request
   */
  renderValidationError(error: HttpError, ctx: HttpContext) {
    switch (ctx.request.accepts(['html', 'application/vnd.api+json', 'json'])) {
      case 'application/vnd.api+json':
        return this.renderValidationErrorAsJSONAPI(error, ctx)
      case 'json':
        return this.renderValidationErrorAsJSON(error, ctx)
      case 'html':
      default:
        return this.renderValidationErrorAsHTML(error, ctx)
    }
  }

  /**
   * Reports an error to logging systems if reporting is enabled
   * Allows errors to self-report via their own report method if available
   * @param error - Any error object to report
   * @param ctx - HTTP context for additional reporting context
   */
  async report(error: unknown, ctx: HttpContext) {
    const httpError = this.toHttpError(error)
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
    ctx.logger.log(
      level,
      {
        ...(level === 'error' || level === 'fatal' ? { err: httpError } : {}),
        ...this.context(ctx),
      },
      httpError.message
    )
  }

  /**
   * Handles errors during HTTP request processing
   * Delegates to error's own handle method if available, otherwise renders response
   * @param error - Any error object to handle
   * @param ctx - HTTP context for error handling
   */
  async handle(error: unknown, ctx: HttpContext) {
    const httpError = this.toHttpError(error)

    /**
     * Self handle exception
     */
    if (typeof httpError.handle === 'function') {
      return httpError.handle(httpError, ctx)
    }

    /**
     * Handle validation error using the validation error
     * renderers
     */
    if (httpError.code === 'E_VALIDATION_ERROR' && 'messages' in httpError) {
      return this.renderValidationError(httpError, ctx)
    }

    /**
     * Use the format renderers.
     */
    return this.renderError(httpError, ctx)
  }
}
