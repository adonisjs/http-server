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
import { MatchItRouteToken, RouteMatchers } from '../types/route.js'

/**
 * Parses the route pattern
 */
export function parseRoutePattern(pattern: string, matchers?: RouteMatchers): MatchItRouteToken[] {
  const tokens = matchit.parse(pattern, matchers)
  return tokens
}
