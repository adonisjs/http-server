/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { LazyImport } from './types/base.js'
import type { MiddlewareAsClass } from './types/middleware.js'

/**
 * Define an array of midldeware to be used either by the server
 * or the router
 */
export function defineMiddleware(list: LazyImport<MiddlewareAsClass>[]) {
  return list
}

/**
 * Define an collection of named middleware. The name can be later be
 * referenced on the routes
 */
export function defineNamedMiddleware<
  NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>>
>(collection: NamedMiddleware) {
  return collection
}
