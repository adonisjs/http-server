/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import cookie from 'cookie'
// @ts-expect-error
import matchit from '@poppinss/matchit'
import string from '@poppinss/utils/string'
import { parseBindingReference } from '@adonisjs/fold'

import { type CookieOptions } from './types/response.js'
import type { RouteMatchers, MatchItRouteToken, RouteJSON } from './types/route.js'
import {
  type RouteHandlerInfo,
  type MiddlewareFn,
  type MiddlewareHandlerInfo,
  type ParsedGlobalMiddleware,
  type ParsedNamedMiddleware,
} from './types/middleware.ts'

/**
 * This function is similar to the intrinsic function encodeURI. However, it will not encode:
 *  - The \, ^, or | characters
 *  - The % character when it's part of a valid sequence
 *  - [ and ] (for IPv6 hostnames)
 *  - Replaces raw, unpaired surrogate pairs with the Unicode replacement character
 *
 * Some tests
 * encodeURI('http://localhost/%20snow.html') // http://localhost/%2520snow.html
 * encodeUrl('http://localhost/%20snow.html') // http://localhost/%20snow.html
 *
 * encodeURI('http://[::1]:8080/foo/bar') // http://%5B::1%5D:8080/foo/bar
 * encodeUrl('http://[::1]:8080/foo/bar') // http://[::1]:8080/foo/bar
 */
export { default as encodeUrl } from 'encodeurl'

/**
 * Re-exports the "https://www.npmjs.com/package/mime-types" package
 */
export { default as mime } from 'mime-types'

/**
 * Parse a route pattern into an array of tokens. These tokes can be used
 * to match routes, or print them with semantic information.
 *
 * Token types
 *
 * - 0: (static) segment
 * - 1: (parameter) segment
 * - 2: (wildcard) segment
 * - 3: (optional parameter) segment
 *
 * Value (val) refers to the segment value
 *
 * end refers to be the suffix or the segment (if any)
 */
export function parseRoute(pattern: string, matchers?: RouteMatchers): MatchItRouteToken[] {
  const tokens = matchit.parse(pattern, matchers)
  return tokens
}

/**
 * Match a given URI with an array of patterns and extract the params
 * from the URL. Null value is returned in case of no match
 */
export function matchRoute(url: string, patterns: string[]): null | Record<string, string> {
  const tokensBucket = patterns.map((pattern) => parseRoute(pattern))
  const match = matchit.match(url, tokensBucket)
  if (!match.length) {
    return null
  }

  return matchit.exec(url, match)
}

/**
 * Serialize the value of a cookie to a string you can send via
 * set-cookie response header.
 */
export function serializeCookie(
  key: string,
  value: string,
  options?: Partial<CookieOptions>
): string {
  let expires: Date | undefined
  let maxAge: number | undefined

  if (options) {
    expires = typeof options.expires === 'function' ? options.expires() : options.expires
    maxAge = options.maxAge ? string.seconds.parse(options.maxAge) : undefined
  }

  return cookie.serialize(key, value, { ...options, maxAge, expires })
}

/**
 * Returns the info about a middleware handler. In case of lazy imports, the method
 * will return the import path
 */
export async function middlewareInfo(
  middleware: MiddlewareFn | ParsedGlobalMiddleware | ParsedNamedMiddleware
): Promise<MiddlewareHandlerInfo> {
  if (typeof middleware === 'function') {
    return {
      type: 'closure',
      name: middleware.name || 'closure',
    }
  }

  if ('args' in middleware) {
    return {
      type: 'named',
      name: middleware.name,
      args: middleware.args,
      ...(await parseBindingReference([middleware.reference])),
    }
  }

  return {
    type: 'global',
    name: middleware.name,
    ...(await parseBindingReference([middleware.reference])),
  }
}

/**
 * Returns the info about a route handler. In case of lazy imports, the method
 * will return the import path.
 */
export async function routeInfo(route: RouteJSON): Promise<RouteHandlerInfo> {
  return 'reference' in route.handler
    ? {
        type: 'controller' as const,
        ...(await parseBindingReference(route.handler.reference)),
      }
    : {
        type: 'closure' as const,
        name: route.handler.name || 'closure',
        args: 'listArgs' in route.handler ? String(route.handler.listArgs) : undefined,
      }
}
