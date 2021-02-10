/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../../adonis-typings/index.ts" />

import { Middleware } from 'co-compose'
import { RouterContract } from '@ioc:Adonis/Core/Route'
import { interpolate } from '@poppinss/utils/build/helpers'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { MiddlewareStoreContract, ResolvedMiddlewareHandler } from '@ioc:Adonis/Core/Middleware'

import { HttpException } from '../../Exceptions/HttpException'
import { E_ROUTE_NOT_FOUND } from '../../../exceptions.json'

/**
 * Handles the request by invoking it's middleware chain, along with the
 * route finalHandler
 */
export class RequestHandler {
	private globalMiddleware: Middleware
	private handleRequest: (ctx: HttpContextContract) => Promise<void>

	constructor(private middlewareStore: MiddlewareStoreContract, private router: RouterContract) {}

	/**
	 * Function to invoke global middleware
	 */
	private executeMiddleware = (
		middleware: ResolvedMiddlewareHandler,
		params: [HttpContextContract, () => Promise<void>]
	) => {
		return this.middlewareStore.invokeMiddleware(middleware, params)
	}

	/**
	 * Finds the route for the request
	 */
	private findRoute(ctx: HttpContextContract) {
		const url = ctx.request.url()
		const method = ctx.request.method()
		const hostname = ctx.request.hostname()

		/*
		 * Profiling `route.match` method
		 */
		const matchRoute = ctx.profiler.profile('http:route:match')
		const route = this.router.match(url, method, hostname || undefined)
		matchRoute.end()

		/*
		 * Raise error when route is missing
		 */
		if (!route) {
			throw HttpException.invoke(
				interpolate(E_ROUTE_NOT_FOUND.message, { method, url }),
				E_ROUTE_NOT_FOUND.status,
				E_ROUTE_NOT_FOUND.code
			)
		}

		/*
		 * Attach `params`, `subdomains` and `route` when route is found. This
		 * information only exists on a given route
		 */
		ctx.params = route!.params
		ctx.subdomains = route!.subdomains
		ctx.route = route!.route
		ctx.routeKey = route!.routeKey
		ctx.request.updateParams(ctx.params)
	}

	/**
	 * Handles the request and invokes required middleware/handlers
	 */
	public async handle(ctx: HttpContextContract) {
		this.findRoute(ctx)
		return this.handleRequest(ctx)
	}

	/**
	 * Computing certain methods to optimize for runtime performance
	 */
	public commit() {
		const middleware = this.middlewareStore.get()

		if (!middleware.length) {
			this.handleRequest = (ctx) => ctx.route!.meta.finalHandler(ctx)
			return
		}

		this.globalMiddleware = new Middleware().register(middleware)
		this.handleRequest = (ctx) => {
			return this.globalMiddleware
				.runner()
				.executor(this.executeMiddleware)
				.finalHandler(ctx.route!.meta.finalHandler, [ctx])
				.run([ctx])
		}
	}
}
