/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Server' {
	import { Server as HttpsServer } from 'https'
	import { RouterContract } from '@ioc:Adonis/Core/Route'
	import { RequestConfig } from '@ioc:Adonis/Core/Request'
	import { ResponseConfig } from '@ioc:Adonis/Core/Response'
	import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
	import { MiddlewareStoreContract } from '@ioc:Adonis/Core/Middleware'
	import { IncomingMessage, ServerResponse, Server as HttpServer } from 'http'

	/**
	 * Before hooks are executed before finding the route or finding
	 * middleware
	 */
	export type HookHandler = (ctx: HttpContextContract) => Promise<void>

	/**
	 * Error handler node
	 */
	export type ErrorHandler = string | ((error: any, ctx: HttpContextContract) => Promise<any>)

	/**
	 * Shape of resolved error handler node
	 */
	export type ResolvedErrorHandler =
		| {
				type: 'function'
				value: Exclude<ErrorHandler, string>
		  }
		| {
				type: 'class'
				value: any
		  }

	/**
	 * Shape of the public methods for the hooks contract. By `public`
	 * the one we want to expose to the end user
	 */
	export interface HooksContract {
		/**
		 * Register before hook
		 */
		before(cb: HookHandler): this

		/**
		 * Register after hook
		 */
		after(cb: HookHandler): this
	}

	/**
	 * HTTP server
	 */
	export interface ServerContract {
		/**
		 * The server itself doesn't create the http server instance. However, the consumer
		 * of this class can create one and set the instance for further reference. This
		 * is what ignitor does.
		 */
		instance?: HttpServer | HttpsServer

		/**
		 * The route to register routes
		 */
		router: RouterContract

		/**
		 * Server before/after hooks
		 */
		hooks: HooksContract

		/**
		 * The middleware store to register global and named middleware
		 */
		middleware: MiddlewareStoreContract

		/**
		 * Define custom error handler to handler all errors
		 * occurred during HTTP request
		 */
		errorHandler(handler: ErrorHandler): this

		/**
		 * Handles a given HTTP request. This method can be attached to any HTTP
		 * server
		 */
		handle(req: IncomingMessage, res: ServerResponse): Promise<void>

		/**
		 * Optimizes internal handlers, based upon the existence of
		 * before handlers and global middleware. This helps in
		 * increasing throughput by 10%
		 */
		optimize(): void
	}

	/**
	 * Config requried by request and response
	 */
	export type ServerConfig = RequestConfig & ResponseConfig
	const Server: ServerContract
	export default Server
}
