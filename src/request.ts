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
import { createId } from '@paralleldrive/cuid2'
import { parse, UrlWithStringQuery } from 'node:url'
import type { Encryption } from '@adonisjs/encryption'
import type { ServerResponse, IncomingMessage, IncomingHttpHeaders } from 'node:http'

import type { Qs } from './qs.js'
import { trustProxy } from './helpers.js'
import { CookieParser } from './cookies/parser.js'
import { RequestConfig } from './types/request.js'
import type { HttpContext } from './http_context/main.js'

/**
 * HTTP Request class exposes the interface to consistently read values
 * related to a given HTTP request. The class is wrapper over
 * [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
 * and has extended API.
 *
 * You can access the original [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
 * using `request.request` property.
 */
export class Request extends Macroable {
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
   * Parses copy of the URL with query string as a string and not
   * object. This is done to build URL's with query string without
   * stringifying the object
   */
  parsedUrl: UrlWithStringQuery

  /**
   * The ctx will be set by the context itself. It creates a circular
   * reference
   */
  ctx?: HttpContext

  constructor(
    public request: IncomingMessage,
    public response: ServerResponse,
    encryption: Encryption,
    config: RequestConfig,
    qsParser: Qs
  ) {
    super()

    this.#qsParser = qsParser
    this.#config = config
    this.#encryption = encryption
    this.parsedUrl = parse(this.request.url!, false)
    this.#parseQueryString()
  }

  /**
   * Parses the query string
   */
  #parseQueryString() {
    if (this.parsedUrl.query) {
      this.updateQs(this.#qsParser.parse(this.parsedUrl.query))
      this.#originalRequestData = { ...this.#requestData }
    }
  }

  /**
   * Initiates the cookie parser lazily
   */
  #initiateCookieParser() {
    if (!this.#cookieParser) {
      this.#cookieParser = new CookieParser(this.header('cookie')!, this.#encryption)
    }
  }

  /**
   * Lazily initiates the `accepts` module to make sure to parse
   * the request headers only when one of the content-negotiation
   * methods are used.
   */
  #initiateAccepts() {
    this.#lazyAccepts = this.#lazyAccepts || accepts(this.request)
  }

  /**
   * Returns the request id from the `x-request-id` header. The
   * header is untouched, if it already exists.
   */
  id(): string | undefined {
    let requestId = this.header('x-request-id')
    if (!requestId && this.#config.generateRequestId) {
      requestId = createId()
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
   */
  setInitialBody(body: Record<string, any>) {
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
   */
  updateBody(body: Record<string, any>) {
    this.#requestBody = body
    this.#requestData = { ...this.#requestBody, ...this.#requestQs }
  }

  /**
   * Update the request raw body. Bodyparser sets this when unable to parse
   * the request body or when request is multipart/form-data.
   */
  updateRawBody(rawBody: string) {
    this.#rawRequestBody = rawBody
  }

  /**
   * Update the query string with the new data object. The `all` property
   * will be re-computed by merging the query and the request body.
   */
  updateQs(data: Record<string, any>) {
    this.#requestQs = data
    this.#requestData = { ...this.#requestBody, ...this.#requestQs }
  }

  /**
   * Returns route params
   */
  params(): Record<string, any> {
    return this.ctx?.params || {}
  }

  /**
   * Returns the query string object by reference
   */
  qs(): Record<string, any> {
    return this.#requestQs
  }

  /**
   * Returns reference to the request body
   */
  body(): Record<string, any> {
    return this.#requestBody
  }

  /**
   * Returns reference to the merged copy of request body
   * and query string
   */
  all(): Record<string, any> {
    return this.#requestData
  }

  /**
   * Returns reference to the merged copy of original request
   * query string and body
   */
  original(): Record<string, any> {
    return this.#originalRequestData
  }

  /**
   * Returns the request raw body (if exists), or returns `null`.
   *
   * Ideally you must be dealing with the parsed body accessed using [[input]], [[all]] or
   * [[post]] methods. The `raw` body is always a string.
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
   */
  method(): string {
    if (this.#config.allowMethodSpoofing && this.intended() === 'POST') {
      return this.input('_method', this.intended()).toUpperCase()
    }
    return this.intended()
  }

  /**
   * Returns a copy of headers as an object
   */
  headers(): IncomingHttpHeaders {
    return this.request.headers
  }

  /**
   * Returns value for a given header key. The default value is
   * used when original value is `undefined`.
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
   */
  ip(): string {
    const ipFn = this.#config.getIp
    if (typeof ipFn === 'function') {
      return ipFn(this)
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
   */
  protocol(): string {
    if ('encrypted' in this.request.socket) {
      return 'https'
    }

    if (!trustProxy(this.request.socket.remoteAddress!, this.#config.trustProxy)) {
      return this.parsedUrl.protocol || 'http'
    }

    const forwardedProtocol = this.header('X-Forwarded-Proto')
    return forwardedProtocol ? forwardedProtocol.split(/\s*,\s*/)[0] : 'http'
  }

  /**
   * Returns a boolean telling if request is served over `https`
   * or not. Check [[protocol]] method to know how protocol is
   * fetched.
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
   */
  ajax(): boolean {
    const xRequestedWith = this.header('X-Requested-With', '')
    return xRequestedWith!.toLowerCase() === 'xmlhttprequest'
  }

  /**
   * Returns a boolean telling, if request has `X-Pjax` header
   * set or not
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
   */
  completeUrl(includeQueryString?: boolean): string {
    const protocol = this.protocol()
    const hostname = this.host()
    return `${protocol}://${hostname}${this.url(includeQueryString)}`
  }

  /**
   * Find if the current HTTP request is for the given route or the routes
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
   */
  encoding<T extends string>(encodings: T[]): T | null {
    this.#initiateAccepts()
    return this.#lazyAccepts.encoding(encodings) || null
  }

  /**
   * Return the charsets that the request accepts, in the order of the
   * client's preference (most preferred first).
   *
   * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
   * docs too.
   */
  encodings(): string[] {
    this.#initiateAccepts()
    return this.#lazyAccepts.encodings()
  }

  /**
   * Returns a boolean telling if request has body
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
   */
  fresh(): boolean {
    if (['GET', 'HEAD'].indexOf(this.intended()) === -1) {
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
   */
  stale(): boolean {
    return !this.fresh()
  }

  /**
   * Returns all parsed and signed cookies. Signed cookies ensures
   * that their value isn't tampered.
   */
  cookiesList() {
    this.#initiateCookieParser()
    return this.#cookieParser!.list()
  }

  /**
   * Returns value for a given key from signed cookies. Optional
   * defaultValue is returned when actual value is undefined.
   */
  cookie(key: string, defaultValue?: string): any {
    this.#initiateCookieParser()
    return this.#cookieParser!.unsign(key) || defaultValue
  }

  /**
   * Returns value for a given key from signed cookies. Optional
   * defaultValue is returned when actual value is undefined.
   */
  encryptedCookie(key: string, defaultValue?: string): any {
    this.#initiateCookieParser()
    return this.#cookieParser!.decrypt(key) || defaultValue
  }

  /**
   * Returns value for a given key from unsigned cookies. Optional
   * defaultValue is returned when actual value is undefined.
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
   * Returns a boolean telling if a signed url as a valid signature
   * or not.
   */
  hasValidSignature(purpose?: string) {
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
   */
  toJSON() {
    return this.serialize()
  }
}
