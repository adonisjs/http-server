/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import fresh from 'fresh'
import typeIs from 'type-is'
import accepts from 'accepts'
import { isIP } from 'node:net'
import is from '@sindresorhus/is'
import proxyaddr from 'proxy-addr'
import { safeEqual } from '@poppinss/utils'
import Macroable from '@poppinss/macroable'
import lodash from '@poppinss/utils/lodash'
import type { Encryption } from '@boringnode/encryption'
import { type ServerResponse, type IncomingMessage, type IncomingHttpHeaders } from 'node:http'

import type { Qs } from './qs.ts'
import { CookieParser } from './cookies/parser.ts'
import { getPreviousUrl } from './helpers.ts'
import { safeDecodeURI, trustProxy } from './utils.ts'
import { type RequestConfig } from './types/request.ts'
import type { HttpContext } from './http_context/main.ts'

/**
 * HTTP Request class exposes the interface to consistently read values
 * related to a given HTTP request. The class is wrapper over
 * [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
 * and has extended API.
 *
 * You can access the original [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
 * using `request.request` property.
 */
export class HttpRequest extends Macroable {
  /**
   * Query string parser
   */
  #qsParser: Qs

  /**
   * Encryption module to verify signed URLs and unsign/decrypt
   * cookies
   */
  #encryption: Encryption

  /**
   * Request config
   */
  #config: RequestConfig

  /**
   * Request body set using `setBody` method
   */
  #requestBody: Record<string, any> = {}

  /**
   * A merged copy of `request body` and `querystring`
   */
  #requestData: Record<string, any> = {}

  /**
   * Original merged copy of `request body` and `querystring`.
   * Further mutation to this object are not allowed
   */
  #originalRequestData: Record<string, any> = {}

  /**
   * Parsed query string
   */
  #requestQs: Record<string, any> = {}

  /**
   * Raw request body as text
   */
  #rawRequestBody?: string

  /**
   * Cached copy of `accepts` fn to do content
   * negotiation.
   */
  #lazyAccepts?: any

  /**
   * Copy of lazily parsed signed and plain cookies.
   */
  #cookieParser?: CookieParser

  /**
   * Parsed URL with query string stored as a string and decode flag
   */
  parsedUrl: {
    /** The pathname portion of the URL */
    pathname: string
    /** The query string portion of the URL */
    query: string
    /** Flag indicating whether parameters should be decoded */
    shouldDecodeParam: boolean
  }

  /**
   * HTTP context reference - creates a circular reference when set by the context
   */
  ctx?: HttpContext

  /**
   * Creates a new Request instance wrapping the native Node.js HTTP request
   * @param request - Native Node.js incoming message instance
   * @param response - Native Node.js server response instance
   * @param encryption - Encryption module for cookie and URL signing
   * @param config - Request configuration options
   * @param qsParser - Query string parser instance
   */
  constructor(
    /** Native Node.js incoming message instance */
    public request: IncomingMessage,
    /** Native Node.js server response instance */
    public response: ServerResponse,
    encryption: Encryption,
    config: RequestConfig,
    qsParser: Qs
  ) {
    super()

    this.#qsParser = qsParser
    this.#config = config
    this.#encryption = encryption
    this.parsedUrl = safeDecodeURI(request.url!, false)
    this.#parseQueryString()
  }

  /**
   * Parses the query string from the parsed URL and updates internal state.
   *
   * This method extracts query parameters from the URL and merges them into
   * the request data object, also creating a frozen copy for original data reference.
   */
  #parseQueryString(): void {
    if (this.parsedUrl.query) {
      this.updateQs(this.#qsParser.parse(this.parsedUrl.query))
      this.#originalRequestData = { ...this.#requestData }
    }
  }

