/**
* @module @poppinss/response
*/

/*
* @poppinss/response
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../adonis-typings/index.ts" />

import etag from 'etag'
import vary from 'vary'
import fresh from 'fresh'
import { parse } from 'url'
import mime from 'mime-types'
import destroy from 'destroy'
import { extname } from 'path'
import encodeurl from 'encodeurl'
import onFinished from 'on-finished'
import { Macroable } from 'macroable'
import { Exception } from '@poppinss/utils'
import { DeepReadonly } from 'ts-essentials'
import { createReadStream, stat, Stats } from 'fs'
import contentDisposition from 'content-disposition'
import { ServerResponse, IncomingMessage } from 'http'
import { serialize, CookieOptions } from '@poppinss/cookie'

import {
  ResponseContract,
  CastableHeader,
  LazyBody,
  ResponseContentType,
  ResponseStream,
  ResponseConfigContract,
} from '@ioc:Adonis/Core/Response'

import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Wraps `fs.stat` to promise interface.
 */
function statFn (filePath: string): Promise<Stats> {
  return new Promise((resolve, reject) => {
    stat(filePath, (error, stats) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stats)
    })
  })
}

/**
 * Custom exception to abort requests as one liners
 */
class HttpException extends Exception {
  public body

  /**
   * This method returns an instance of the exception class
   */
  public static invoke (body: any, status: number) {
    if (body !== null && typeof (body) === 'object') {
      const error = new this(body.message || `Request aborted with status code${status}`, status)
      error.body = body
      return error
    }

    const error = new this(body || `Request aborted with status code${status}`, status)
    error.body = error.message
    return error
  }

  /**
   * Handle itself by making the response. This only works when using the
   * base exception handler shipped by AdonisJs
   */
  public handle (error: HttpException, ctx: HttpContextContract) {
    ctx.response.status(error.status).send(error.body)
  }
}

/**
 * The response is a wrapper over [ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)
 * streamlining the process of writing response body and automatically setting up appropriate headers.
 *
 * The response class has support for `explicitEnd` mode, which is set to true by default.
 *
 * When implicit end is set to true, the response class will not write content to the HTTP response
 * directly and instead waits for an explicit call to the `finish` method. This is done to
 * allow `return` statements from controllers.
 *
 * This is how `explicitEnd` mode works in nutshell.
 *
 * **When set to true**
 * 1. Calls to `send`, `json` and `jsonp` will be buffered until `finish` is called.
 * 2. `response.hasLazyBody` returns `true` after calling `send`, `json` or `jsonp`.
 * 3. If `response.hasLazyBody` return `false`, then server will use the `return value` of the controller
 *    and set it as body before calling `finish`.
 *
 * **When set to false**
 * 1. Calls to `send`, `json` and `jsonp` will write the response writeaway.
 * 2. The `return value` of the controller will be discarded.
 * 3. The call to `finish` method is a noop.
 */
export class Response extends Macroable implements ResponseContract {
  /**
   * Lazy body is used to set the response body. However, do not
   * write it on the socket immediately unless `response.finish`
   * is called.
   *
   * Only works with `explicitEnd=true`, which is set to `false` by default
   */
  public lazyBody: LazyBody | null = null

  protected static macros = {}
  protected static getters = {}

  private headers: any = {}
  private explicitStatus = false

  constructor (
    public request: IncomingMessage,
    public response: ServerResponse,
    private config: DeepReadonly<ResponseConfigContract>,
  ) {
    super()
  }

  /**
   * Returns a boolean telling if lazy body is already set or not
   */
  get hasLazyBody (): boolean {
    return !!(this.lazyBody && this.lazyBody.writer)
  }

  /**
   * Returns a boolean telling if response is finished or not.
   * Any more attempts to update headers or body will result
   * in raised exceptions.
   */
  get finished (): boolean {
    return this.response.finished
  }

  /**
   * Returns a boolean telling if response headers has been sent or not.
   * Any more attempts to update headers will result in raised
   * exceptions.
   */
  get headersSent (): boolean {
    return this.response.headersSent
  }

  /**
   * Returns a boolean telling if response headers and body is written
   * or not. When value is `true`, you can feel free to write headers
   * and body.
   */
  get isPending (): boolean {
    return (!this.headersSent && !this.finished)
  }

  /**
   * Normalizes header value to a string or an array of string
   */
  private castHeaderValue (value: any): string | string[] {
    return Array.isArray(value) ? (value as any).map(String) : String(value)
  }

