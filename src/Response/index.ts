/**
 * @adonisjs/http-server
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
import mime from 'mime-types'
import destroy from 'destroy'
import { extname } from 'path'
import onFinished from 'on-finished'
import { Macroable } from 'macroable'
import { createReadStream } from 'fs'
import contentDisposition from 'content-disposition'
import { ServerResponse, IncomingMessage } from 'http'
import { Exception, interpolate } from '@poppinss/utils'

import {
	CookieOptions,
	CastableHeader,
	ResponseConfig,
	ResponseStream,
	ResponseContract,
	RedirectContract,
} from '@ioc:Adonis/Core/Response'

import { RouterContract } from '@ioc:Adonis/Core/Route'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

import { statFn } from '../helpers'
import { Redirect } from '../Redirect'
import { CookieSerializer } from '../Cookie/Serializer'
import { HttpException } from '../Exceptions/HttpException'
import { E_CANNOT_SERIALIZE_RESPONSE_BODY } from '../../exceptions.json'

class AbortException extends HttpException {
	/**
	 * Handle itself by making the response. This only works when using the
	 * base exception handler shipped by AdonisJs
	 */
	public handle(error: HttpException, ctx: HttpContextContract) {
		ctx.response.status(error.status).send(error.body)
	}
}

/**
 * The response is a wrapper over [ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)
 * streamlining the process of writing response body and automatically setting up appropriate headers.
 */
export class Response extends Macroable implements ResponseContract {
	protected static macros = {}
	protected static getters = {}

	private headers: any = {}
	private explicitStatus = false
	private writerMethod: string = 'endResponse'

	private cookieSerializer = new CookieSerializer(this.encryption)

	/**
	 * Returns a boolean telling if lazy body is already set or not
	 */
	public hasLazyBody: boolean = false

	/**
	 * Lazy body is used to set the response body. However, do not
	 * write it on the socket immediately unless `response.finish`
	 * is called.
	 */
	public lazyBody: any[] = []

	/**
	 * The ctx will be set by the context itself. It creates a circular
	 * reference
	 */
	public ctx?: HttpContextContract

	constructor(
		public request: IncomingMessage,
		public response: ServerResponse,
		private encryption: EncryptionContract,
		private config: ResponseConfig,
		private router: RouterContract
	) {
		super()
	}

	/**
	 * Returns a boolean telling if response is finished or not.
	 * Any more attempts to update headers or body will result
	 * in raised exceptions.
	 */
	public get finished(): boolean {
		return this.response.finished
	}

	/**
	 * Returns a boolean telling if response headers has been sent or not.
	 * Any more attempts to update headers will result in raised
	 * exceptions.
	 */
	public get headersSent(): boolean {
		return this.response.headersSent
	}

	/**
	 * Returns a boolean telling if response headers and body is written
	 * or not. When value is `true`, you can feel free to write headers
	 * and body.
	 */
	public get isPending(): boolean {
		return !this.headersSent && !this.finished
	}

	/**
	 * Normalizes header value to a string or an array of string
	 */
	private castHeaderValue(value: any): string | string[] {
		return Array.isArray(value) ? (value as any).map(String) : String(value)
	}

	/**
	 * Ends the response by flushing headers and writing body
	 */
	private endResponse(body?: any, statusCode?: number) {
		this.flushHeaders(statusCode)

		// avoid ArgumentsAdaptorTrampoline from V8 (inspired by fastify)
		const res = this.response as any
		res.end(body, null, null)
	}

	/**
	 * Returns type for the content body. Only following types are allowed
	 *
	 * - Dates
	 * - Arrays
	 * - Booleans
	 * - Objects
	 * - Strings
	 * - Buffer
	 */
	private getDataType(content: any) {
		const dataType = typeof content
		if (Buffer.isBuffer(content)) {
			return 'buffer'
		}

		if (dataType === 'number' || dataType === 'boolean' || dataType === 'string') {
			return dataType
		}

		if (content instanceof Date) {
			return 'date'
		}

		if (dataType === 'object' && content instanceof RegExp === false) {
			return 'object'
		}

		const error = new Exception(
			interpolate(E_CANNOT_SERIALIZE_RESPONSE_BODY.message, { dataType }),
			E_CANNOT_SERIALIZE_RESPONSE_BODY.status,
			E_CANNOT_SERIALIZE_RESPONSE_BODY.code
		)
		error.help = E_CANNOT_SERIALIZE_RESPONSE_BODY.help.join('\n')
		throw error
	}