  /**
   * Initiates the cookie parser lazily when first needed.
   *
   * Creates a CookieParser instance with the current request's cookie header
   * and the configured encryption service for handling signed/encrypted cookies.
   */
  #initiateCookieParser(): void {
    if (!this.#cookieParser) {
      this.#cookieParser = new CookieParser(this.header('cookie')!, this.#encryption)
    }
  }

  /**
   * Lazily initiates the `accepts` module for content negotiation.
   *
   * Creates an accepts instance that parses the request headers only when
   * one of the content-negotiation methods (like accepts, acceptsLanguages) are used.
   * This improves performance by avoiding unnecessary header parsing.
   */
  #initiateAccepts(): void {
    this.#lazyAccepts = this.#lazyAccepts || accepts(this.request)
  }

  /**
   * Returns the request ID from the `x-request-id` header.
   *
   * If the header doesn't exist and request ID generation is enabled,
   * a new UUID will be generated and added to the request headers.
   *
   * @example
   * ```ts
   * const requestId = request.id()
   * console.log(requestId) // '550e8400-e29b-41d4-a716-446655440000'
   * ```
   */
  id(): string | undefined {
    let requestId = this.header('x-request-id')
    if (!requestId && this.#config.generateRequestId) {
      requestId = this.#config.createRequestId()
      this.request.headers['x-request-id'] = requestId
    }

    return requestId
  }

  /**
   * Set initial request body. A copy of the input will be maintained as the original
   * request body. Since the request body and query string is subject to mutations, we
   * keep one original reference to flash old data (whenever required).
   *
   * This method is supposed to be invoked by the body parser and must be called only
   * once. For further mutations make use of `updateBody` method.
   * @param body - Parsed request body data
   * @returns {void}
   */
  setInitialBody(body: Record<string, any>): void {
    if (this.#originalRequestData && Object.isFrozen(this.#originalRequestData)) {
      throw new Error('Cannot re-set initial body. Use "request.updateBody" instead')
    }

    this.updateBody(body)

    /*
     * Freeze the original object
     */
    this.#originalRequestData = Object.freeze(lodash.cloneDeep(this.#requestData))
  }

  /**
   * Update the request body with new data object. The `all` property
   * will be re-computed by merging the query string and request
   * body.
   * @param body - New request body data to set
   * @returns {void}
   */
  updateBody(body: Record<string, any>): void {
    this.#requestBody = body
    this.#requestData = { ...this.#requestBody, ...this.#requestQs }
  }

  /**
   * Update the request raw body. Bodyparser sets this when unable to parse
   * the request body or when request is multipart/form-data.
   * @param rawBody - Raw request body as string
   * @returns {void}
   */
  updateRawBody(rawBody: string): void {
    this.#rawRequestBody = rawBody
  }

  /**
   * Update the query string with the new data object. The `all` property
   * will be re-computed by merging the query and the request body.
   * @param data - New query string data to set
   * @returns {void}
   */
  updateQs(data: Record<string, any>): void {
    this.#requestQs = data
    this.#requestData = { ...this.#requestBody, ...this.#requestQs }
  }

  /**
   * Returns route params
   * @returns {Record<string, any>} Object containing route parameters
   */
  params(): Record<string, any> {
    return this.ctx?.params || {}
  }

  /**
   * Returns the query string object by reference
   * @returns {Record<string, any>} Object containing parsed query string parameters
   */
  qs(): Record<string, any> {
    return this.#requestQs
  }

  /**
   * Returns reference to the request body
   * @returns {Record<string, any>} Object containing parsed request body
   */
  body(): Record<string, any> {
    return this.#requestBody
  }

  /**
   * Returns reference to the merged copy of request body
   * and query string
   * @returns {Record<string, any>} Object containing merged request body and query parameters
   */
  all(): Record<string, any> {
    return this.#requestData
  }

  /**
   * Returns reference to the merged copy of original request
   * query string and body
   * @returns {Record<string, any>} Object containing original merged request data
   */
  original(): Record<string, any> {
    return this.#originalRequestData
  }

  /**
   * Returns the request raw body (if exists), or returns `null`.
   *
   * Ideally you must be dealing with the parsed body accessed using [[input]], [[all]] or
   * [[post]] methods. The `raw` body is always a string.
   * @returns {string | null} Raw request body as string or null if not set
   */
  raw(): string | null {
    return this.#rawRequestBody || null
  }

  /**
   * Returns value for a given key from the request body or query string.
   * The `defaultValue` is used when original value is `undefined`.
   *
   * @example
   * ```js
   * request.input('username')
   *
   * // with default value
   * request.input('username', 'virk')
   * ```
   * @param key - Key to lookup in request data
   * @param defaultValue - Default value when key is not found
   * @returns Value from request data or default value
   */
  input(key: string, defaultValue?: any): any {
    return lodash.get(this.#requestData, key, defaultValue)
  }

  /**
   * Returns value for a given key from route params
   *
   * @example
   * ```js
   * request.param('id')
   *
   * // with default value
   * request.param('id', 1)
   * ```
   * @param key - Parameter key to lookup
   * @param defaultValue - Default value when parameter is not found
   * @returns Value from route parameters or default value
   */
  param(key: string, defaultValue?: any): any {
    return lodash.get(this.params(), key, defaultValue)
  }

  /**
   * Get everything from the request body except the given keys.
   *
   * @example
   * ```js
   * request.except(['_csrf'])
   * ```
   * @param keys - Array of keys to exclude from the result
   * @returns {Record<string, any>} Object with all request data except specified keys
   */
  except(keys: string[]): Record<string, any> {
    return lodash.omit(this.#requestData, keys)
  }

  /**
   * Get value for specified keys.
   *
   * @example
   * ```js
   * request.only(['username', 'age'])
   * ```
   * @param keys - Array of keys to include in the result
   * @returns {{ [K in T]: any }} Object with only the specified keys from request data
   */
  only<T extends string>(keys: T[]): { [K in T]: any } {
    return lodash.pick(this.#requestData, keys) as { [K in T]: any }
  }

  /**
   * Returns the HTTP request method. This is the original
   * request method. For spoofed request method, make
   * use of [[method]].
   *
   * @example
   * ```js
   * request.intended()
   * ```
   * @returns {string} Original HTTP method from the request
   */
  intended(): string {
    return this.request.method!
  }

  /**
   * Returns the request HTTP method by taking method spoofing into account.
   *
   * Method spoofing works when all of the following are true.
   *
   * 1. `app.http.allowMethodSpoofing` config value is true.
   * 2. request query string has `_method`.
   * 3. The [[intended]] request method is `POST`.
   *
   * @example
   * ```js
   * request.method()
   * ```
   * @returns {string} HTTP method (potentially spoofed)
   */
  method(): string {
    if (this.#config.allowMethodSpoofing && this.intended() === 'POST') {
      return this.input('_method', this.intended()).toUpperCase()
    }
    return this.intended()
  }

  /**
   * Returns a copy of headers as an object
   * @returns {IncomingHttpHeaders} Object containing all HTTP headers
   */
  headers(): IncomingHttpHeaders {
    return this.request.headers
  }

  /**
   * Returns value for a given header key. The default value is
   * used when original value is `undefined`.
   * @param key - Header name to lookup
   * @param defaultValue - Default value when header is not found
   * @returns {string | undefined} Header value or default value if not found
   */
  header(key: string, defaultValue?: any): string | undefined {
    key = key.toLowerCase()
    const headers = this.headers()

    switch (key) {
      case 'referer':
      case 'referrer':
        return headers.referrer || headers.referer || defaultValue
      default:
        return headers[key] || defaultValue
    }
  }

  /**
   * Returns the ip address of the user. This method is optimize to fetch
   * ip address even when running your AdonisJs app behind a proxy.
   *
   * You can also define your own custom function to compute the ip address by
   * defining `app.http.getIp` as a function inside the config file.
   *
   * ```js
   * {
   *   http: {
   *     getIp (request) {
   *       // I am using nginx as a proxy server and want to trust 'x-real-ip'
   *       return request.header('x-real-ip')
   *     }
   *   }
   * }
   * ```
   *
   * You can control the behavior of trusting the proxy values by defining it
   * inside the `config/app.js` file.
   *
   * ```js
   * {
   *   http: {
   *    trustProxy: '127.0.0.1'
   *   }
   * }
   * ```
   *
   * The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)
   * @returns {string} Client IP address
   */
  ip(): string {
    const ipFn = this.#config.getIp
    if (typeof ipFn === 'function') {
      return ipFn(this, () => proxyaddr(this.request, this.#config.trustProxy))
    }

    return proxyaddr(this.request, this.#config.trustProxy)
  }

  /**
   * Returns an array of ip addresses from most to least trusted one.
   * This method is optimize to fetch ip address even when running
   * your AdonisJs app behind a proxy.
   *
   * You can control the behavior of trusting the proxy values by defining it
   * inside the `config/app.js` file.
   *
   * ```js
   * {
   *   http: {
   *    trustProxy: '127.0.0.1'
   *   }
   * }
   * ```
   *
   * The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)
   * @returns {string[]} Array of IP addresses from most to least trusted
   */
  ips(): string[] {
    return proxyaddr.all(this.request, this.#config.trustProxy)
  }

  /**
   * Returns the request protocol by checking for the URL protocol or
   * `X-Forwarded-Proto` header.
   *
   * If the `trust` is evaluated to `false`, then URL protocol is returned,
   * otherwise `X-Forwarded-Proto` header is used (if exists).
   *
   * You can control the behavior of trusting the proxy values by defining it
   * inside the `config/app.js` file.
   *
   * ```js
   * {
   *   http: {
   *    trustProxy: '127.0.0.1'
   *   }
   * }
   * ```
   *
   * The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)
   * @returns {string} Request protocol ('http' or 'https')
   */
  protocol(): string {
    if ('encrypted' in this.request.socket) {
      return 'https'
    }

    if (trustProxy(this.request.socket.remoteAddress!, this.#config.trustProxy)) {
      const forwardedProtocol = this.header('X-Forwarded-Proto')
      return forwardedProtocol ? forwardedProtocol.split(/\s*,\s*/)[0] : 'http'
    }

    return 'http'
  }

  /**
   * Returns a boolean telling if request is served over `https`
   * or not. Check [[protocol]] method to know how protocol is
   * fetched.
   * @returns {boolean} True if request is served over HTTPS
   */
  secure(): boolean {
    return this.protocol() === 'https'
  }

  /**
   * Returns the request host. If proxy headers are trusted, then
   * `X-Forwarded-Host` is given priority over the `Host` header.
   *
   * You can control the behavior of trusting the proxy values by defining it
   * inside the `config/app.js` file.
   *
   * ```js
   * {
   *   http: {
   *    trustProxy: '127.0.0.1'
   *   }
   * }
   * ```
   *
   * The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)
   * @returns {string | null} Request host or null if not found
   */
  host(): string | null {
    let host = this.header('host')

    /*
     * Use X-Fowarded-Host when we trust the proxy header and it
     * exists
     */
    if (trustProxy(this.request.socket.remoteAddress!, this.#config.trustProxy)) {
      host = this.header('X-Forwarded-Host') || host
    }

    if (!host) {
      return null
    }

    return host
  }

  /**
   * Returns the HTTP/2 `:authority` pseudo-header, falling back to the
   * `Host` header when `:authority` is not present.
   *
   * Use this when you need a protocol-agnostic value for the request's
   * authority (host[:port]) — for example, when validating redirect
   * targets against the current request's origin.
   *
   * Unlike [[host]], this method does not consult `X-Forwarded-Host`
   * and is not affected by the `trustProxy` config, because no proxy
   * convention exists for forwarding the original `:authority`.
   *
   * @returns {string | null} The authority value or null if neither header is present
   */
  authority(): string | null {
    return this.header(':authority') || this.host() || null
  }

  /**
   * Returns the request hostname. If proxy headers are trusted, then
   * `X-Forwarded-Host` is given priority over the `Host` header.
   *
   * You can control the behavior of trusting the proxy values by defining it
   * inside the `config/app.js` file.
   *
   * ```js
   * {
   *   http: {
   *    trustProxy: '127.0.0.1'
   *   }
   * }
   * ```
   *
   * The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)
   * @returns {string | null} Request hostname (without port) or null if not found
   */
  hostname(): string | null {
    const host = this.host()

    if (!host) {
      return null
    }

    /*
     * Support for IPv6
     * https://datatracker.ietf.org/doc/html/rfc3986#section-3.2.2
     * https://github.com/nodejs/node/pull/5314
     */
    const offset = host[0] === '[' ? host.indexOf(']') + 1 : 0
    const index = host.indexOf(':', offset)
    return index !== -1 ? host.substring(0, index) : host
  }

  /**
   * Returns an array of subdomains for the given host. An empty array is
   * returned if [[hostname]] is `null` or is an IP address.
   *
   * Also `www` is not considered as a subdomain
   * @returns {string[]} Array of subdomains (excluding www)
   */
  subdomains(): string[] {
    const hostname = this.hostname()

    /*
     * Return empty array when hostname is missing or it's
     * an IP address
     */
    if (!hostname || isIP(hostname)) {
      return []
    }

    const offset = this.#config.subdomainOffset
    const subdomains = hostname.split('.').reverse().slice(offset)

    /*
     * Remove www from the subdomains list
     */
    if (subdomains[subdomains.length - 1] === 'www') {
      subdomains.splice(subdomains.length - 1, 1)
    }

    return subdomains
  }

  /**
   * Returns a boolean telling, if request `X-Requested-With === 'xmlhttprequest'`
   * or not.
   * @returns {boolean} True if request is an AJAX request
   */
  ajax(): boolean {
    const xRequestedWith = this.header('X-Requested-With', '')
    return xRequestedWith!.toLowerCase() === 'xmlhttprequest'
  }

  /**
   * Returns a boolean telling, if request has `X-Pjax` header
   * set or not
   * @returns {boolean} True if request is a PJAX request
   */
  pjax(): boolean {
    return !!this.header('X-Pjax')
  }

  /**
   * Returns the request relative URL.
   *
   * @example
   * ```js
   * request.url()
   *
   * // include query string
   * request.url(true)
   * ```
   * @param includeQueryString - Whether to include query string in the URL
   * @returns {string} Request pathname, optionally with query string
   */
  url(includeQueryString?: boolean): string {
    const pathname = this.parsedUrl.pathname!
    return includeQueryString && this.parsedUrl.query
      ? `${pathname}?${this.parsedUrl.query}`
      : pathname
  }

  /**
   * Returns the complete HTTP url by combining
   * [[protocol]]://[[hostname]]/[[url]]
   *
   * @example
   * ```js
   * request.completeUrl()
   *
   * // include query string
   * request.completeUrl(true)
   * ```
   * @param includeQueryString - Whether to include query string in the URL
   * @returns {string} Complete URL including protocol and host
   */
  completeUrl(includeQueryString?: boolean): string {
    const protocol = this.protocol()
    const hostname = this.host()
    return `${protocol}://${hostname}${this.url(includeQueryString)}`
  }

  /**
   * Returns the previous URL from the `Referer` header, validated against
   * the request's `Host` header and an optional list of allowed hosts.
   *
   * The referrer is accepted when its host matches the request's `Host`
   * header or is listed in `allowedHosts`. Otherwise the `fallback`
   * value is returned.
   *
   * @param allowedHosts - Array of allowed referrer hosts
   * @param fallback - URL to return when referrer is missing or invalid
   */
  getPreviousUrl(allowedHosts: string[], fallback: string = '/'): string {
    return getPreviousUrl(this, allowedHosts, fallback)
  }

  /**
   * Find if the current HTTP request is for the given route or the routes
   * @param routeIdentifier - Route name, pattern, or handler reference to match
   * @returns {boolean} True if the request matches any of the given route identifiers
   */
  matchesRoute(routeIdentifier: string | string[]): boolean {
    /**
     * The context is missing inside the HTTP server hooks.
     */
    if (!this.ctx || !this.ctx.route) {
      return false
    }

    const route = this.ctx.route

    /**
     * Search the identifier(s) against the route "pattern", "name" and the route handler
     */
    return !!(Array.isArray(routeIdentifier) ? routeIdentifier : [routeIdentifier]).find(
      (identifier) => {
        if (route.pattern === identifier || route.name === identifier) {
          return true
        }

        if (typeof route.handler === 'function') {
          return false
        }

        return route.handler.reference === identifier
      }
    )
  }

  /**
   * Returns the best matching content type of the request by
   * matching against the given types.
   *
   * The content type is picked from the `content-type` header and request
   * must have body.
   *
   * The method response highly depends upon the types array values. Described below:
   *
   * | Type(s) | Return value |
   * |----------|---------------|
   * | ['json'] | json |
   * | ['application/*'] | application/json |
   * | ['vnd+json'] | application/json |
   *
   * @example
   * ```js
   * const bodyType = request.is(['json', 'xml'])
   *
   * if (bodyType === 'json') {
   *  // process JSON
   * }
   *
   * if (bodyType === 'xml') {
   *  // process XML
   * }
   * ```
   * @param types - Array of content types to match against
   * @returns {string | null} Best matching content type or null if no match
   */
  is(types: string[]): string | null {
    return typeIs(this.request, types) || null
  }

  /**
   * Returns the best type using `Accept` header and
   * by matching it against the given types.
   *
   * If nothing is matched, then `null` will be returned
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   *
   * @example
   * ```js
   * switch (request.accepts(['json', 'html'])) {
   *   case 'json':
   *     return response.json(user)
   *   case 'html':
   *     return view.render('user', { user })
   *   default:
   *     // decide yourself
   * }
   * ```
   * @param types - Array of types to match against Accept header
   * @returns {T | null} Best matching accept type or null if no match
   */
  accepts<T extends string>(types: T[]): T | null {
    this.#initiateAccepts()
    return this.#lazyAccepts.type(types) || null
  }

  /**
   * Return the types that the request accepts, in the order of the
   * client's preference (most preferred first).
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   * @returns {string[]} Array of accepted types in preference order
   */
  types(): string[] {
    this.#initiateAccepts()
    return this.#lazyAccepts.types()
  }

  /**
   * Returns the best language using `Accept-language` header
   * and by matching it against the given languages.
   *
   * If nothing is matched, then `null` will be returned
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   *
   * @example
   * ```js
   * switch (request.language(['fr', 'de'])) {
   *   case 'fr':
   *     return view.render('about', { lang: 'fr' })
   *   case 'de':
   *     return view.render('about', { lang: 'de' })
   *   default:
   *     return view.render('about', { lang: 'en' })
   * }
   * ```
   * @param languages - Array of languages to match against Accept-Language header
   * @returns {T | null} Best matching language or null if no match
   */
  language<T extends string>(languages: T[]): T | null {
    this.#initiateAccepts()
    return this.#lazyAccepts.language(languages) || null
  }

  /**
   * Return the languages that the request accepts, in the order of the
   * client's preference (most preferred first).
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   * @returns {string[]} Array of accepted languages in preference order
   */
  languages(): string[] {
    this.#initiateAccepts()
    return this.#lazyAccepts.languages()
  }

  /**
   * Returns the best charset using `Accept-charset` header
   * and by matching it against the given charsets.
   *
   * If nothing is matched, then `null` will be returned
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   *
   * @example
   * ```js
   * switch (request.charset(['utf-8', 'ISO-8859-1'])) {
   *   case 'utf-8':
   *     // make utf-8 friendly response
   *   case 'ISO-8859-1':
   *     // make ISO-8859-1 friendly response
   * }
   * ```
   * @param charsets - Array of charsets to match against Accept-Charset header
   * @returns {T | null} Best matching charset or null if no match
   */
  charset<T extends string>(charsets: T[]): T | null {
    this.#initiateAccepts()
    return this.#lazyAccepts.charset(charsets) || null
  }

  /**
   * Return the charsets that the request accepts, in the order of the
   * client's preference (most preferred first).
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   * @returns {string[]} Array of accepted charsets in preference order
   */
  charsets(): string[] {
    this.#initiateAccepts()
    return this.#lazyAccepts.charsets()
  }

  /**
   * Returns the best encoding using `Accept-encoding` header
   * and by matching it against the given encodings.
   *
   * If nothing is matched, then `null` will be returned
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   * @param encodings - Array of encodings to match against Accept-Encoding header
   * @returns {T | null} Best matching encoding or null if no match
   */
  encoding<T extends string>(encodings: T[]): T | null {
    this.#initiateAccepts()
    return this.#lazyAccepts.encoding(encodings) || null
  }

  /**
   * Return the encodings that the request accepts, in the order of the
   * client's preference (most preferred first).
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   * @returns {string[]} Array of accepted encodings in preference order
   */
  encodings(): string[] {
    this.#initiateAccepts()
    return this.#lazyAccepts.encodings()
  }

  /**
   * Returns a boolean telling if request has body
   * @returns {boolean} True if request contains a body
   */
  hasBody(): boolean {
    return typeIs.hasBody(this.request)
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
   * ```js
   * const responseBody = view.render('some-view')
   *
   * // sets the HTTP etag header for response
   * response.setEtag(responseBody)
   *
   * if (request.fresh()) {
   *   response.sendStatus(304)
   * } else {
   *   response.send(responseBody)
   * }
   * ```
   * @returns {boolean} True if client cache is fresh (should return 304)
   */
  fresh(): boolean {
    if (!['GET', 'HEAD'].includes(this.intended())) {
      return false
    }

    const status = this.response.statusCode
    if ((status >= 200 && status < 300) || status === 304) {
      return fresh(this.headers(), this.response.getHeaders())
    }

    return false
  }

  /**
   * Opposite of [[fresh]]
   * @returns {boolean} True if client cache is stale (should send new response)
   */
  stale(): boolean {
    return !this.fresh()
  }

  /**
   * Returns all parsed and signed cookies. Signed cookies ensures
   * that their value isn't tampered.
   * @returns {{ [key: string]: any }} Object containing all parsed cookies
   */
  cookiesList(): { [key: string]: any } {
    this.#initiateCookieParser()
    return this.#cookieParser!.list()
  }

  /**
   * Returns value for a given key from signed cookies. Optional
   * defaultValue is returned when actual value is undefined.
   * @param key - Cookie name to lookup
   * @param defaultValue - Default value when cookie is not found
   * @returns Cookie value or default value if not found
   */
  cookie(key: string, defaultValue?: string): any {
    this.#initiateCookieParser()
    return this.#cookieParser!.unsign(key) || defaultValue
  }

  /**
   * Returns value for a given key from encrypted cookies. Optional
   * defaultValue is returned when actual value is undefined.
   * @param key - Cookie name to lookup
   * @param defaultValue - Default value when cookie is not found
   * @returns Decrypted cookie value or default value if not found
   */
  encryptedCookie(key: string, defaultValue?: string): any {
    this.#initiateCookieParser()
    return this.#cookieParser!.decrypt(key) || defaultValue
  }

  /**
   * Returns value for a given key from unsigned cookies. Optional
   * defaultValue is returned when actual value is undefined.
   * @param key - Cookie name to lookup
   * @param options - Options object with defaultValue and encoded flag
   * @returns Plain cookie value or default value if not found
   */
  plainCookie(key: string, options?: { defaultValue?: string; encoded?: boolean }): any
  plainCookie(key: string, defaultValue?: string, encoded?: boolean): any
  plainCookie(
    key: string,
    defaultValueOrOptions?: string | { defaultValue?: string; encoded?: boolean },
    encoded?: boolean
  ): any {
    this.#initiateCookieParser()

    if (is.object(defaultValueOrOptions)) {
      return (
        this.#cookieParser!.decode(key, defaultValueOrOptions?.encoded) ||
        defaultValueOrOptions.defaultValue
      )
    }

    return this.#cookieParser!.decode(key, encoded) || defaultValueOrOptions
  }

  /**
   * Returns a boolean telling if a signed url has a valid signature
   * or not.
   * @param purpose - Optional purpose for signature verification
   * @returns {boolean} True if the signed URL has a valid signature
   */
  hasValidSignature(purpose?: string): boolean {
    const { signature, ...rest } = this.qs()
    if (!signature) {
      return false
    }

    /*
     * Return false when signature fails
     */
    const signedUrl = this.#encryption.getMessageVerifier().unsign(signature, purpose)
    if (!signedUrl) {
      return false
    }

    const queryString = this.#qsParser.stringify(rest)

    return queryString
      ? safeEqual(signedUrl, `${this.url()}?${queryString}`)
      : safeEqual(signedUrl, this.url())
  }

  /**
   * Serializes request to JSON format
   * @returns Object representation of the request
   */
  serialize() {
    return {
      id: this.id(),
      url: this.url(),
      query: this.parsedUrl.query,
      body: this.all(),
      params: this.params(),
      headers: this.headers(),
      method: this.method(),
      protocol: this.protocol(),
      cookies: this.cookiesList(),
      hostname: this.hostname(),
      ip: this.ip(),
      subdomains: this.ctx?.subdomains || {},
    }
  }

  /**
   * toJSON copy of the request
   * @returns JSON representation of the request
   */
  toJSON() {
    return this.serialize()
  }
}
