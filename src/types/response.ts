/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/**
 * Cookie options can that can be set on the response
 */
export type CookieOptions = {
  domain: string
  expires: Date | (() => Date)
  httpOnly: boolean
  maxAge: number | string
  path: string
  sameSite: boolean | 'lax' | 'none' | 'strict'
  secure: boolean
}

/**
 * Types from which response header can be casted to a
 * string
 */
export type CastableHeader = string | number | boolean | string[] | number[] | boolean[]

/**
 * Config accepted by response the class
 */
export type ResponseConfig = {
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
   * Options to set cookies
   */
  cookie: Partial<CookieOptions>
}

/**
 * Stream that can be piped to the "response.stream" method
 */
export type ResponseStream = NodeJS.ReadStream | NodeJS.ReadWriteStream | NodeJS.ReadableStream
