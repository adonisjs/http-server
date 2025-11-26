/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import etag from 'etag'
import vary from 'vary'
import fresh from 'fresh'
import destroy from 'destroy'
import { extname } from 'node:path'
import { Buffer } from 'node:buffer'
import onFinished from 'on-finished'
import { stat } from 'node:fs/promises'
import Macroable from '@poppinss/macroable'
import { createReadStream } from 'node:fs'
import contentDisposition from 'content-disposition'
import { safeStringify } from '@poppinss/utils/json'
import type { Encryption } from '@adonisjs/encryption'
import { RuntimeException } from '@poppinss/utils/exception'
import { type ServerResponse, type IncomingMessage, type OutgoingHttpHeaders } from 'node:http'

import type { Qs } from './qs.ts'
import { mime } from './helpers.ts'
import { Redirect } from './redirect.ts'
import type { Router } from './router/main.ts'
import { E_HTTP_REQUEST_ABORTED } from './errors.ts'
import { ResponseStatus } from './response_status.ts'
import type { HttpContext } from './http_context/main.ts'
import { CookieSerializer } from './cookies/serializer.ts'
import { httpResponseSerializer } from './tracing_channels.ts'
import type {
  CastableHeader,
  CookieOptions,
  ResponseConfig,
  ResponseStream,
} from './types/response.ts'

const CACHEABLE_HTTP_METHODS = ['GET', 'HEAD']

/**
 * The Response class provides a fluent API for constructing HTTP responses.
 *
 * It wraps Node.js ServerResponse and streamlines the process of writing
 * response body, setting headers, handling cookies, redirects, and streaming.
 *
 * @example
 * ```ts
 * response.status(200).json({ message: 'Hello World' })
 * response.redirect('/dashboard')
 * response.download('/path/to/file.pdf')
 * ```
 */
export class Response extends Macroable {
  /**
   * Query string parser instance used for URL manipulation
   */
  #qs: Qs

  /**
   * Collection of outgoing HTTP headers to be sent with the response
   */
  #headers: OutgoingHttpHeaders = {}

  /**
   * Flag indicating whether an explicit status code has been set
   */
  #hasExplicitStatus = false

  /**
   * Cookie serializer instance for handling cookie encryption, signing, and encoding
   */
  #cookieSerializer: CookieSerializer

  /**
   * Router instance used for generating redirect URLs from route definitions
   */
  #router: Router

  /**
   * Configuration object containing response-related settings
   */
  #config: ResponseConfig

  /**
   * Indicates whether the response has any content (body, stream, or file) ready to be sent
   */
  get hasLazyBody(): boolean {
    return !!(this.lazyBody.content || this.lazyBody.fileToStream || this.lazyBody.stream)
  }

  /**
   * Indicates whether the response has non-stream content set
   */
  get hasContent(): boolean {
    return !!this.lazyBody.content
  }

  /**
   * Indicates whether the response body is set as a readable stream
   */
  get hasStream(): boolean {
    return !!this.lazyBody.stream
  }

  /**
   * Indicates whether the response is configured to stream a file
   */
  get hasFileToStream(): boolean {
    return !!this.lazyBody.fileToStream
  }

  /**
   * The response content data
   */
  get content() {
    return this.lazyBody.content
  }

  /**
   * The readable stream instance configured for the response
   */
  get outgoingStream() {
    return this.lazyBody.stream?.[0]
  }

  /**
   * Configuration for file streaming including path and etag generation flag
   */
  get fileToStream() {
    return this.lazyBody.fileToStream
      ? {
          path: this.lazyBody.fileToStream[0],
          generateEtag: this.lazyBody.fileToStream[1],
        }
      : undefined
  }

  /**
   * Lazy body container that holds response content until ready to send.
   * Contains different types of response data: content, stream, or fileToStream.
   */
  lazyBody: Partial<{
    content: [any, boolean, string?]
    stream: [ResponseStream, ((error: NodeJS.ErrnoException) => [string, number?])?]
    fileToStream: [string, boolean, ((error: NodeJS.ErrnoException) => [string, number?])?]
  }> = {}

  /**
   * HTTP context reference (creates circular dependency with HttpContext)
   */
  ctx?: HttpContext