  /**
   * Writes the body with appropriate response headers. Etag header is set
   * when `generateEtag` is set to `true`.
   *
   * Empty body results in `204`.
   */
  private writeBody (content: any, generateEtag: boolean, jsonpCallbackName?: string): void {
    let { type, body, originalType } = this.buildResponseBody(content)

    /**
     * Send 204 and remove content headers when body
     * is null
     */
    if (body === null) {
      this.safeStatus(204)
      this.removeHeader('Content-Type')
      this.removeHeader('Content-Length')
      this.removeHeader('Transfer-Encoding')
      this.endResponse()
      return
    }

    /**
     * Unknown types are not serializable
     */
    if (type === 'unknown') {
      throw new Error(`Cannot send ${originalType} as HTTP response`)
    }

    /**
     * In case of 204 and 304, remove unwanted headers
     */
    if ([204, 304].indexOf(this.response.statusCode) > -1) {
      this.removeHeader('Content-Type')
      this.removeHeader('Content-Length')
      this.removeHeader('Transfer-Encoding')
      this.endResponse(body)
      return
    }

    /**
     * Decide correct content-type header based upon the existence of
     * JSONP callback.
     */
    if (jsonpCallbackName) {
      this.header('X-Content-Type-Options', 'nosniff')
      this.safeHeader('Content-Type', 'text/javascript; charset=utf-8')
    } else {
      this.safeHeader('Content-Type', `${type}; charset=utf-8`)
    }

    /**
     * Generate etag if instructed. This is send using the request
     * body, which adds little delay to the response but ensures
     * unique etag based on body
     */
    if (generateEtag) {
      this.setEtag(body)
    }

    /**
     * If JSONP callback exists, then update the body to be a
     * valid JSONP response
     */
    if (jsonpCallbackName) {
      /**
       * replace chars not allowed in JavaScript that are in JSON
       * https://github.com/rack/rack-contrib/pull/37
       */
      body = body.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

      // the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
      // https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2014-4671
      // http://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/
      // http://drops.wooyun.org/tips/2554
      body = `/**/ typeof ${jsonpCallbackName} === 'function' && ${jsonpCallbackName}(${body});`
    }

    /**
     * Compute content length
     */
    this.header('Content-Length', Buffer.byteLength(body))
    this.endResponse(body)
  }

  /**
   * Stream the body to the response and handles cleaning up the stream
   */
  private streamBody (body: ResponseStream, errorCallback?: ((error: NodeJS.ErrnoException) => any)) {
    return new Promise((resolve) => {
      let finished = false

      /**
       * Listen for errors on the stream and properly destroy
       * stream
       */
      body.on('error', (error: NodeJS.ErrnoException) => {
        /* istanbul ignore if */
        if (finished) {
          return
        }

        finished = true
        destroy(body)

        if (typeof (errorCallback) === 'function') {
          this.endResponse(errorCallback(error))
        } else {
          this.endResponse(
            error.code === 'ENOENT' ? 'File not found' : 'Cannot process file',
            error.code === 'ENOENT' ? 404 : 500,
          )
          resolve()
        }
      })

      /**
       * Listen for end and resolve the promise
       */
      body.on('end', resolve)

      /**
       * Cleanup stream when finishing response
       */
      onFinished(this.response, () => {
        finished = true
        destroy(body)
      })

      /**
       * Pipe stream
       */
      this.flushHeaders()
      body.pipe(this.response)
    })
  }

  /**
   * Downloads a file by streaming it to the response
   */
  private async streamFileForDownload (
    filePath: string,
    generateEtag: boolean,
    errorCallback?: ((error: NodeJS.ErrnoException) => any),
  ) {
    try {
      const stats = await statFn(filePath)
      if (!stats || !stats.isFile()) {
        throw new Error('response.download only accepts path to a file')
      }

      /**
       * Set appropriate headers
       */
      this.header('Last-Modified', stats.mtime.toUTCString())
      this.type(extname(filePath))

      /**
       * Set the etag when instructed.
       */
      if (generateEtag) {
        this.setEtag(stats, true)
      }

      /**
       * Do not stream files for HEAD request, but set the appropriate
       * status code.
       *
       * 200: When not using etags or cache is not fresh. This forces browser
       *      to always make a GET request
       *
       * 304: When etags are used and cache is fresh
       */
      if (this.request.method === 'HEAD') {
        this.endResponse(null, generateEtag && this.fresh() ? 304 : 200)
        return
      }

      /**
       * Regardless of request method, if we are using etags and
       * cache is fresh, then we must respond with 304
       */
      if (generateEtag && this.fresh()) {
        this.endResponse(null, 304)
        return
      }

      /**
       * Fix for https://tools.ietf.org/html/rfc7232#section-4.1. It is
       * recommended to ignore headers other than Cache-Control,
       * Content-Location, Date, ETag, Expires, and Vary.
       */
      this.header('Content-length', stats.size)

      /**
       * Finally stream the file
       */
      return this.streamBody(createReadStream(filePath), errorCallback)
    } catch (error) {
      if (typeof (errorCallback) === 'function') {
        this.endResponse(errorCallback(error))
      } else {
        this.endResponse('Cannot process file', 404)
      }
    }
  }

