/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Exception, interpolate } from '@poppinss/utils'
import {
	E_DUPLICATE_ROUTE,
	E_CANNOT_LOOKUP_ROUTE,
	E_DUPLICATE_ROUTE_NAME,
	E_CANNOT_MAKE_ROUTE_URL,
	E_DUPLICATE_ROUTE_PARAM,
	E_CANNOT_DEFINE_GROUP_NAME,
} from '../../exceptions.json'

/**
 * Exceptions related to the HTTP router
 */
export class RouterException extends Exception {
	/**
	 * Raised when one of the routes inside the group doesn't have a name
	 * but an attempt is made to name the group
	 */
	public static cannotDefineGroupName() {
		const error = new this(
			E_CANNOT_DEFINE_GROUP_NAME.message,
			E_CANNOT_DEFINE_GROUP_NAME.status,
			E_CANNOT_DEFINE_GROUP_NAME.code
		)

		error.help = E_CANNOT_DEFINE_GROUP_NAME.help.join('\n')
		throw error
	}

	/**
	 * Raised when a duplicate route pattern is find for the same HTTP method
	 */
	public static duplicateRoute(method: string, pattern: string) {
		const error = new this(
			interpolate(E_DUPLICATE_ROUTE.message, { method, pattern }),
			E_DUPLICATE_ROUTE.status,
			E_DUPLICATE_ROUTE.code
		)

		error.help = E_DUPLICATE_ROUTE.help.join('\n')
		throw error
	}

	/**
	 * Raised when a route has duplicate params
	 */
	public static duplicateRouteParam(param: string, pattern: string) {
		return new this(
			interpolate(E_DUPLICATE_ROUTE_PARAM.message, { param, pattern }),
			E_DUPLICATE_ROUTE_PARAM.status,
			E_DUPLICATE_ROUTE_PARAM.code
		)
	}

	/**
	 * Raised when route name is not unique
	 */
	public static duplicateRouteName(name: string) {
		const error = new this(
			interpolate(E_DUPLICATE_ROUTE_NAME.message, { name }),
			E_DUPLICATE_ROUTE_NAME.status,
			E_DUPLICATE_ROUTE_NAME.code
		)

		error.help = E_DUPLICATE_ROUTE_NAME.help.join('\n')
		throw error
	}

	/**
	 * Raised when unable to make url for a given route, because one of the
	 * params value is not defined
	 */
	public static cannotMakeRoute(param: string, pattern: string) {
		const error = new this(
			interpolate(E_CANNOT_MAKE_ROUTE_URL.message, { pattern, param }),
			E_CANNOT_MAKE_ROUTE_URL.status,
			E_CANNOT_MAKE_ROUTE_URL.code
		)

		error.help = E_CANNOT_MAKE_ROUTE_URL.help.join('\n')
		throw error
	}

	/**
	 * Raised when unable to lookup a route using its identifier
	 */
	public static cannotLookupRoute(identifier: string) {
		const error = new this(
			interpolate(E_CANNOT_LOOKUP_ROUTE.message, { identifier }),
			E_CANNOT_LOOKUP_ROUTE.status,
			E_CANNOT_LOOKUP_ROUTE.code
		)

		error.help = E_CANNOT_LOOKUP_ROUTE.help.join('\n')
		throw error
	}
}
