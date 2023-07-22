/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { ErrorHandler, FinalHandler } from '@poppinss/middleware/types'

import type { Constructor } from './base.js'
import type { QSParserConfig } from './qs.js'
import type { RequestConfig } from './request.js'
import type { ResponseConfig } from './response.js'
import type { HttpContext } from '../http_context/main.js'

/**
 * Normalized HTTP error used by the exception
 * handler.
 */
export type HttpError = {
  message: string
  status: number
  code?: string
  stack?: string
  cause?: any
  messages?: any
  errors?: any
  handle?: (...args: any[]) => any
  report?: (...args: any[]) => any
}

/**
 * The pipeline for executing middleware during tests
 */
export interface TestingMiddlewarePipeline {
  finalHandler(handler: FinalHandler): this
  errorHandler(handler: ErrorHandler): this
  run(ctx: HttpContext): Promise<any>
}

/**
 * The expression to define a status page range
 */
export type StatusPageRange = `${number}..${number}` | `${number}` | number

/**
 * The callback function to render status page for a given
 * error.
 */
export type StatusPageRenderer = (error: HttpError, ctx: HttpContext) => any | Promise<any>

/**
 * Data type for the "http:request_finished" event
 */
export type HttpRequestFinishedPayload = {
  ctx: HttpContext
  duration: [number, number]
}

/**
 * Error handler to handle HTTP errors
 */
export type ServerErrorHandler = {
  report: (error: any, ctx: HttpContext) => any
  handle: (error: any, ctx: HttpContext) => any
}

/**
 * Error handler represented as a class
 */
export type ErrorHandlerAsAClass = Constructor<ServerErrorHandler>

/**
 * Config accepted by the HTTP server
 */
export type ServerConfig = RequestConfig &
  ResponseConfig & {
    /**
     * Whether or not to create an async local storage store for
     * the HTTP context.
     *
     * Defaults to false
     */
    useAsyncLocalStorage: boolean

    /**
     * Config for query string parser
     */
    qs: QSParserConfig
  }