	/**
	 * Writes the body with appropriate response headers. Etag header is set
	 * when `generateEtag` is set to `true`.
	 *
	 * Empty body results in `204`.
	 */
	protected writeBody(content: any, generateEtag: boolean, jsonpCallbackName?: string): void {
		if (content === null || content === undefined || content === '') {
			this.safeStatus(204)
		}

		const isEmptyBody = this.response.statusCode === 204
		const isNotModified = this.response.statusCode === 304

		/**
		 * Do not process body when status code is less than 200 or is 204 or 304. As per
		 * https://tools.ietf.org/html/rfc7230#section-3.3.2
		 */
		if (
			isEmptyBody ||
			isNotModified ||
			(this.response.statusCode && this.response.statusCode < 200)
		) {
			this.removeHeader('Content-Type')
			this.removeHeader('Content-Length')
			this.removeHeader('Transfer-Encoding')
			isNotModified ? this.endResponse(content) : this.endResponse()
			return
		}

		/**
		 * Javascript data type for the content. We only handle a subset
		 * of data types. Check [[this.getDataType]] method for more
		 * info
		 */
		const dataType = this.getDataType(content)

		/**
		 * ----------------------------------------
		 * SERIALIZE CONTENT TO A STRING
		 * ----------------------------------------
		 *
		 * Transforming date, number, boolean and object to a string
		 */
		if (dataType === 'number' || dataType === 'boolean') {
			content = String(content)
		} else if (dataType === 'date') {
			content = content.toISOString()
		} else if (dataType === 'object') {
			content = JSON.stringify(content)
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
			/*
			 * replace chars not allowed in JavaScript that are in JSON
			 * https://github.com/rack/rack-contrib/pull/37
			 */
			content = content.replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029')

			// the /**/ is a specific security mitigation for "Rosetta Flash JSONP abuse"
			// https://web.nvd.nist.gov/view/vuln/detail?vulnId=CVE-2014-4671
			// http://miki.it/blog/2014/7/8/abusing-jsonp-with-rosetta-flash/
			// http://drops.wooyun.org/tips/2554
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
		 * 	 to "text/javascript"
		 *
		 * - String are checked for HTML and "text/plain" or "text/html" is set
		 * 	 accordingly.
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
			switch (dataType) {
				case 'string':
					const type = /^\s*</.test(content) ? 'text/html' : 'text/plain'
					this.safeHeader('Content-Type', `${type}; charset=utf-8`)
					break
				case 'number':
				case 'boolean':
				case 'date':
					this.safeHeader('Content-Type', 'text/plain; charset=utf-8')
					break
				case 'buffer':
					this.safeHeader('Content-Type', 'application/octet-stream; charset=utf-8')
					break
				case 'object':
					this.safeHeader('Content-Type', 'application/json; charset=utf-8')
					break
			}
		}

		this.endResponse(content)
	}

	/**
	 * Stream the body to the response and handles cleaning up the stream
	 */
	protected streamBody(
		body: ResponseStream,
		errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
	) {
		return new Promise((resolve) => {
			let finished = false

			/*
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

				this.type('text')
				if (typeof errorCallback === 'function') {
					this.endResponse(...errorCallback(error))
				} else {
					this.endResponse(
						error.code === 'ENOENT' ? 'File not found' : 'Cannot process file',
						error.code === 'ENOENT' ? 404 : 500
					)
					resolve()
				}
			})

			/*
			 * Listen for end and resolve the promise
			 */
			body.on('end', resolve)

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
			this.flushHeaders()
			body.pipe(this.response)
		})
	}

