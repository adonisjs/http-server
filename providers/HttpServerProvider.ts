/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { ApplicationContract } from '@ioc:Adonis/Core/Application'

export default class HttpServerProvider {
	constructor(protected application: ApplicationContract) {}

	/**
	 * Register request and response bindings to the container
	 */
	protected registerRequestResponse() {
		this.application.container.singleton('Adonis/Core/Request', () => {
			return require('../src/Request').Request
		})

		this.application.container.singleton('Adonis/Core/Response', () => {
			return require('../src/Response').Response
		})
	}

	/**
	 * Registering middleware store to the container
	 */
	protected registerMiddlewareStore() {
		this.application.container.bind('Adonis/Core/MiddlewareStore', () => {
			return require('../src/MiddlewareStore').MiddlewareStore
		})
	}

	/**
	 * Registering the HTTP context
	 */
	protected registerHTTPContext() {
		this.application.container.bind('Adonis/Core/HttpContext', () => {
			const { HttpContext } = require('../src/HttpContext')
			HttpContext.app = this.application.container.use('Adonis/Core/Application')
			return HttpContext
		})
	}

	/**
	 * Register the HTTP server
	 */
	protected registerHttpServer() {
		this.application.container.singleton('Adonis/Core/Server', () => {
			const { Server } = require('../src/Server')

			const Config = this.application.container.use('Adonis/Core/Config')
			const Encryption = this.application.container.use('Adonis/Core/Encryption')
			return new Server(this.application, Encryption, Config.get('app.http', {}))
		})
	}

	/**
	 * Register the router. The router points to the instance of router used
	 * by the middleware
	 */
	protected registerRouter() {
		this.application.container.singleton('Adonis/Core/Route', () => {
			return this.application.container.use('Adonis/Core/Server').router
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