  /**
   * Ends the response by flushing headers and writing body
   */
  private endResponse (body?: any, statusCode?: number) {
    this.flushHeaders(statusCode)

    // avoid ArgumentsAdaptorTrampoline from V8 (inspired by fastify)
    const res = this.response as any
    res.end(body, null, null)
  }

  /**
   * Writes headers to the response.
   */
  public flushHeaders (statusCode?: number): this {
    this.response.writeHead(statusCode || this.response.statusCode, this.headers)
    this.headers = {}

    return this
  }

  /**
   * Returns the existing value for a given HTTP response
   * header.
   */
  public getHeader (key: string) {
    const value = this.headers[key.toLowerCase()]
    return value === undefined ? this.response.getHeader(key) : value
  }

  /**
   * Set header on the response. To `append` values to the existing header, we suggest
   * using [[append]] method.
   *
   * If `value` is non existy, then header won't be set.
   *
   * @example
   * ```js
   * response.header('content-type', 'application/json')
   * ```
   */
  public header (key: string, value: CastableHeader): this {
    if (value) {
      this.headers[key.toLowerCase()] = this.castHeaderValue(value)
    }
    return this
  }

  /**
   * Append value to an existing header. To replace the value, we suggest using
   * [[header]] method.
   *
   * If `value` is not existy, then header won't be set.
   *
   * @example
   * ```js
   * response.append('set-cookie', 'username=virk')
   * ```
   */
  public append (key: string, value: CastableHeader): this {
    /* istanbul ignore if */
    if (!value) {
      return this
    }

    key = key.toLowerCase()

    let existingHeader = this.getHeader(key)
    let casted = this.castHeaderValue(value)

    /**
     * If there isn't any header, then setHeader right
     * away
     */
    if (!existingHeader) {
      this.headers[key] = casted
      return this
    }

    existingHeader = this.castHeaderValue(existingHeader)
    casted = Array.isArray(existingHeader) ? existingHeader.concat(casted) : [existingHeader].concat(casted)

    this.headers[key] = casted
    return this
  }

  /**
   * Adds HTTP response header, when it doesn't exists already.
   */
  public safeHeader (key: string, value: CastableHeader): this {
    if (!this.getHeader(key)) {
      this.header(key, value)
    }
    return this
  }

  /**
   * Removes the existing response header from being sent.
   */
  public removeHeader (key: string): this {
    delete this.headers[key.toLowerCase()]
    return this
  }

  /**
   * Set HTTP status code
   */
  public status (code: number): this {
    this.explicitStatus = true
    this.response.statusCode = code
    return this
  }

  /**
   * Set's status code only when it's not explictly
   * set
   */
  public safeStatus (code: number): this {
    if (this.explicitStatus) {
      return this
    }

    this.response.statusCode = code
    return this
  }

  /**
   * Set response type by looking up for the mime-type using
   * partial types like file extensions.
   *
   * Make sure to read [mime-types](https://www.npmjs.com/package/mime-types) docs
   * too.
   *
   * @example
   * ```js
   * response.type('.json') // Content-type: application/json
   * ```
   */
  public type (type: string, charset?: string): this {
    type = charset ? `${type}; charset=${charset}` : type
    this.header('Content-Type', mime.contentType(type))

    return this
  }

  /**
   * Set the Vary HTTP header
   */
  public vary (field: string): this {
    vary(this.response, field)
    return this
  }

  /**
   * Set etag by computing hash from the body. This class will set the etag automatically
   * when `etag = true` in the defined config object.
   *
   * Use this function, when you want to compute etag manually for some other resons.
   */
  public setEtag (body: any, weak: boolean = false) : this {
    this.header('Etag', etag(body, { weak }))
    return this
  }