	/**
	 * Downloads a file by streaming it to the response
	 */
	protected async streamFileForDownload(
		filePath: string,
		generateEtag: boolean,
		errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
	) {
		try {
			const stats = await statFn(filePath)
			if (!stats || !stats.isFile()) {
				throw new Exception('response.download only accepts path to a file')
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
				this.endResponse(null, generateEtag && this.fresh() ? 304 : 200)
				return
			}

			/*
			 * Regardless of request method, if we are using etags and
			 * cache is fresh, then we must respond with 304
			 */
			if (generateEtag && this.fresh()) {
				this.endResponse(null, 304)
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

			if (typeof errorCallback === 'function') {
				this.endResponse(...errorCallback(error))
			} else {
				this.endResponse(
					error.code === 'ENOENT' ? 'File not found' : 'Cannot process file',
					error.code === 'ENOENT' ? 404 : 500
				)
			}
		}
	}

	/**
	 * Writes headers to the response.
	 */
	public flushHeaders(statusCode?: number): this {
		this.response.writeHead(statusCode || this.response.statusCode, this.headers)
		return this
	}

	/**
	 * Returns the existing value for a given HTTP response
	 * header.
	 */
	public getHeader(key: string) {
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
	public header(key: string, value: CastableHeader): this {
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
	public append(key: string, value: CastableHeader): this {
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
		casted = Array.isArray(existingHeader)
			? existingHeader.concat(casted)
			: [existingHeader].concat(casted)

		this.headers[key] = casted
		return this
	}

	/**
	 * Adds HTTP response header, when it doesn't exists already.
	 */
	public safeHeader(key: string, value: CastableHeader): this {
		if (!this.getHeader(key)) {
			this.header(key, value)
		}
		return this
	}

	/**
	 * Removes the existing response header from being sent.
	 */
	public removeHeader(key: string): this {
		key = key.toLowerCase()
		if (this.headers[key]) {
			delete this.headers[key.toLowerCase()]
		}
		return this
	}

	/**
	 * Set HTTP status code
	 */
	public status(code: number): this {
		this.explicitStatus = true
		this.response.statusCode = code
		return this
	}

	/**
	 * Set's status code only when it's not explictly
	 * set
	 */
	public safeStatus(code: number): this {
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
	public type(type: string, charset?: string): this {
		type = charset ? `${type}; charset=${charset}` : type
		this.header('Content-Type', mime.contentType(type))

		return this
	}

	/**
	 * Set the Vary HTTP header
	 */
	public vary(field: string): this {
		vary(this.response, field)
		return this
	}

	/**
	 * Set etag by computing hash from the body. This class will set the etag automatically
	 * when `etag = true` in the defined config object.
	 *
	 * Use this function, when you want to compute etag manually for some other resons.
	 */
	public setEtag(body: any, weak: boolean = false): this {
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
	public fresh(): boolean {
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
	 * Send the body as response and optionally generate etag. The default value
	 * is read from `config/app.js` file, using `http.etag` property.
	 *
	 * This method buffers the body if `explicitEnd = true`, which is the default
	 * behavior and do not change, unless you know what you are doing.
	 */
	public send(body: any, generateEtag: boolean = this.config.etag): void {
		this.writerMethod = 'writeBody'
		this.hasLazyBody = true
		this.lazyBody = [body, generateEtag]
	}

	/**
	 * Alias of [[send]]
	 */
	public json(body: any, generateEtag?: boolean): void {
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
	public jsonp(
		body: any,
		callbackName: string = this.config.jsonpCallbackName,
		generateEtag: boolean = this.config.etag
	) {
		this.writerMethod = 'writeBody'
		this.hasLazyBody = true
		this.lazyBody = [body, generateEtag, callbackName]
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
	public stream(
		body: ResponseStream,
		errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
	): void {
		if (typeof body.pipe !== 'function' || !body.readable || typeof body.read !== 'function') {
			throw new Exception('response.stream accepts a readable stream only')
		}

		this.writerMethod = 'streamBody'
		this.hasLazyBody = true
		this.lazyBody = [body, errorCallback]
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
	public download(
		filePath: string,
		generateEtag: boolean = this.config.etag,
		errorCallback?: (error: NodeJS.ErrnoException) => [string, number?]
	): void {
		this.writerMethod = 'streamFileForDownload'
		this.hasLazyBody = true
		this.lazyBody = [filePath, generateEtag, errorCallback]
	}

	/**
	 * Download the file by forcing the user to save the file vs displaying it
	 * within the browser.
	 *
	 * Internally calls [[download]]
	 */
	public attachment(
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
	 * Set the location header.
	 *
	 * @example
	 * ```js
	 * response.location('/login')
	 * ```
	 */
	public location(url: string): this {
		this.header('Location', url)
		return this
	}

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
	public redirect(): RedirectContract
	public redirect(path: string, forwardQueryString?: boolean, statusCode?: number): void
	public redirect(
		path?: string,
		forwardQueryString: boolean = false,
		statusCode: number = 302
	): RedirectContract | void {
		const handler = new Redirect(this.request, this, this.router)

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
	 * Abort the request with custom body and a status code. 400 is
	 * used when status is not defined
	 */
	public abort(body: any, status?: number): never {
		throw AbortException.invoke(body, status || 400)
	}

	/**
	 * Abort the request with custom body and a status code when
	 * passed condition returns `true`
	 */
	public abortIf(condition: any, body: any, status?: number): void {
		if (condition) {
			this.abort(body, status)
		}
	}

	/**
	 * Abort the request with custom body and a status code when
	 * passed condition returns `false`
	 */
	public abortUnless(condition: any, body: any, status?: number): asserts condition {
		if (!condition) {
			this.abort(body, status)
		}
	}

	/**
	 * Set signed cookie as the response header. The inline options overrides
	 * all options from the config (means they are not merged).
	 */
	public cookie(key: string, value: any, options?: Partial<CookieOptions>): this {
		options = Object.assign({}, this.config.cookie, options)

		const serialized = this.cookieSerializer.sign(key, value, options)
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
	public plainCookie(key: string, value: any, options?: Partial<CookieOptions>): this {
		options = Object.assign({}, this.config.cookie, options)

		const serialized = this.cookieSerializer.encode(key, value, options)
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
	public encryptedCookie(key: string, value: any, options?: Partial<CookieOptions>): this {
		options = Object.assign({}, this.config.cookie, options)

		const serialized = this.cookieSerializer.encrypt(key, value, options)
		if (!serialized) {
			return this
		}

		this.append('set-cookie', serialized)
		return this
	}

	/**
	 * Clear existing cookie.
	 */
	public clearCookie(key: string, options?: Partial<CookieOptions>): this {
		options = Object.assign({}, this.config.cookie, options)
		options.expires = new Date(1)
		options.maxAge = -1

		const serialized = this.cookieSerializer.encode(key, '', options)
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
	public finish() {
		if (!this.isPending) {
			return
		}

		this[this.writerMethod](...this.lazyBody)
	}

	public continue(): void {
		this.status(100)
		return this.send(null, false)
	}

	public switchingProtocols(): void {
		this.status(101)
		return this.send(null, false)
	}

	public ok(body: any, generateEtag?: boolean): void {
		this.status(200)
		return this.send(body, generateEtag)
	}

	public created(body?: any, generateEtag?: boolean): void {
		this.status(201)
		return this.send(body, generateEtag)
	}

	public accepted(body: any, generateEtag?: boolean): void {
		this.status(202)
		return this.send(body, generateEtag)
	}

	public nonAuthoritativeInformation(body: any, generateEtag?: boolean): void {
		this.status(203)
		return this.send(body, generateEtag)
	}

	public noContent(): void {
		this.status(204)
		return this.send(null, false)
	}

	public resetContent(): void {
		this.status(205)
		return this.send(null, false)
	}

	public partialContent(body: any, generateEtag?: boolean): void {
		this.status(206)
		return this.send(body, generateEtag)
	}

	public multipleChoices(body?: any, generateEtag?: boolean): void {
		this.status(300)
		return this.send(body, generateEtag)
	}

	public movedPermanently(body?: any, generateEtag?: boolean): void {
		this.status(301)
		return this.send(body, generateEtag)
	}

	public movedTemporarily(body?: any, generateEtag?: boolean): void {
		this.status(302)
		return this.send(body, generateEtag)
	}

	public seeOther(body?: any, generateEtag?: boolean): void {
		this.status(303)
		return this.send(body, generateEtag)
	}

	public notModified(body?: any, generateEtag?: boolean): void {
		this.status(304)
		return this.send(body, generateEtag)
	}

	public useProxy(body?: any, generateEtag?: boolean): void {
		this.status(305)
		return this.send(body, generateEtag)
	}

	public temporaryRedirect(body?: any, generateEtag?: boolean): void {
		this.status(307)
		return this.send(body, generateEtag)
	}

	public badRequest(body?: any, generateEtag?: boolean): void {
		this.status(400)
		return this.send(body, generateEtag)
	}

	public unauthorized(body?: any, generateEtag?: boolean): void {
		this.status(401)
		return this.send(body, generateEtag)
	}

	public paymentRequired(body?: any, generateEtag?: boolean): void {
		this.status(402)
		return this.send(body, generateEtag)
	}

	public forbidden(body?: any, generateEtag?: boolean): void {
		this.status(403)
		return this.send(body, generateEtag)
	}

	public notFound(body?: any, generateEtag?: boolean): void {
		this.status(404)
		return this.send(body, generateEtag)
	}

	public methodNotAllowed(body?: any, generateEtag?: boolean): void {
		this.status(405)
		return this.send(body, generateEtag)
	}

	public notAcceptable(body?: any, generateEtag?: boolean): void {
		this.status(406)
		return this.send(body, generateEtag)
	}

	public proxyAuthenticationRequired(body?: any, generateEtag?: boolean): void {
		this.status(407)
		return this.send(body, generateEtag)
	}

	public requestTimeout(body?: any, generateEtag?: boolean): void {
		this.status(408)
		return this.send(body, generateEtag)
	}

	public conflict(body?: any, generateEtag?: boolean): void {
		this.status(409)
		return this.send(body, generateEtag)
	}

	public gone(body?: any, generateEtag?: boolean): void {
		this.status(410)
		return this.send(body, generateEtag)
	}

	public lengthRequired(body?: any, generateEtag?: boolean): void {
		this.status(411)
		return this.send(body, generateEtag)
	}

	public preconditionFailed(body?: any, generateEtag?: boolean): void {
		this.status(412)
		return this.send(body, generateEtag)
	}

	public requestEntityTooLarge(body?: any, generateEtag?: boolean): void {
		this.status(413)
		return this.send(body, generateEtag)
	}

	public requestUriTooLong(body?: any, generateEtag?: boolean): void {
		this.status(414)
		return this.send(body, generateEtag)
	}

	public unsupportedMediaType(body?: any, generateEtag?: boolean): void {
		this.status(415)
		return this.send(body, generateEtag)
	}

	public requestedRangeNotSatisfiable(body?: any, generateEtag?: boolean): void {
		this.status(416)
		return this.send(body, generateEtag)
	}

	public expectationFailed(body?: any, generateEtag?: boolean): void {
		this.status(417)
		return this.send(body, generateEtag)
	}

	public unprocessableEntity(body?: any, generateEtag?: boolean): void {
		this.status(422)
		return this.send(body, generateEtag)
	}

	public tooManyRequests(body?: any, generateEtag?: boolean): void {
		this.status(429)
		return this.send(body, generateEtag)
	}

	public internalServerError(body?: any, generateEtag?: boolean): void {
		this.status(500)
		return this.send(body, generateEtag)
	}

	public notImplemented(body?: any, generateEtag?: boolean): void {
		this.status(501)
		return this.send(body, generateEtag)
	}

	public badGateway(body?: any, generateEtag?: boolean): void {
		this.status(502)
		return this.send(body, generateEtag)
	}

	public serviceUnavailable(body?: any, generateEtag?: boolean): void {
		this.status(503)
		return this.send(body, generateEtag)
	}

	public gatewayTimeout(body?: any, generateEtag?: boolean): void {
		this.status(504)
		return this.send(body, generateEtag)
	}

	public httpVersionNotSupported(body?: any, generateEtag?: boolean): void {
		this.status(505)
		return this.send(body, generateEtag)
	}
}
