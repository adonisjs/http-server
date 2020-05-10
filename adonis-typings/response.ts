/*
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
  import { MakeUrlOptions } from '@ioc:Adonis/Core/Route'
  import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

  /**
   * Cookie options can that can be set on the response
   */
  export type CookieOptions = {
    domain: string,
    expires: Date | (() => Date),
    httpOnly: boolean,
    maxAge: number | string,
    path: string,
    sameSite: boolean | 'lax' | 'none' | 'strict',
    secure: boolean,
  }

  /**
   * Types from which response header can be casted to a
   * string
   */
  export type CastableHeader = string | number | boolean | string[] | number[] | boolean[]

  /**
   * Content types after processing response body
   */
  export type ResponseContentType =
    'text/html' |
    'text/plain' |
    'application/octet-stream' |
    'application/json' |
    'unknown' |
    'null'

  /**
   * Types of readable stream allowed for HTTP response
   */
  export type ResponseStream = NodeJS.ReadStream | NodeJS.ReadWriteStream | NodeJS.ReadableStream

  /**
   * Lazy body packet
   */
  export type LazyBody = {
    writer: any,
    args: any[],
  }

  /**
   * Main response interface
   */
  export interface ResponseContract {
    hasLazyBody: boolean
    lazyBody: LazyBody | null
    finished: boolean
    headersSent: boolean
    isPending: boolean
    request: IncomingMessage
    response: ServerResponse
    ctx?: HttpContextContract

    getHeader (key: string): string | string[] | number | undefined
    header (key: string, value: CastableHeader): this
    append (key: string, value: CastableHeader): this
    safeHeader (key: string, value: CastableHeader): this
    removeHeader (key: string): this

    status (code: number): this
    safeStatus (code: number): this
    type (type: string, charset?: string): this
    vary (field: string): this
    setEtag (body: any, weak?: boolean): this

    buildResponseBody (body: any): { body: any, type: ResponseContentType, originalType?: string }
    send (body: any, generateEtag?: boolean): void
    json (body: any, generateEtag?: boolean): void
    jsonp (body: any, callbackName?: string, generateEtag?: boolean): void

    stream (
      stream: ResponseStream,
      errorCallback?: ((error: NodeJS.ErrnoException) => any),
    ): void

    download (
      filePath: string,
      generateEtag?: boolean,
      errorCallback?: ((error: NodeJS.ErrnoException) => any),
    ): void

    attachment (
      filePath: string,
      name?: string,
      disposition?: string,
      generateEtag?: boolean,
      errorCallback?: ((error: NodeJS.ErrnoException) => any),
    ): void

    location (url: string): this

    redirect (): RedirectContract
    redirect (path: string, forwardQueryString?: boolean, statusCode?: number): void

    cookie (key: string, value: any, options?: Partial<CookieOptions>): this
    plainCookie (key: string, value: any, options?: Partial<CookieOptions>): this
    encryptedCookie (key: string, value: any, options?: Partial<CookieOptions>): this
    clearCookie (key: string): this

    abort (body: any, status?: number): never
    abortIf (conditional: any, body: any, status?: number): void
    abortUnless (conditional: any, body: any, status?: number): asserts conditional

    finish (): void
    continue (body: any, generateEtag?: boolean): void

    /**
     * Descriptive methods
     */
    switchingProtocols (body: any, generateEtag?: boolean): void
    ok (body: any, generateEtag?: boolean): void
    created (body: any, generateEtag?: boolean): void
    accepted (body: any, generateEtag?: boolean): void
    nonAuthoritativeInformation (body: any, generateEtag?: boolean): void
    noContent (body: any, generateEtag?: boolean): void
    resetContent (body: any, generateEtag?: boolean): void
    partialContent (body: any, generateEtag?: boolean): void
    multipleChoices (body: any, generateEtag?: boolean): void
    movedPermanently (body: any, generateEtag?: boolean): void
    movedTemporarily (body: any, generateEtag?: boolean): void
    seeOther (body: any, generateEtag?: boolean): void
    notModified (body: any, generateEtag?: boolean): void
    useProxy (body: any, generateEtag?: boolean): void
    temporaryRedirect (body: any, generateEtag?: boolean): void
    badRequest (body: any, generateEtag?: boolean): void
    unauthorized (body: any, generateEtag?: boolean): void
    paymentRequired (body: any, generateEtag?: boolean): void
    forbidden (body: any, generateEtag?: boolean): void
    notFound (body: any, generateEtag?: boolean): void
    methodNotAllowed (body: any, generateEtag?: boolean): void
    notAcceptable (body: any, generateEtag?: boolean): void
    proxyAuthenticationRequired (body: any, generateEtag?: boolean): void
    requestTimeout (body: any, generateEtag?: boolean): void
    conflict (body: any, generateEtag?: boolean): void
    gone (body: any, generateEtag?: boolean): void
    lengthRequired (body: any, generateEtag?: boolean): void
    preconditionFailed (body: any, generateEtag?: boolean): void
    requestEntityTooLarge (body: any, generateEtag?: boolean): void
    requestUriTooLong (body: any, generateEtag?: boolean): void
    unsupportedMediaType (body: any, generateEtag?: boolean): void
    requestedRangeNotSatisfiable (body: any, generateEtag?: boolean): void
    expectationFailed (body: any, generateEtag?: boolean): void
    unprocessableEntity (body: any, generateEtag?: boolean): void
    tooManyRequests (body: any, generateEtag?: boolean): void
    internalServerError (body: any, generateEtag?: boolean): void
    notImplemented (body: any, generateEtag?: boolean): void
    badGateway (body: any, generateEtag?: boolean): void
    serviceUnavailable (body: any, generateEtag?: boolean): void
    gatewayTimeout (body: any, generateEtag?: boolean): void
    httpVersionNotSupported (body: any, generateEtag?: boolean): void
  }

  /**
   * Redirect interface
   */
  export interface RedirectContract {
    status (statusCode: number): this
    withQs (): this
    withQs (values: { [key: string]: any }): this
    withQs (name: string, value: any): this

    back (): void
    toRoute (routeIdentifier: string, urlOptions?: MakeUrlOptions, domain?: string): void
    toPath (url: string): void
  }

  /**
   * Config accepted by response the class
   */
  export type ResponseConfig = {
    etag: boolean,
    jsonpCallbackName: string,
    cookie: Partial<CookieOptions>,
  }

  /**
   * Shape of response constructor, we export the constructor for others to
   * add macros to the request class. Since, the instance is passed
   * to the http request cycle
   */
  export interface ResponseConstructorContract extends MacroableConstructorContract<ResponseContract> {
    new (
      request: IncomingMessage,
      response: ServerResponse,
      encryption: EncryptionContract,
      config: ResponseConfig,
    ): ResponseContract
  }

  const Response: ResponseConstructorContract
  export default Response
}
