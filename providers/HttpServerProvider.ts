/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { IocContract } from '@adonisjs/fold'

export default class HttpServerProvider {
	constructor(protected container: IocContract) {}

	/**
	 * Register request and response bindings to the container
	 */
	protected registerRequestResponse() {
		this.container.singleton('Adonis/Core/Request', () => {
			return require('../src/Request').Request
		})

		this.container.singleton('Adonis/Core/Response', () => {
			return require('../src/Response').Response
		})
	}

	/**
	 * Registering middleware store to the container
	 */
	protected registerMiddlewareStore() {
		this.container.bind('Adonis/Core/MiddlewareStore', () => {
			return require('../src/MiddlewareStore').MiddlewareStore
		})
	}

	/**
	 * Registering the HTTP context
	 */
	protected registerHTTPContext() {
		this.container.bind('Adonis/Core/HttpContext', () => {
			const { HttpContext } = require('../src/HttpContext')
			HttpContext.app = this.container.use('Adonis/Core/Application')
			return HttpContext
		})
	}

	/**
	 * Register the HTTP server
	 */
	protected registerHttpServer() {
		this.container.singleton('Adonis/Core/Server', () => {
			const { Server } = require('../src/Server')

			const Logger = this.container.use('Adonis/Core/Logger')
			const Profiler = this.container.use('Adonis/Core/Profiler')
			const Config = this.container.use('Adonis/Core/Config')
			const Encryption = this.container.use('Adonis/Core/Encryption')
			return new Server(this.container, Logger, Profiler, Encryption, Config.get('app.http', {}))
		})
	}

	/**
	 * Register the router. The router points to the instance of router used
	 * by the middleware
	 */
	protected registerRouter() {
		this.container.singleton('Adonis/Core/Route', () => {
			return this.container.use('Adonis/Core/Server').router
		})
	}

	/**
	 * Registering all bindings
	 */
	public register() {
		this.registerRequestResponse()
		this.registerMiddlewareStore()
		this.registerHttpServer()
		this.registerHTTPContext()
		this.registerRouter()
	}
}
