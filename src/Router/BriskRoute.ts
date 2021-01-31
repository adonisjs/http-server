/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { Macroable } from 'macroable'
import { Exception } from '@poppinss/utils'

import { Route } from './Route'
import { BriskRouteContract, RouteMatchers, RouteHandler } from '@ioc:Adonis/Core/Route'

/**
 * Brisk route enables you to expose expressive API for
 * defining route handler.
 *
 * For example: AdonisJs uses [[BriskRoute]] `Route.on().render()`
 * to render a view without defining a controller method or
 * closure.
 */
export class BriskRoute extends Macroable implements BriskRouteContract {
	protected static macros = {}
	protected static getters = {}

	/**
	 * Invoked by is reference to the parent method that calls `setHandler` on
	 * this class. We keep a reference to the parent method name for raising
	 * meaningful exception
	 */
	private invokedBy: string = ''

	/**
	 * Reference to route instance. Set after `setHandler` is called
	 */
	public route: null | Route = null

	constructor(private pattern: string, private globalMatchers: RouteMatchers) {
		super()
	}

	/**
	 * Set handler for the brisk route. The `invokedBy` string is the reference
	 * to the method that calls this method. It is required to create human
	 * readable error message when `setHandler` is called for multiple
	 * times.
	 */
	public setHandler(handler: RouteHandler, invokedBy: string, methods?: string[]): Route {
		if (this.route) {
			throw new Exception(
				`\`Route.${invokedBy}\` and \`${this.invokedBy}\` cannot be called together`,
				500,
				'E_MULTIPLE_BRISK_HANDLERS'
			)
		}

		this.route = new Route(this.pattern, methods || ['HEAD', 'GET'], handler, this.globalMatchers)
		this.invokedBy = invokedBy
		return this.route
	}
}
