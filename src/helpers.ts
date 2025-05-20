/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// @ts-expect-error
import matchit from '@poppinss/matchit'
import type { RouteMatchers, MatchItRouteToken } from './types/route.js'

/**
 * Parse a route pattern into an array of tokens. These tokes can be used
 * to match routes, or print them with semantic information.
 *
 * Token types
 *
 * - 0: (static) segment
 * - 1: (parameter) segment
 * - 2: (optional parameter) segment
 * - 3: (wildcard) segment
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
