/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Constructor } from '@poppinss/utils/types'
import type { ErrorHandler, FinalHandler } from '@poppinss/middleware/types'

import type { QSParserConfig } from './qs.ts'
import type { RequestConfig } from './request.ts'
import type { ResponseConfig } from './response.ts'
import type { HttpContext } from '../http_context/main.ts'

/**
 * Normalized HTTP error structure used by exception handlers
 */
export type HttpError = {
  /** Error message describing the issue */
  message: string
  /** HTTP status code */
  status: number
  /** Optional error code identifier */
  code?: string
  /** Optional stack trace */
  stack?: string
  /** Optional underlying cause of the error */
  cause?: any
  /** Optional additional error messages */
  messages?: any
  /** Optional validation or field errors */
  errors?: any
  /** Optional custom error handler method */
  handle?: (...args: any[]) => any
  /** Optional error reporting method */
  report?: (...args: any[]) => any
}

/**
 * Pipeline interface for executing middleware chains during testing
 */
export interface TestingMiddlewarePipeline {
  /** Set the final handler for the pipeline */
  finalHandler(handler: FinalHandler): this
  /** Set the error handler for the pipeline */
  errorHandler(handler: ErrorHandler): this
  /** Execute the middleware pipeline with the given context */
  run(ctx: HttpContext): Promise<any>
}

/**
 * Expression format for defining HTTP status code ranges for error pages
 */
export type StatusPageRange = `${number}..${number}` | `${number}` | number

/**
 * Callback function to render custom status pages for HTTP errors
 */
export type StatusPageRenderer = (error: HttpError, ctx: HttpContext) => any | Promise<any>

/**
 * Payload structure for the http:request_completed event
 */
export type HttpRequestFinishedPayload = {
  /** HTTP context for the completed request */
  ctx: HttpContext
  /** Request duration as a high-resolution time tuple */
  duration: [number, number]
}

/**
 * Event types and payloads emitted by the HTTP server
 */
export type HttpServerEvents = {
  /** Event fired when an HTTP request is completed */
  'http:request_completed': HttpRequestFinishedPayload
}

/**
 * Interface for handling and reporting HTTP errors in the server
 */
export type ServerErrorHandler = {
  /** Method to report errors for logging or monitoring */
  report: (error: any, ctx: HttpContext) => any
  /** Method to handle errors and send appropriate responses */
  handle: (error: any, ctx: HttpContext) => any
}

/**
 * Constructor type for error handler classes that implement ServerErrorHandler
 */
export type ErrorHandlerAsAClass = Constructor<ServerErrorHandler>

/**
 * Complete configuration options for the HTTP server extending request and response configs
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

    /**
     * The number of milliseconds of inactivity a server needs to wait for additional incoming
     * data after it has finished writing the last response.
     *
     * @default 5000 (as per Node.js defaults)
     */
    keepAliveTimeout?: number

    /**
     * Limit the amount of time the parser will wait to receive the complete HTTP headers.
     *
     * @default 60000 (as per Node.js defaults)
     */
    headersTimeout?: number

    /**
     * Sets the timeout value in milliseconds for receiving the entire request from the client
     *
     * @default 300000 (as per Node.js defaults)
     */
    requestTimeout?: number

    /**
     * The number of milliseconds of inactivity before a socket is presumed to have timed out
     *
     * @default 0 (as per Node.js defaults)
     */
    timeout?: number
  }
