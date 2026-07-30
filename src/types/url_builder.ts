/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { InferRouteParams } from '@poppinss/types'

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
  /** Make a signed URL using a route pattern without performing a route lookup */
  disableRouteLookup?: boolean
}

/**
 * Configuration options for signed URL generation without performing a route lookup
 */
export type SignedURLPatternOptions = SignedURLOptions & {
  disableRouteLookup: true
}

type SignedURLPatternParams<Identifier extends string> = string extends Identifier
  ? any[] | Record<string, any> | undefined
  : keyof InferRouteParams<Identifier> extends never
    ? undefined
    : InferRouteParams<Identifier>

/**
 * URL builder helper for creating signed URLs.
 */
export type SignedUrlFor<Routes extends LookupList> = UrlFor<Routes, SignedURLOptions> &
  (<Identifier extends string>(
    identifier: Identifier,
    params: SignedURLPatternParams<Identifier>,
    options: SignedURLPatternOptions
  ) => string)

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
