/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Response' {
  import { ServerResponse, IncomingMessage } from 'http'
  import { MacroableConstructorContract } from 'macroable'
  import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { MakeUrlOptions, RouterContract } from '@ioc:Adonis/Core/Route'

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
   * Types of readable stream allowed for HTTP response
   */
  export type ResponseStream = NodeJS.ReadStream | NodeJS.ReadWriteStream | NodeJS.ReadableStream

  /**
   * Main response interface
   */
  export interface ResponseContract {
    /**
     * Returns a boolean telling if lazy body is already set or not
     */
    hasLazyBody: boolean

    /**
     * Lazy body is used to set the response body. However, do not
     * write it on the socket immediately unless `response.finish`
     * is called.
     *
     * Only works with `explicitEnd=true`, which is set to `false` by default
     */
    lazyBody: any[]

    /**
     * Returns a boolean telling if response is finished or not.
     * Any more attempts to update headers or body will result
     * in raised exceptions.
     */
    finished: boolean

    /**
     * Returns a boolean telling if response headers has been sent or not.
     * Any more attempts to update headers will result in raised
     * exceptions.
     */
    headersSent: boolean

    /**
     * Returns a boolean telling if response headers and body is written
     * or not. When value is `true`, you can feel free to write headers
     * and body.
     */
    isPending: boolean

    request: IncomingMessage
    response: ServerResponse

    /**
     * The ctx will be set by the context itself. It creates a circular
     * reference
     */
    ctx?: HttpContextContract

    /**
     * Writes headers to the response.
     */
    flushHeaders(statusCode?: number): this

    /**
     * Returns the existing value for a given HTTP response
     * header.
     */
    getHeader(key: string): string | string[] | number | undefined

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
    header(key: string, value: CastableHeader): this

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
    append(key: string, value: CastableHeader): this

    /**
     * Adds HTTP response header, when it doesn't exists already.
     */
    safeHeader(key: string, value: CastableHeader): this

    /**
     * Removes the existing response header from being sent.
     */
    removeHeader(key: string): this

    /**
     * Set HTTP status code
     */
    status(code: number): this

    /**
     * Set's status code only when it's not explictly
     * set
     */
    safeStatus(code: number): this

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
    type(type: string, charset?: string): this

    /**
     * Set the Vary HTTP header
     */
    vary(field: string): this

    /**
     * Set etag by computing hash from the body. This class will set the etag automatically
     * when `etag = true` in the defined config object.
     *
     * Use this function, when you want to compute etag manually for some other resons.
     */
    setEtag(body: any, weak?: boolean): this

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
    fresh(): boolean

    /**
     * Send the body as response and optionally generate etag. The default value
     * is read from `config/app.js` file, using `http.etag` property.
     *
     * This method buffers the body if `explicitEnd = true`, which is the default
     * behavior and do not change, unless you know what you are doing.
     */
    send(body: any, generateEtag?: boolean): void

    /**
     * Alias of [[send]]
     */
    json(body: any, generateEtag?: boolean): void

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
    jsonp(body: any, callbackName?: string, generateEtag?: boolean): void

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
    stream(stream: ResponseStream, errorCallback?: (error: NodeJS.ErrnoException) => any): void

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
    download(
      filePath: string,
      generateEtag?: boolean,
      errorCallback?: (error: NodeJS.ErrnoException) => any
    ): void

    /**
     * Download the file by forcing the user to save the file vs displaying it
     * within the browser.
     *
     * Internally calls [[download]]
     */
    attachment(
      filePath: string,
      name?: string,
      disposition?: string,
      generateEtag?: boolean,
      errorCallback?: (error: NodeJS.ErrnoException) => any
    ): void

    /**
     * Set the location header.
     *
     * @example
     * ```js
     * response.location('/login')
     * ```
     */
    location(url: string): this

    /**
     * Redirect the request.
     *
     * @example
     * ```js
     * response.redirect('/foo')
     * response.redirect().toRoute('foo.bar')
     * response.redirect().back()
     * ```
     */
    redirect(): RedirectContract
    redirect(path: string, forwardQueryString?: boolean, statusCode?: number): void

    /**
     * Set signed cookie as the response header. The inline options overrides
     * all options from the config (means they are not merged).
     */
    cookie(key: string, value: any, options?: Partial<CookieOptions>): this

    /**
     * Set unsigned cookie as the response header. The inline options overrides
     * all options from the config (means they are not merged)
     */
    plainCookie(key: string, value: any, options?: Partial<CookieOptions>): this

    /**
     * Set unsigned cookie as the response header. The inline options overrides
     * all options from the config (means they are not merged)
     */
    encryptedCookie(key: string, value: any, options?: Partial<CookieOptions>): this

    /**
     * Clear existing cookie.
     */
    clearCookie(key: string): this

    /**
     * Abort the request with custom body and a status code. 400 is
     * used when status is not defined
     */
    abort(body: any, status?: number): never

    /**
     * Abort the request with custom body and a status code when
     * passed condition returns `true`
     */
    abortIf(conditional: any, body: any, status?: number): void

    /**
     * Abort the request with custom body and a status code when
     * passed condition returns `false`
     */
    abortUnless(conditional: any, body: any, status?: number): asserts conditional

    /**
     * Finishes the response by writing the lazy body, when `explicitEnd = true`
     * and response is already pending.
     *
     * Calling this method twice or when `explicitEnd = false` is noop.
     */
    finish(): void

    continue(): void
    switchingProtocols(): void
    ok(body: any, generateEtag?: boolean): void
    created(body?: any, generateEtag?: boolean): void
    accepted(body: any, generateEtag?: boolean): void
    nonAuthoritativeInformation(body: any, generateEtag?: boolean): void
    noContent(): void
    resetContent(): void
    partialContent(body: any, generateEtag?: boolean): void
    multipleChoices(body?: any, generateEtag?: boolean): void
    movedPermanently(body?: any, generateEtag?: boolean): void
    movedTemporarily(body?: any, generateEtag?: boolean): void
    seeOther(body?: any, generateEtag?: boolean): void
    notModified(body?: any, generateEtag?: boolean): void
    useProxy(body?: any, generateEtag?: boolean): void
    temporaryRedirect(body?: any, generateEtag?: boolean): void
    badRequest(body?: any, generateEtag?: boolean): void
    unauthorized(body?: any, generateEtag?: boolean): void
    paymentRequired(body?: any, generateEtag?: boolean): void
    forbidden(body?: any, generateEtag?: boolean): void
    notFound(body?: any, generateEtag?: boolean): void
    methodNotAllowed(body?: any, generateEtag?: boolean): void
    notAcceptable(body?: any, generateEtag?: boolean): void
    proxyAuthenticationRequired(body?: any, generateEtag?: boolean): void
    requestTimeout(body?: any, generateEtag?: boolean): void
    conflict(body?: any, generateEtag?: boolean): void
    gone(body?: any, generateEtag?: boolean): void
    lengthRequired(body?: any, generateEtag?: boolean): void
    preconditionFailed(body?: any, generateEtag?: boolean): void
    requestEntityTooLarge(body?: any, generateEtag?: boolean): void
    requestUriTooLong(body?: any, generateEtag?: boolean): void
    unsupportedMediaType(body?: any, generateEtag?: boolean): void
    requestedRangeNotSatisfiable(body?: any, generateEtag?: boolean): void
    expectationFailed(body?: any, generateEtag?: boolean): void
    unprocessableEntity(body?: any, generateEtag?: boolean): void
    tooManyRequests(body?: any, generateEtag?: boolean): void
    internalServerError(body?: any, generateEtag?: boolean): void
    notImplemented(body?: any, generateEtag?: boolean): void
    badGateway(body?: any, generateEtag?: boolean): void
    serviceUnavailable(body?: any, generateEtag?: boolean): void
    gatewayTimeout(body?: any, generateEtag?: boolean): void
    httpVersionNotSupported(body?: any, generateEtag?: boolean): void
  }

  /**
   * Redirect interface
   */
  export interface RedirectContract {
    /**
     * Set a custom status code.
     */
    status(statusCode: number): this

    /**
     * Clear existing query string values added using
     * "withQs"
     */
    clearQs(): this

    /**
     * Forward the current QueryString or define one.
     */
    withQs(): this
    withQs(values: { [key: string]: any }): this
    withQs(name: string, value: any): this

    /**
     * Redirect to the previous path.
     */
    back(): void

    /**
     * Redirect the request using a route identifier.
     */
    toRoute(routeIdentifier: string, urlOptions?: MakeUrlOptions, domain?: string): void

    /**
     * Redirect the request using a path.
     */
    toPath(url: string): void
  }

  /**
   * Config accepted by response the class
   */
  export type ResponseConfig = {
    etag: boolean
    jsonpCallbackName: string
    cookie: Partial<CookieOptions>
  }

  /**
   * Shape of response constructor, we export the constructor for others to
   * add macros to the request class. Since, the instance is passed
   * to the http request cycle
   */
  export interface ResponseConstructorContract
    extends MacroableConstructorContract<ResponseContract> {
    new (
      request: IncomingMessage,
      response: ServerResponse,
      encryption: EncryptionContract,
      config: ResponseConfig,
      router: RouterContract
    ): ResponseContract
  }

  const Response: ResponseConstructorContract
  export default Response
}