  /**
   * Creates a new Response instance
   *
   * @param request - Node.js IncomingMessage instance
   * @param response - Node.js ServerResponse instance
   * @param encryption - Encryption service for cookie handling
   * @param config - Response configuration settings
   * @param router - Router instance for URL generation
   * @param qs - Query string parser
   */
  constructor(
    public request: IncomingMessage,
    public response: ServerResponse,
    encryption: Encryption,
    config: ResponseConfig,
    router: Router,
    qs: Qs
  ) {
    super()

    this.#qs = qs
    this.#config = config
    this.#router = router
    this.#cookieSerializer = new CookieSerializer(encryption)
  }

  /**
   * Indicates whether the response has been completely sent
   */
  get finished(): boolean {
    return this.response.writableFinished
  }

  /**
   * Indicates whether response headers have been sent to the client
   */
  get headersSent(): boolean {
    return this.response.headersSent
  }

  /**
   * Indicates whether the response is still pending (headers and body can still be modified)
   */
  get isPending(): boolean {
    return !this.headersSent && !this.finished
  }

  /**
   * Normalizes header value to a string or an array of strings
   *
   * @param value - The header value to normalize
   * @returns Normalized header value
   */
  #castHeaderValue(value: any): string | string[] {
    return Array.isArray(value) ? value.map(String) : String(value)
  }

  /**
   * Ends the response by flushing headers and writing body
   *
   * @param body - Optional response body
   * @param statusCode - Optional status code
   */
  #endResponse(body?: any, statusCode?: number) {
    this.writeHead(statusCode)

    // avoid ArgumentsAdaptorTrampoline from V8 (inspired by fastify)
    const res = this.response as any
    res.end(body, null, null)
  }

  /**
   * Determines the data type of the content for serialization
   *
   * Supported types:
   * - Dates
   * - Arrays
   * - Booleans
   * - Objects
   * - Strings
   * - Buffer
   *
   * @param content - The content to analyze
   * @returns The determined data type as string
   */
  #getDataType(content: any) {
    const dataType = typeof content
    if (
      dataType === 'number' ||
      dataType === 'boolean' ||
      dataType === 'string' ||
      dataType === 'bigint'
    ) {
      return dataType
    }

    /**
     * Object
     */
    if (dataType === 'object') {
      if (content instanceof Uint8Array) {
        return 'buffer'
      }

      /**
       * Regular expression
       */
      if (content instanceof RegExp) {
        return 'regexp'
      }

      /**
       * Date instance
       */
      if (content instanceof Date) {
        return 'date'
      }

      return 'object'
    }

    throw new RuntimeException(`Cannot serialize "${dataType}" to HTTP response`)
  }

  /**
   * Writes the response body with appropriate headers and content type detection
   *
   * Automatically sets:
   * - Content-Type based on content analysis
   * - Content-Length header
   * - ETag header (if enabled)
   * - Status code 204 for empty bodies
   *
   * @param content - The response content
   * @param generateEtag - Whether to generate ETag header
   * @param jsonpCallbackName - Optional JSONP callback name
   */
  protected writeBody(content: any, generateEtag: boolean, jsonpCallbackName?: string): void {
    const hasEmptyBody = content === null || content === undefined || content === ''

    /*
     * ----------------------------------------
     * SET X-REQUEST-ID HEADER
     * ----------------------------------------
     */
    this.setRequestId()

    /**
     * Set status to "204" when body is empty. The `safeStatus` method only
     * sets the status when no explicit status has been set already
     */
    if (hasEmptyBody) {
      this.safeStatus(204)
    }

    const statusCode = this.response.statusCode

    /**
     * Do not process body when status code is less than 200 or is 204 or 304. As per
     * https://tools.ietf.org/html/rfc7230#section-3.3.2
     */
    if (
      statusCode &&
      (statusCode < ResponseStatus.Ok ||
        statusCode === ResponseStatus.NoContent ||
        statusCode === ResponseStatus.NotModified)
    ) {
      this.removeHeader('Content-Type')
      this.removeHeader('Content-Length')
      this.removeHeader('Transfer-Encoding')
      this.#endResponse()
      return
    }

    /**
     * Body is empty and status code is not "204", "304" and neither under 200.
     */
    if (hasEmptyBody) {
      this.removeHeader('Content-Length')
      this.#endResponse()
      return
    }

    /**
     * Javascript data type for the content. We only handle a subset
     * of data types. Check [[this.getDataType]] method for more
     * info
     */
    const dataType = this.#getDataType(content)
    let contentType: string

    /**
     * ----------------------------------------
     * SERIALIZE CONTENT TO A STRING
     * ----------------------------------------
     *
     * Transforming date, number, boolean and object to a string and
     * finding their content-type
     */
    switch (dataType) {
      case 'string':
        contentType = (content as string).trimStart().startsWith('<')
          ? 'text/html; charset=utf-8'
          : 'text/plain; charset=utf-8'
        break
      case 'number':
      case 'boolean':
      case 'bigint':
      case 'regexp':
        content = String(content)
        contentType = 'text/plain; charset=utf-8'
        break
      case 'date':
        content = content.toISOString()
        contentType = 'text/plain; charset=utf-8'
        break
      case 'buffer':
        contentType = 'application/octet-stream; charset=utf-8'
        break
      case 'object':
        content = safeStringify(content)
        contentType = 'application/json; charset=utf-8'
        break
    }

    /*
     * ----------------------------------------
     * MORE MODIFICATIONS FOR JSONP BODY
     * ----------------------------------------
     *
     * If JSONP callback exists, then update the body to be a
     * valid JSONP response
     */
    if (jsonpCallbackName) {
      content = content.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')
      content = `/**/ typeof ${jsonpCallbackName} === 'function' && ${jsonpCallbackName}(${content});`
    }

    /*
     * ----------------------------------------
     * FINALY GENERATE AN ETAG
     * ----------------------------------------
     *
     * Generate etag if instructed.
     */
    if (generateEtag) {
      this.setEtag(content)
    }

    /**
     * End response when cache is fresh
     */
    if (generateEtag && this.fresh()) {
      this.removeHeader('Content-Type')
      this.removeHeader('Content-Length')
      this.removeHeader('Transfer-Encoding')
      this.#endResponse(null, ResponseStatus.NotModified)
      return
    }

    /*
     * ----------------------------------------
     * SET CONTENT-LENGTH HEADER
     * ----------------------------------------
     */
    this.header('Content-Length', Buffer.byteLength(content))

    /**
     * ----------------------------------------
     * SET CONTENT-TYPE HEADER
     * ----------------------------------------
     *
     * - If it is a JSONP response, then we always set the content type
     *   to "text/javascript"
     *
     * - String are checked for HTML and "text/plain" or "text/html" is set
     *   accordingly.
     *
     * - "text/plain"  is set for "numbers" and "booleans" and "dates"
     *
     * - "application/octet-stream" is set for buffers
     *
     * - "application/json" is set for objects and arrays
     */
    if (jsonpCallbackName) {
      this.header('X-Content-Type-Options', 'nosniff')
      this.safeHeader('Content-Type', 'text/javascript; charset=utf-8')
    } else {
      this.safeHeader('Content-type', contentType)
    }

    this.#endResponse(content)
  }

  /**
   * Streams the response body and handles error cleanup
   *
   * Manages stream lifecycle including:
   * - Error handling with custom callbacks
   * - Proper stream cleanup to prevent memory leaks
   * - Response finalization
   *
   * @param body - The readable stream to pipe
   * @param errorCallback - Optional custom error handler
   * @returns Promise that resolves when streaming is complete
   */
  protected streamBody(
    body: ResponseStream,
    errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
  ): Promise<void> {
    return new Promise((resolve) => {
      let finished = false

      /*
       * Listen for errors on the stream and properly destroy
       * stream
       */
      body.on('error', (error: NodeJS.ErrnoException) => {
        /* c8 ignore next 3 */
        if (finished) {
          return
        }

        finished = true
        destroy(body)

        this.type('text')

        if (!this.headersSent) {
          if (typeof errorCallback === 'function') {
            this.#endResponse(...errorCallback(error))
          } else {
            this.#endResponse(
              error.code === 'ENOENT' ? 'File not found' : 'Cannot process file',
              error.code === 'ENOENT' ? ResponseStatus.NotFound : ResponseStatus.InternalServerError
            )
          }
        } else {
          this.response.destroy()
        }

        resolve()
      })

      /*
       * Listen for end and resolve the promise
       */
      body.on('end', () => {
        if (!this.headersSent) {
          this.#endResponse()
        }
        resolve()
      })

      /*
       * Cleanup stream when finishing response
       */
      onFinished(this.response, () => {
        finished = true
        destroy(body)
      })

      /*
       * Pipe stream
       */
      this.relayHeaders()
      body.pipe(this.response)
    })
  }

  /**
   * Streams a file for download with proper headers and caching support
   *
   * Sets appropriate headers:
   * - Last-Modified based on file stats
   * - Content-Type based on file extension
   * - Content-Length from file size
   * - ETag (if enabled)
   *
   * Handles HEAD requests and cache validation (304 responses).
   *
   * @param filePath - Path to the file to stream
   * @param generateEtag - Whether to generate ETag header
   * @param errorCallback - Optional custom error handler
   */
  protected async streamFileForDownload(
    filePath: string,
    generateEtag: boolean,
    errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
  ) {
    try {
      const stats = await stat(filePath)
      if (!stats || !stats.isFile()) {
        throw new TypeError('response.download only accepts path to a file')
      }

      /*
       * Set appropriate headers
       */
      this.header('Last-Modified', stats.mtime.toUTCString())
      this.type(extname(filePath))

      /*
       * Set the etag when instructed.
       */
      if (generateEtag) {
        this.setEtag(stats, true)
      }

      /*
       * Do not stream files for HEAD request, but set the appropriate
       * status code.
       *
       * 200: When not using etags or cache is not fresh. This forces browser
       *      to always make a GET request
       *
       * 304: When etags are used and cache is fresh
       */
      if (this.request.method === 'HEAD') {
        this.#endResponse(
          null,
          generateEtag && this.fresh() ? ResponseStatus.NotModified : ResponseStatus.Ok
        )
        return
      }

      /*
       * Regardless of request method, if we are using etags and
       * cache is fresh, then we must respond with 304
       */
      if (generateEtag && this.fresh()) {
        this.#endResponse(null, ResponseStatus.NotModified)
        return
      }

      /*
       * Fix for https://tools.ietf.org/html/rfc7232#section-4.1. It is
       * recommended to ignore headers other than Cache-Control,
       * Content-Location, Date, ETag, Expires, and Vary.
       */
      this.header('Content-length', stats.size)

      /*
       * Finally stream the file
       */
      return this.streamBody(createReadStream(filePath), errorCallback)
    } catch (error) {
      this.type('text')
      this.removeHeader('Etag')

      if (typeof errorCallback === 'function') {
        this.#endResponse(...errorCallback(error))
      } else {
        this.#endResponse(
          error.code === 'ENOENT' ? 'File not found' : 'Cannot process file',
          error.code === 'ENOENT' ? ResponseStatus.NotFound : ResponseStatus.InternalServerError
        )
      }
    }
  }

  /**
   * Registers a callback to be called when the response is finished
   *
   * The callback is executed when the response has been completely sent.
   * Uses the "on-finished" package internally.
   *
   * @param callback - Function to call when response is finished
   */
  onFinish(callback: (err: Error | null, response: ServerResponse) => void) {
    onFinished(this.response, callback)
  }

  /**
   * Transfers all buffered headers to the underlying Node.js response object
   */
  relayHeaders() {
    if (!this.headersSent) {
      for (let key in this.#headers) {
        const value = this.#headers[key]
        if (value) {
          this.response.setHeader(key, value)
        }
      }
    }
  }

  /**
   * Writes the response status code and headers
   *
   * @param statusCode - Optional status code to set
   * @returns The Response instance for chaining
   */
  writeHead(statusCode?: number): this {
    this.response.writeHead(statusCode || this.response.statusCode, this.#headers)
    return this
  }

  /**
   * Gets the value of a response header
   *
   * @param key - Header name
   * @returns The header value
   */
  getHeader(key: string) {
    const value = this.#headers[key.toLowerCase()]
    return value === undefined ? this.response.getHeader(key) : value
  }

  /**
   * Gets all response headers as an object
   *
   * @returns Object containing all headers
   */
  getHeaders() {
    return {
      ...this.response.getHeaders(),
      ...this.#headers,
    }
  }

  /**
   * Sets a response header (replaces existing value)
   *
   * @param key - Header name
   * @param value - Header value (ignored if null/undefined)
   * @returns The Response instance for chaining
   *
   * @example
   * ```ts
   * response.header('Content-Type', 'application/json')
   * ```
   */
  header(key: string, value: CastableHeader): this {
    if (value === null || value === undefined) {
      return this
    }

    this.#headers[key.toLowerCase()] = this.#castHeaderValue(value)
    return this
  }

  /**
   * Appends a value to an existing response header
   *
   * @param key - Header name
   * @param value - Header value to append (ignored if null/undefined)
   * @returns The Response instance for chaining
   *
   * @example
   * ```ts
   * response.append('Set-Cookie', 'session=abc123')
   * ```
   */
  append(key: string, value: CastableHeader): this {
    if (value === null || value === undefined) {
      return this
    }

    key = key.toLowerCase()

    let existingHeader = this.getHeader(key)
    let casted = this.#castHeaderValue(value)

    /**
     * If there isn't any header, then setHeader right
     * away
     */
    if (!existingHeader) {
      this.#headers[key] = casted
      return this
    }

    existingHeader = this.#castHeaderValue(existingHeader)
    casted = Array.isArray(existingHeader)
      ? existingHeader.concat(casted)
      : [existingHeader].concat(casted)

    this.#headers[key] = casted
    return this
  }

  /**
   * Sets a header only if it doesn't already exist
   *
   * @param key - Header name
   * @param value - Header value
   * @returns The Response instance for chaining
   */
  safeHeader(key: string, value: CastableHeader): this {
    if (!this.getHeader(key)) {
      this.header(key, value)
    }
    return this
  }

  /**
   * Removes a response header
   *
   * @param key - Header name to remove
   * @returns The Response instance for chaining
   */
  removeHeader(key: string): this {
    key = key.toLowerCase()

    this.response.removeHeader(key)
    if (this.#headers[key]) {
      delete this.#headers[key.toLowerCase()]
    }

    return this
  }

  /**
   * Gets the current response status code
   *
   * @returns The HTTP status code
   */
  getStatus(): number {
    return this.response.statusCode
  }

  /**
   * Sets the response status code
   *
   * @param code - HTTP status code
   * @returns The Response instance for chaining
   */
  status(code: number): this {
    this.#hasExplicitStatus = true
    this.response.statusCode = code
    return this
  }

  /**
   * Sets the status code only if not explicitly set already
   *
   * @param code - HTTP status code
   * @returns The Response instance for chaining
   */
  safeStatus(code: number): this {
    if (this.#hasExplicitStatus) {
      return this
    }

    this.response.statusCode = code
    return this
  }

  /**
   * Sets the Content-Type header based on mime type lookup
   *
   * @param type - File extension or mime type
   * @param charset - Optional character encoding
   * @returns The Response instance for chaining
   *
   * @example
   * ```ts
   * response.type('.json') // Content-Type: application/json
   * response.type('html', 'utf-8') // Content-Type: text/html; charset=utf-8
   * ```
   */
  type(type: string, charset?: string): this {
    type = charset ? `${type}; charset=${charset}` : type
    this.header('Content-Type', mime.contentType(type))

    return this
  }

  /**
   * Sets the Vary HTTP header for cache control
   *
   * @param field - Header field name(s) to vary on
   * @returns The Response instance for chaining
   */
  vary(field: string | string[]): this {
    vary(this.response, field)
    return this
  }

  /**
   * Sets the ETag header by computing a hash from the response body
   *
   * @param body - The response body to hash
   * @param weak - Whether to generate a weak ETag
   * @returns The Response instance for chaining
   */
  setEtag(body: any, weak: boolean = false): this {
    this.header('Etag', etag(body, { weak }))
    return this
  }

  /**
   * Sets the X-Request-Id header by copying from the incoming request
   *
   * @returns The Response instance for chaining
   */
  setRequestId(): this {
    const requestId = this.request.headers['x-request-id']
    if (requestId) {
      this.header('X-Request-Id', requestId)
    }
    return this
  }

  /**
   * Checks if the response is fresh (client cache is valid)
   *
   * Compares ETags and modified dates between request and response
   * to determine if a 304 Not Modified response should be sent.
   *
   * @returns True if client cache is fresh, false otherwise
   *
   * @example
   * ```ts
   * response.setEtag(content)
   * if (response.fresh()) {
   *   response.status(304).send(null)
   * } else {
   *   response.send(content)
   * }
   * ```
   */
  fresh(): boolean {
    if (this.request.method && !CACHEABLE_HTTP_METHODS.includes(this.request.method)) {
      return false
    }

    const status = this.response.statusCode
    if (
      (status >= ResponseStatus.Ok && status < ResponseStatus.MultipleChoices) ||
      status === ResponseStatus.NotModified
    ) {
      return fresh(this.request.headers, this.#headers)
    }

    return false
  }

  /**
   * Gets the response body content
   *
   * @returns The response body or null if not set or is a stream
   */
  getBody() {
    if (this.lazyBody.content) {
      return this.lazyBody.content[0]
    }

    return null
  }

  /**
   * Sends the response body with optional ETag generation
   *
   * @param body - The response body
   * @param generateEtag - Whether to generate ETag header (defaults to config)
   */
  send(body: any, generateEtag: boolean = this.#config.etag): void {
    this.lazyBody.content = [body, generateEtag]
  }

  /**
   * Sends a JSON response (alias for send)
   *
   * @param body - The response body to serialize as JSON
   * @param generateEtag - Whether to generate ETag header
   */
  json(body: any, generateEtag: boolean = this.#config.etag): void {
    return this.send(body, generateEtag)
  }

  /**
   * Sends a JSONP response with callback wrapping
   *
   * Callback name resolution priority:
   * 1. Explicit callbackName parameter
   * 2. Query string parameter
   * 3. Config value
   * 4. Default "callback"
   *
   * @param body - The response body
   * @param callbackName - JSONP callback function name
   * @param generateEtag - Whether to generate ETag header
   */
  jsonp(
    body: any,
    callbackName: string = this.#config.jsonpCallbackName,
    generateEtag: boolean = this.#config.etag
  ) {
    this.lazyBody.content = [body, generateEtag, callbackName]
  }

  /**
   * Pipes a readable stream to the response with graceful error handling
   *
   * @param body - The readable stream to pipe
   * @param errorCallback - Optional custom error handler
   *
   * @example
   * ```ts
   * // Auto error handling
   * response.stream(fs.createReadStream('file.txt'))
   *
   * // Custom error handling
   * response.stream(stream, (error) => {
   *   return error.code === 'ENOENT' ? ['Not found', 404] : ['Error', 500]
   * })
   * ```
   */
  stream(
    body: ResponseStream,
    errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
  ): void {
    if (typeof body.pipe !== 'function' || !body.readable || typeof body.read !== 'function') {
      throw new TypeError('response.stream accepts a readable stream only')
    }

    this.lazyBody.stream = [body, errorCallback]
  }

  /**
   * Downloads a file by streaming it with appropriate headers
   *
   * Automatically sets:
   * - Content-Type from file extension
   * - Content-Length from file size
   * - Last-Modified from file stats
   * - ETag (if enabled)
   *
   * @param filePath - Path to the file to download
   * @param generateEtag - Whether to generate ETag header
   * @param errorCallback - Optional custom error handler
   *
   * @example
   * ```ts
   * response.download('/path/to/file.pdf')
   * response.download('/images/photo.jpg', true, (err) => ['Custom error', 500])
   * ```
   */
  download(
    filePath: string,
    generateEtag: boolean = this.#config.etag,
    errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
  ): void {
    this.lazyBody.fileToStream = [filePath, generateEtag, errorCallback]
  }

  /**
   * Forces file download by setting Content-Disposition header
   *
   * @param filePath - Path to the file to download
   * @param name - Optional filename for download (defaults to original filename)
   * @param disposition - Content-Disposition type (defaults to 'attachment')
   * @param generateEtag - Whether to generate ETag header
   * @param errorCallback - Optional custom error handler
   */
  attachment(
    filePath: string,
    name?: string,
    disposition?: string,
    generateEtag?: boolean,
    errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
  ) {
    name = name || filePath
    this.header('Content-Disposition', contentDisposition(name, { type: disposition }))
    return this.download(filePath, generateEtag, errorCallback)
  }

  /**
   * Sets the Location header for redirects
   *
   * @param url - The URL to redirect to
   * @returns The Response instance for chaining
   *
   * @example
   * ```ts
   * response.location('/dashboard')
   * ```
   */
  location(url: string): this {
    this.header('Location', url)
    return this
  }

  /**
   * Returns a Redirect instance for fluent API usage
   *
   * Use this overload when you want to use methods like `.toRoute()`, `.back()`,
   * `.withQs()`, or other redirect builder methods.
   *
   * @returns Redirect instance for chaining redirect methods
   *
   * @example
   * ```ts
   * response.redirect().toRoute('users.show', { id: 1 })
   * response.redirect().back()
   * response.redirect().withQs().toPath('/dashboard')
   * ```
   */
  redirect(): Redirect
  /**
   * Performs an immediate redirect to the specified path
   *
   * This overload directly redirects the request with the provided parameters.
   * Use this when you have a simple redirect without needing the fluent API.
   *
   * @param path - The path or URL to redirect to (use 'back' for referrer redirect)
   * @param forwardQueryString - Whether to forward current query string parameters
   * @param statusCode - HTTP status code for redirect (defaults to 302 Found)
   *
   * @example
   * ```ts
   * response.redirect('/dashboard')
   * response.redirect('/users', true, 301) // with query forwarding and 301 status
   * response.redirect('back') // redirect to referrer
   * ```
   */
  redirect(path: string, forwardQueryString?: boolean, statusCode?: number): void
  redirect(
    path?: string,
    forwardQueryString: boolean = false,
    statusCode: number = ResponseStatus.Found
  ): Redirect | void {
    const handler = new Redirect(this.request, this, this.#router, this.#qs)

    if (forwardQueryString) {
      handler.withQs()
    }

    if (path === 'back') {
      return handler.status(statusCode).back()
    }

    if (path) {
      return handler.status(statusCode).toPath(path)
    }

    return handler
  }

  /**
   * Aborts the request with a custom response body and status code
   *
   * @param body - Response body for the aborted request
   * @param status - HTTP status code (defaults to 400)
   * @throws Always throws an HTTP exception
   */
  abort(body: any, status?: number): never {
    throw E_HTTP_REQUEST_ABORTED.invoke(body, status || ResponseStatus.BadRequest)
  }

  /**
   * Conditionally aborts the request if the condition is truthy
   *
   * @param condition - Condition to evaluate
   * @param body - Response body for the aborted request
   * @param status - HTTP status code (defaults to 400)
   */
  abortIf(
    condition: unknown,
    body: any,
    status?: number
  ): asserts condition is undefined | null | false {
    if (condition) {
      this.abort(body, status)
    }
  }

  /**
   * Conditionally aborts the request if the condition is falsy
   *
   * @param condition - Condition to evaluate
   * @param body - Response body for the aborted request
   * @param status - HTTP status code (defaults to 400)
   */
  abortUnless<T>(
    condition: T,
    body: any,
    status?: number
  ): asserts condition is Exclude<T, undefined | null | false> {
    if (!condition) {
      this.abort(body, status)
    }
  }

  /**
   * Sets a signed cookie in the response
   *
   * @param key - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options (overrides config defaults)
   * @returns The Response instance for chaining
   */
  cookie(key: string, value: any, options?: Partial<CookieOptions>): this {
    options = Object.assign({}, this.#config.cookie, options)

    const serialized = this.#cookieSerializer.sign(key, value, options)
    if (!serialized) {
      return this
    }

    this.append('set-cookie', serialized)
    return this
  }

  /**
   * Sets an encrypted cookie in the response
   *
   * @param key - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options (overrides config defaults)
   * @returns The Response instance for chaining
   */
  encryptedCookie(key: string, value: any, options?: Partial<CookieOptions>): this {
    options = Object.assign({}, this.#config.cookie, options)

    const serialized = this.#cookieSerializer.encrypt(key, value, options)
    if (!serialized) {
      return this
    }

    this.append('set-cookie', serialized)
    return this
  }

  /**
   * Sets a plain (unsigned/unencrypted) cookie in the response
   *
   * @param key - Cookie name
   * @param value - Cookie value
   * @param options - Cookie options including encode flag
   * @returns The Response instance for chaining
   */
  plainCookie(
    key: string,
    value: any,
    options?: Partial<CookieOptions & { encode: boolean }>
  ): this {
    options = Object.assign({}, this.#config.cookie, options)

    const serialized = this.#cookieSerializer.encode(key, value, options)
    if (!serialized) {
      return this
    }

    this.append('set-cookie', serialized)
    return this
  }

  /**
   * Clears an existing cookie by setting it to expire
   *
   * @param key - Cookie name to clear
   * @param options - Cookie options (should match original cookie options)
   * @returns The Response instance for chaining
   */
  clearCookie(key: string, options?: Partial<CookieOptions>): this {
    options = Object.assign({}, this.#config.cookie, options)
    options.expires = new Date(1)
    options.maxAge = -1

    const serialized = this.#cookieSerializer.encode(key, '', { ...options, encode: false })
    this.append('set-cookie', serialized!)
    return this
  }

  /**
   * Finalizes and sends the response
   *
   * Writes the buffered body (content, stream, or file) to the client.
   * This method is idempotent - calling it multiple times has no effect.
   */
  finish() {
    if (!this.isPending) {
      return
    }

    if (this.content) {
      httpResponseSerializer.traceSync(this.writeBody, undefined, this, ...this.content)
      return
    }

    if (this.lazyBody.stream) {
      this.streamBody(...this.lazyBody.stream)
      return
    }

    if (this.lazyBody.fileToStream) {
      this.streamFileForDownload(...this.lazyBody.fileToStream)
      return
    }

    this.#endResponse()
  }

  /**
   * Sends a 100 Continue response
   */
  continue(): void {
    this.status(ResponseStatus.Continue)
    return this.send(null, false)
  }

  /**
   * Sends a 101 Switching Protocols response
   */
  switchingProtocols(): void {
    this.status(ResponseStatus.SwitchingProtocols)
    return this.send(null, false)
  }

  /**
   * Sends a 200 OK response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  ok(body: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Ok)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 201 Created response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  created(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Created)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 202 Accepted response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  accepted(body: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Accepted)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 203 Non-Authoritative Information response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  nonAuthoritativeInformation(body: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.NonAuthoritativeInformation)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 204 No Content response
   */
  noContent(): void {
    this.status(ResponseStatus.NoContent)
    return this.send(null, false)
  }

  /**
   * Sends a 205 Reset Content response
   */
  resetContent(): void {
    this.status(ResponseStatus.ResetContent)
    return this.send(null, false)
  }

  /**
   * Sends a 206 Partial Content response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  partialContent(body: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.PartialContent)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 300 Multiple Choices response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  multipleChoices(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.MultipleChoices)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 301 Moved Permanently response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  movedPermanently(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.MovedPermanently)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 302 Found (Moved Temporarily) response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  movedTemporarily(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Found)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 303 See Other response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  seeOther(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.SeeOther)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 304 Not Modified response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  notModified(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.NotModified)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 305 Use Proxy response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  useProxy(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.UseProxy)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 307 Temporary Redirect response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  temporaryRedirect(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.TemporaryRedirect)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 400 Bad Request response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  badRequest(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.BadRequest)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 401 Unauthorized response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  unauthorized(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Unauthorized)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 402 Payment Required response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  paymentRequired(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.PaymentRequired)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 403 Forbidden response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  forbidden(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Forbidden)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 404 Not Found response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  notFound(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.NotFound)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 405 Method Not Allowed response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  methodNotAllowed(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.MethodNotAllowed)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 406 Not Acceptable response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  notAcceptable(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.NotAcceptable)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 407 Proxy Authentication Required response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  proxyAuthenticationRequired(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.ProxyAuthenticationRequired)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 408 Request Timeout response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  requestTimeout(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.RequestTimeout)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 409 Conflict response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  conflict(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Conflict)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 410 Gone response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  gone(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.Gone)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 411 Length Required response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  lengthRequired(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.LengthRequired)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 412 Precondition Failed response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  preconditionFailed(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.PreconditionFailed)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 413 Payload Too Large response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  requestEntityTooLarge(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.PayloadTooLarge)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 414 URI Too Long response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  requestUriTooLong(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.URITooLong)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 415 Unsupported Media Type response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  unsupportedMediaType(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.UnsupportedMediaType)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 416 Range Not Satisfiable response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  requestedRangeNotSatisfiable(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.RangeNotSatisfiable)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 417 Expectation Failed response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  expectationFailed(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.ExpectationFailed)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 422 Unprocessable Entity response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  unprocessableEntity(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.UnprocessableEntity)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 429 Too Many Requests response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  tooManyRequests(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.TooManyRequests)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 500 Internal Server Error response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  internalServerError(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.InternalServerError)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 501 Not Implemented response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  notImplemented(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.NotImplemented)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 502 Bad Gateway response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  badGateway(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.BadGateway)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 503 Service Unavailable response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  serviceUnavailable(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.ServiceUnavailable)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 504 Gateway Timeout response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  gatewayTimeout(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.GatewayTimeout)
    return this.send(body, generateEtag)
  }

  /**
   * Sends a 505 HTTP Version Not Supported response
   *
   * @param body - Response body
   * @param generateEtag - Whether to generate ETag header
   */
  httpVersionNotSupported(body?: any, generateEtag?: boolean): void {
    this.status(ResponseStatus.HTTPVersionNotSupported)
    return this.send(body, generateEtag)
  }
}
