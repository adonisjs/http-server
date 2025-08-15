/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import diagnostics_channel from 'node:diagnostics_channel'
import type {
  MiddlewareTracingData,
  HTTPRequestTracingData,
  RouteHandlerTracingData,
} from './types/tracing_channels.ts'

/**
 * Traces every HTTP request handled by the {@link Server} class.
 */
export const httpRequest = diagnostics_channel.tracingChannel<
  'adonisjs:http.request',
  HTTPRequestTracingData
>('adonisjs:http.request')

/**
 * Traces middleware executed during the HTTP request
 */
export const httpMiddleware = diagnostics_channel.tracingChannel<
  'adonisjs:http.middleware',
  MiddlewareTracingData
>('adonisjs:http.middleware')

/**
 * Traces the exception handler that converts errors into HTTP responses
 */
export const httpExceptionHandler =
  diagnostics_channel.tracingChannel<'adonisjs:http.exception.handler'>(
    'adonisjs:http.exception.handler'
  )

/**
 * Traces route handler executed during the HTTP request
 */
export const httpRouteHandler = diagnostics_channel.tracingChannel<
  'adonisjs:http.route.handler',
  RouteHandlerTracingData
>('adonisjs:http.route.handler')

/**
 * Traces non-stream and non-file download responses written by the AdonisJS
 * response class
 */
export const httpResponseSerializer =
  diagnostics_channel.tracingChannel<'adonisjs:http.response.serializer'>(
    'adonisjs:http.response.serializer'
  )