  /**
   * Returns a boolean telling if the new response etag evaluates same
   * as the request header `if-none-match`. In case of `true`, the
   * server must return `304` response, telling the browser to
   * use the client cache.
   *
   * You won't have to deal with this method directly, since AdonisJs will
   * handle this for you when `http.etag = true` inside `config/app.js` file.
   *
   * However, this is how you can use it manually.
   *
   * @example
   * ```js
   * const responseBody = view.render('some-view')
   *
   * // sets the HTTP etag header for response
   * response.setEtag(responseBody)
   *
   * if (response.fresh()) {
   *   response.sendStatus(304)
   * } else {
   *   response.send(responseBody)
   * }
   * ```
   */
  public fresh (): boolean {
    if (this.request.method && ['GET', 'HEAD'].indexOf(this.request.method) === -1) {
      return false
    }

    const status = this.response.statusCode
    if ((status >= 200 && status < 300) || status === 304) {
      return fresh(this.request.headers, this.headers)
    }

    return false
  }

  /**
   * Builds the response body and returns it's appropriate type
   * to be set as the content-type header.
   *
   * Ideally, you should use [[send]] vs using this method. This method will
   * not set any headers and must be used when you want more control over the
   * response sending process.
   *
   * Make sure to appropriately handle the case of `unknown` type, which is returned
   * when unable to parse the body type.
   */
  public buildResponseBody (body: any): { body: any, type: ResponseContentType, originalType?: string } {
    if (body === null || body === undefined) {
      return {
        body: null,
        type: 'null',
      }
    }

    /**
     * Set type to `text/html` or `text/plain` when body is a
     * plain string
     */
    if (typeof (body) === 'string') {
      return body.length === 0
        ? {
          body: null,
          type: 'null',
        }
        : {
          body,
          type: /^\s*</.test(body) ? 'text/html' : 'text/plain',
        }
    }

    /**
     * Buffer sets the body as `application/octet-stream`
     */
    if (Buffer.isBuffer(body)) {
      return {
        body,
        type: 'application/octet-stream',
      }
    }

    /**
     * Cast boolean and numbers to string.
     */
    if (typeof (body) === 'number' || typeof (body) === 'boolean') {
      return {
        body: String(body),
        type: 'text/plain',
      }
    }

    /**
     * Cast objects as string by `JSON.stringify`.
     */
    if (typeof (body) === 'object') {
      return {
        body: JSON.stringify(body),
        type: 'application/json',
      }
    }

    /**
     * Unknown body type.
     */
    return {
      body,
      originalType: typeof (body),
      type: 'unknown',
    }
  }

  /**
   * Send the body as response and optionally generate etag. The default value
   * is read from `config/app.js` file, using `http.etag` property.
   *
   * This method buffers the body if `explicitEnd = true`, which is the default
   * behavior and do not change, unless you know what you are doing.
   */
  public send (body: any, generateEtag: boolean = this.config.etag): void {
    this.lazyBody = {
      writer: this.writeBody,
      args: [body, generateEtag],
    }
  }

  /**
   * Alias of [[send]]
   */
  public json (body: any, generateEtag?: boolean): void {
    return this.send(body, generateEtag)
  }

  /**
   * Writes response as JSONP. The callback name is resolved as follows, with priority
   * from top to bottom.
   *
   * 1. Explicitly defined as 2nd Param.
   * 2. Fetch from request query string.
   * 3. Use the config value `http.jsonpCallbackName` from `config/app.js`.
   * 4. Fallback to `callback`.
   *
   * This method buffers the body if `explicitEnd = true`, which is the default
   * behavior and do not change, unless you know what you are doing.
   */
  public jsonp (
    body: any,
    callbackName: string = this.config.jsonpCallbackName,
    generateEtag: boolean = this.config.etag,
  ) {
    this.lazyBody = {
      writer: this.writeBody,
      args: [body, generateEtag, callbackName],
    }
  }

  /**
   * Pipe stream to the response. This method will gracefully destroy
   * the stream, avoiding memory leaks.
   *
   * If `raiseErrors=false`, then this method will self handle all the exceptions by
   * writing a generic HTTP response. To have more control over the error, it is
   * recommended to set `raiseErrors=true` and wrap this function inside a
   * `try/catch` statement.
   *
   * Streaming a file from the disk and showing 404 when file is missing.
   *
   * @example
   * ```js
   * // Errors handled automatically with generic HTTP response
   * response.stream(fs.createReadStream('file.txt'))
   *
   * // Manually handle (note the await call)
   * try {
   *   await response.stream(fs.createReadStream('file.txt'))
   * } catch () {
   *   response.status(404).send('File not found')
   * }
   * ```
   */
  public stream (body: ResponseStream, errorCallback?: ((error: NodeJS.ErrnoException) => any)): void {
    if (typeof (body.pipe) !== 'function' || !body.readable || typeof (body.read) !== 'function') {
      throw new Error('response.stream accepts a readable stream only')
    }

    this.lazyBody = {
      writer: this.streamBody,
      args: [body, errorCallback],
    }
  }

