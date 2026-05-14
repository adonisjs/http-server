/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { serialize } from 'cookie-es'
// @ts-expect-error
import matchit from '@poppinss/matchit'
import string from '@poppinss/utils/string'
import { type Encryption } from '@boringnode/encryption'
import { parseBindingReference } from '@adonisjs/fold'

import { type Qs } from './qs.ts'
import { safeDecodeURI } from './utils.ts'
import type { HttpRequest } from './request.ts'
import { createURL } from './client/helpers.ts'
import { type CookieOptions } from './types/response.ts'
import { type SignedURLOptions } from './types/url_builder.ts'
import type { RouteMatchers, RouteJSON, MatchItRouteToken } from './types/route.ts'
import {
  type MiddlewareFn,
  type RouteHandlerInfo,
  type MiddlewareHandlerInfo,
  type ParsedGlobalMiddleware,
  type ParsedNamedMiddleware,
} from './types/middleware.ts'

export { createURL }

/**
 * Validates that a URL is safe to use as a redirect destination.
 *
 * - Relative URLs must start with `/` and not be protocol-relative (`//`)
 * - Absolute URLs must parse successfully and their host must match
 *   `currentHost` or be listed in `allowedHosts`
 *
 * When `currentHost` and `allowedHosts` are omitted, absolute URLs
 * are accepted as long as they parse successfully.
 *
 * @param url - The URL to validate
 * @param currentHost - The current request's Host header value
 * @param allowedHosts - Array of additionally allowed hosts
 */
export function isValidRedirectUrl(
  url: string,
  currentHost?: string,
  allowedHosts?: string[]
): boolean {
  if (typeof url !== 'string' || url.trim() === '') {
    return false
  }

  if (url.startsWith('//')) {
    return false
  }

  if (url.startsWith('/')) {
    try {
      const parsed = new URL(url, 'http://localhost')
      return parsed.host === 'localhost'
    } catch {
      return false
    }
  }

  try {
    const parsed = new URL(url)

    /**
     * When no host constraints are provided, accept any
     * parseable absolute URL
     */
    if (!currentHost && (!allowedHosts || allowedHosts.length === 0)) {
      return true
    }

    if (currentHost && parsed.host === currentHost) {
      return true
    }

    if (allowedHosts && allowedHosts.length > 0 && allowedHosts.includes(parsed.host)) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Returns the previous URL from the request's `Referer` header,
 * validated against the request's authority (`:authority` or `Host`)
 * and an optional list of allowed hosts using `isValidRedirectUrl`.
 *
 * @param request - The AdonisJS HTTP request instance
 * @param allowedHosts - Array of allowed referrer hosts
 * @param fallback - URL to return when referrer is missing or invalid
 */
export function getPreviousUrl(
  request: HttpRequest,
  allowedHosts: string[],
  fallback: string
): string {
  const referrer = request.header('referer')
  if (!referrer) {
    return fallback
  }

  if (isValidRedirectUrl(referrer, request.authority() ?? undefined, allowedHosts)) {
    return referrer
  }

  return fallback
}

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
 *
 * @param pattern - The route pattern to parse
 * @param matchers - Optional route matchers
 * @returns {MatchItRouteToken[]} Array of parsed route tokens
 */
export function parseRoute(pattern: string, matchers?: RouteMatchers): MatchItRouteToken[] {
  const tokens = matchit.parse(pattern, matchers)
  return tokens
}

/**
 * Makes signed URL for a given route pattern using its parsed tokens. The
 * tokens could be generated using the "parseRoute" method.
 *
 * @param identifier - Route identifier
 * @param tokens - Array of parsed route tokens
 * @param searchParamsStringifier - Function to stringify query parameters
 * @param encryption - Encryption instance for signing
 * @param params - Route parameters as array or object
 * @param options - Signed URL options
 * @returns {string} The generated signed URL
 */
export function createSignedURL(
  identifier: string,
  tokens: MatchItRouteToken[],
  searchParamsStringifier: (qs: Record<string, any>) => string,
  encryption: Encryption,
  params?: any[] | { [param: string]: any },
  options?: SignedURLOptions
): string {
  /*
   * Making the signature from the qualified url. We do not prefix the "prefixUrl" when
   * making signature, since it just makes the signature big.
   *
   * There might be a case, when someone wants to generate signature for the same route
   * on their 2 different domains, but we ignore that case for now and can consider
   * it later (when someone asks for it)
   */
  const signature = encryption.getMessageVerifier().sign(
    createURL(identifier, tokens, searchParamsStringifier, params, {
      ...options,
      prefixUrl: undefined,
    }),
    options?.expiresIn,
    options?.purpose
  )

  return createURL(identifier, tokens, searchParamsStringifier, params, {
    ...options,
    qs: { ...options?.qs, signature },
  })
}

/**
 * Match a given URI with an array of patterns and extract the params
 * from the URL. Null value is returned in case of no match
 *
 * @param url - The URL to match
 * @param patterns - Array of route patterns to match against
 * @returns {null | Record<string, string>} Extracted parameters or null if no match
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
 *
 * @param key - Cookie name
 * @param value - Cookie value
 * @param options - Cookie options
 * @returns {string} Serialized cookie string
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

  return serialize(key, value, { ...options, maxAge, expires })
}

/**
 * Returns the info about a middleware handler. In case of lazy imports, the method
 * will return the import path
 *
 * @param middleware - The middleware function or parsed middleware
 * @returns {Promise<MiddlewareHandlerInfo>} Promise resolving to middleware handler information
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
 *
 * @param route - The route JSON object
 * @returns {Promise<RouteHandlerInfo>} Promise resolving to route handler information
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

/**
 * Appends query string parameters to a URI. Existing query parameters
 * in the URI are merged with the new ones.
 *
 * @param uri - The base URI to append query string to
 * @param queryString - Object containing query parameters to append
 * @param qsParser - Query string parser instance for stringify/parse operations
 *
 * @example
 * ```ts
 * const result = appendQueryString('/users', { page: 1, limit: 10 }, qsParser)
 * // Returns: '/users?page=1&limit=10'
 *
 * const result2 = appendQueryString('/users?sort=name', { page: 1 }, qsParser)
 * // Returns: '/users?sort=name&page=1'
 * ```
 */
export function appendQueryString(uri: string, queryString: Record<string, any>, qsParser: Qs) {
  const { query, pathname } = safeDecodeURI(uri, false)
  const mergedQueryString = qsParser.stringify(Object.assign(qsParser.parse(query), queryString))
  return mergedQueryString ? `${pathname}?${mergedQueryString}` : pathname
}
