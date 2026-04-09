/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Readable } from 'node:stream'

/**
 * Configuration options for HTTP cookies that can be set on the response
 */
export type CookieOptions = {
  /** Domain name for the cookie */
  domain: string
  /** Expiration date for the cookie or function that returns the date */
  expires: Date | (() => Date)
  /** Whether the cookie should be accessible only through HTTP(S) */
  httpOnly: boolean
  /** Maximum age of the cookie in seconds or as a string */
  maxAge: number | string
  /** URL path for which the cookie is valid */
  path: string
  /** SameSite attribute to control cross-site request behavior */
  sameSite: boolean | 'lax' | 'none' | 'strict'
  /** Whether the cookie should only be sent over HTTPS */
  secure: boolean
  /** Whether the cookie should be partitioned (optional) */
  partitioned?: boolean
  /** Priority level for the cookie (optional) */
  priority?: 'low' | 'medium' | 'high'
}

/**
 * Types that can be cast to a string for HTTP response headers
 */
export type CastableHeader = string | number | boolean | string[] | number[] | boolean[]

/**
 * Configuration options for HTTP response handling and processing
 */
export type ResponseConfig = {
  /**
   * Define a custom serializer to serialize the response body
   * to a JSON string
   */
  serializeJSON(payload: unknown): string | undefined

  /**
   * Whether or not to generate etags for responses. Etags can be
   * enabled/disabled when sending response as well.
   *
   * Defaults to false
   */
  etag: boolean

  /**
   * The callback name for the JSONP response.
   *
   * Defaults to 'callback'
   */
  jsonpCallbackName: string

  /**
   * Default options to apply when setting cookies
   */
  cookie: Partial<CookieOptions>

  /**
   * Configuration for HTTP redirects
   */
  redirect: {
    /**
     * Array of allowed hosts for referrer-based redirects.
     * When empty, only the request's own host is allowed.
     *
     * Defaults to []
     */
    allowedHosts: string[]

    /**
     * Whether to forward the query string from the current request
     * by default on redirects.
     *
     * Defaults to false
     */
    forwardQueryString: boolean
  }
}

/**
 * A readable stream that can be piped to the response stream method
 */
export type ResponseStream = Readable | ReadableStream<any>
