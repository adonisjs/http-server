/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Request' {
  import { UrlWithStringQuery } from 'url'
  import { MacroableConstructorContract } from 'macroable'
  import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
  import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
  import { IncomingHttpHeaders, IncomingMessage, ServerResponse } from 'http'

  /**
   * Shape of the request class instance
   */
  export interface RequestContract {
    /**
     * Parses copy of the URL with query string as a string and not
     * object. This is done to build URL's with query string without
     * stringifying the object
     */
    parsedUrl: UrlWithStringQuery

    request: IncomingMessage
    response: ServerResponse

    /**
     * The ctx will be set by the context itself. It creates a circular
     * reference
     */
    ctx?: HttpContextContract

    /**
     * Returns the request id from the `x-request-id` header. The
     * header is untoched, if it already exists.
     */
    id(): string | undefined

    /**
     * Set initial request body. A copy of the input will be maintained as the original
     * request body. Since the request body and query string is subject to mutations, we
     * keep one original reference to flash old data (whenever required).
     *
     * This method is supposed to be invoked by the body parser and must be called only
     * once. For further mutations make use of `updateBody` method.
     */
    setInitialBody(body: Record<string, any>): void

    /**
     * Update the request body with new data object. The `all` property
     * will be re-computed by merging the query string and request
     * body.
     */
    updateBody(body: Record<string, any>): void

    /**
     * Update the request raw body. Bodyparser sets this when unable to parse
     * the request body or when request is multipart/form-data.
     */
    updateRawBody(body: string): void

    /**
     * Update route params
     */
    updateParams(body: Record<string, any>): void

    /**
     * Update the query string with the new data object. The `all` property
     * will be re-computed by merging the query and the request body.
     */
    updateQs(data: Record<string, any>): void

    /**
     * Returns route params
     */
    params(): Record<string, any>

    /**
     * Returns reference to the query string object
     * @deprecated: Use ".qs()" instead
     */
    get(): Record<string, any>

    /**
     * Returns the query string object by reference
     */
    qs(): Record<string, any>

    /**
     * Returns the request body object by reference
     * @deprecated: Use ".body()" instead
     */
    post(): Record<string, any>

    /**
     * Returns the request body object by reference
     */
    body(): Record<string, any>

    /**
     * Returns reference to the merged copy of original request
     * query string and body
     */
    original(): Record<string, any>

    /**
     * Returns reference to the merged copy of request body
     * and query string
     */
    all(): Record<string, any>

    /**
     * Returns the request raw body (if exists), or returns `null`.
     *
     * Ideally you must be dealing with the parsed body accessed using [[input]], [[all]] or
     * [[post]] methods. The `raw` body is always a string.
     */
    raw(): string | null

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
    input(key: string, defaultValue?: any): any

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
    param(key: string, defaultValue?: any): any

    /**
     * Get everything from the request body except the given keys.
     *
     * @example
     * ```js
     * request.except(['_csrf'])
     * ```
     */
    except(keys: string[]): Record<string, any>

    /**
     * Get value for specified keys.
     *
     * @example
     * ```js
     * request.only(['username', 'age'])
     * ```
     */
    only<T extends string>(keys: T[]): { [K in T]: any }

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
    method(): string

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
    intended(): string

    /**
     * Returns a copy of headers as an object
     */
    headers(): IncomingHttpHeaders

    /**
     * Returns value for a given header key. The default value is
     * used when original value is `undefined`.
     */
    header(key: string, defaultValue?: any): string | undefined

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
    ip(): string

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
    ips(): string[]

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
    protocol(): string

    /**
     * Returns a boolean telling if request is served over `https`
     * or not. Check [[protocol]] method to know how protocol is
     * fetched.
     */
    secure(): boolean

    /**
     * Returns an array of subdomains for the given host. An empty array is
     * returned if [[hostname]] is `null` or is an IP address.
     *
     * Also `www` is not considered as a subdomain
     */
    subdomains(): string[]

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
    host(): string | null

    /**
     * Returns the request hostname. The hostname value does not include the
     * port.
     */
    hostname(): string | null

    /**
     * Returns a boolean telling, if request `X-Requested-With === 'xmlhttprequest'`
     * or not.
     */
    ajax(): boolean

    /**
     * Returns a boolean telling, if request has `X-Pjax` header
     * set or not
     */
    pjax(): boolean

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
    url(includeQueryString?: boolean): string

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
    completeUrl(includeQueryString?: boolean): string

    /**
     * Find if the current HTTP request is for the given route or the routes
     */
    matchesRoute(routeIdentifier: string | string[]): boolean

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
    is(types: string[]): string | null

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
    accepts<T extends string>(types: T[]): T | null

    /**
     * Return the types that the request accepts, in the order of the
     * client's preference (most preferred first).
     *
     * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
     * docs too.
     */
    types(): string[]

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
    language<T extends string>(languages: T[]): T | null

    /**
     * Return the languages that the request accepts, in the order of the
     * client's preference (most preferred first).
     *
     * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
     * docs too.
     */
    languages(): string[]

    /**
     * Returns the best encoding using `Accept-encoding` header
     * and by matching it against the given encodings.
     *
     * If nothing is matched, then `null` will be returned
     *
     * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
     * docs too.
     */
    encoding<T extends string>(encodings: T[]): T | null

    /**
     * Return the charsets that the request accepts, in the order of the
     * client's preference (most preferred first).
     *
     * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
     * docs too.
     */
    encodings(): string[]

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
    charset<T extends string>(charsets: T[]): T | null

    /**
     * Return the charsets that the request accepts, in the order of the
     * client's preference (most preferred first).
     *
     * Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
     * docs too.
     */
    charsets(): string[]

    /**
     * Returns a boolean telling if request has body
     */
    hasBody(): boolean

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
     * if (request.fresh()) {
     *   response.sendStatus(304)
     * } else {
     *   response.send(responseBody)
     * }
     * ```
     */
    fresh(): boolean

    /**
     * Opposite of [[fresh]]
     */
    stale(): boolean

    /**
     * Returns all parsed and signed cookies. Signed cookies ensures
     * that their value isn't tampered.
     */
    cookiesList(): Record<string, any>

    /**
     * Returns value for a given key from signed cookies. Optional
     * defaultValue is returned when actual value is undefined.
     */
    cookie(key: string, defaultValue?: any): any

    /**
     * Returns value for a given key from signed cookies. Optional
     * defaultValue is returned when actual value is undefined.
     */
    encryptedCookie(key: string, defaultValue?: any): any

    /**
     * Returns value for a given key from unsigned cookies. Optional
     * defaultValue is returned when actual value is undefined.
     */
    plainCookie(key: string, defaultValue?: any): any

    /**
     * Returns a boolean telling if a signed url as a valid signature
     * or not.
     */
    hasValidSignature(purpose?: string): boolean

    /**
     * toJSON copy of the request
     */
    toJSON(): any
  }

  /**
   * Shape of the request config
   */
  export type RequestConfig = {
    forceContentNegotiationTo?: string
    subdomainOffset: number
    generateRequestId: boolean
    allowMethodSpoofing: boolean
    getIp?: (request: RequestContract) => string
    trustProxy: (address: string, distance: number) => boolean
    useAsyncLocalStorage?: boolean
  }

  /**
   * Shape of request constructor, we export the constructor for others to
   * add macros to the request class. Since, the instance is passed
   * to the http request cycle
   */
  export interface RequestConstructorContract
    extends MacroableConstructorContract<RequestContract> {
    new (
      request: IncomingMessage,
      response: ServerResponse,
      encryption: EncryptionContract,
      config: RequestConfig
    ): RequestContract
  }

  const Request: RequestConstructorContract
  export default Request
}