  /**
   * Download file by streaming it from the file path. This method will setup
   * appropriate `Content-type`, `Content-type` and `Last-modified` headers.
   *
   * Unexpected stream errors are handled gracefully to avoid memory leaks.
   *
   * If `raiseErrors=false`, then this method will self handle all the exceptions by
   * writing a generic HTTP response. To have more control over the error, it is
   * recommended to set `raiseErrors=true` and wrap this function inside a
   * `try/catch` statement.
   *
   * @example
   * ```js
   * // Errors handled automatically with generic HTTP response
   * response.download('somefile.jpg')
   *
   * // Manually handle (note the await call)
   * try {
   *   await response.download('somefile.jpg')
   * } catch (error) {
   *   response.status(error.code === 'ENOENT' ? 404 : 500)
   *   response.send('Cannot process file')
   * }
   * ```
   */
  public download (
    filePath: string,
    generateEtag: boolean = this.config.etag,
    errorCallback?: ((error: NodeJS.ErrnoException) => any),
  ): void {
    this.lazyBody = {
      writer: this.streamFileForDownload,
      args: [filePath, generateEtag, errorCallback],
    }
  }

  /**
   * Download the file by forcing the user to save the file vs displaying it
   * within the browser.
   *
   * Internally calls [[download]]
   */
  public attachment (
    filePath: string,
    name?: string,
    disposition?: string,
    generateEtag?: boolean,
    errorCallback?: ((error: NodeJS.ErrnoException) => any),
  ) {
    name = name || filePath
    this.header('Content-Disposition', contentDisposition(name, { type: disposition }))
    return this.download(filePath, generateEtag, errorCallback)
  }

  /**
   * Set the location header.
   *
   * @example
   * ```js
   * response.location('/login')
   * ```
   */
  public location (url: string): this {
    this.header('Location', url)
    return this
  }

  /**
   * Redirect request to a different URL. Current request `query string` can be forwared
   * by setting 2nd param to `true`.
   */
  public redirect (
    url: string,
    sendQueryParams?: boolean,
    statusCode: number = 302,
  ): void {
    url = url === 'back'
      ? (this.request.headers['referer'] || this.request.headers['referrer'] || '/') as string
      : url

    url = sendQueryParams ? `${url}?${parse(this.request.url!, false).query}` : url
    this.location(encodeurl(url))
    this.safeStatus(statusCode || 302)
    this.type('text/plain; charset=utf-8')
    this.send(`Redirecting to ${url}`)
  }

  /**
   * Abort the request with custom body and a status code. 400 is
   * used when status is not defined
   */
  public abort (body: any, status?: number): void {
    throw HttpException.invoke(body, status || 400)
  }

  /**
   * Abort the request with custom body and a status code when
   * passed condition returns `true`
   */
  public abortIf (condition: any, body: any, status?: number): void {
    if (condition) {
      this.abort(body, status)
    }
  }

  /**
   * Set signed cookie as the response header. The inline options overrides
   * all options from the config (means they are not merged).
   */
  public cookie (key: string, value: any, options?: Partial<CookieOptions>): this {
    options = Object.assign({}, this.config.cookie, options)

    const serialized = serialize(key, value, this.config.secret, options)
    if (!serialized) {
      return this
    }

    this.append('set-cookie', serialized)
    return this
  }

  /**
   * Set unsigned cookie as the response header. The inline options overrides
   * all options from the config (means they are not merged)
   */
  public plainCookie (key: string, value: any, options?: Partial<CookieOptions>): this {
    options = Object.assign({}, this.config.cookie, options)

    const serialized = serialize(key, value, undefined, options)
    if (!serialized) {
      return this
    }

    this.append('set-cookie', serialized)
    return this
  }

  /**
   * Clear existing cookie.
   */
  public clearCookie (key: string, options?: Partial<CookieOptions>): this {
    options = Object.assign({}, this.config.cookie, options)
    options.expires = new Date(1)

    const serialized = serialize(key, '', undefined, options)
    if (!serialized) {
      return this
    }

    this.append('set-cookie', serialized)
    return this
  }

  /**
   * Finishes the response by writing the lazy body, when `explicitEnd = true`
   * and response is already pending.
   *
   * Calling this method twice or when `explicitEnd = false` is noop.
   */
  public finish () {
    if (this.lazyBody && this.isPending) {
      this.lazyBody.writer.bind(this)(...this.lazyBody.args)
      this.lazyBody = null
    } else if (this.isPending) {
      this.endResponse()
    }
  }
}
