/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import {
  type UrlFor,
  type LookupList,
  type URLOptions,
  type LookupListRoute,
  type RouteBuilderArguments,
} from '../client/types.ts'

export { URLOptions, LookupListRoute, RouteBuilderArguments, LookupList, UrlFor }

/**
 * Configuration options for signed URL generation helpers
 */
export type SignedURLOptions = URLOptions & {
  /** Expiration time for the signed URL */
  expiresIn?: string | number
  /** Purpose identifier for the signed URL */
  purpose?: string
}

/**
 * Utility type to extract routes for a specific HTTP method from the routes collection
 */
export type GetRoutesForMethod<Routes, Method> = {
  [K in keyof Routes]: Method extends K ? Routes[Method] : never
}[keyof Routes]

/**
 * Interface to be augmented by the router containing all registered routes for type-safe URL generation
 */
export interface RoutesList {}
