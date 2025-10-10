/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type ClientRouteMatchItTokens, type ClientRouteJSON, type URLOptions } from './types.ts'

/**
 * Finds a route by its identifier across domains.
 *
 * Searches for routes by name, pattern, or controller reference. When no domain
 * is specified, searches across all domains. Supports legacy lookup strategies
 * for backwards compatibility.
 *
 * @param domainsRoutes - Object mapping domain names to route arrays
 * @param routeIdentifier - Route name, pattern, or controller reference to find
 * @param domain - Optional domain to limit search scope
 * @param method - Optional HTTP method to filter routes
 * @param disableLegacyLookup - Whether to disable pattern and controller lookup
 *
 * @example
 * ```ts
 * const route = findRoute(routes, 'users.show', 'api', 'GET')
 * const route2 = findRoute(routes, '/users/:id', undefined, 'GET')
 * ```
 */
export function findRoute<Route extends ClientRouteJSON>(
  domainsRoutes: { [domain: string]: Route[] },
  routeIdentifier: string,
  domain?: string,
  method?: string,
  disableLegacyLookup?: boolean
): null | Route {
  /**
   * Search for route in all the domains when no domain name is
   * mentioned.
   */
  if (!domain) {
    let route: Route | null = null
    for (const routeDomain of Object.keys(domainsRoutes)) {
      route = findRoute(domainsRoutes, routeIdentifier, routeDomain, method, disableLegacyLookup)
      if (route) {
        break
      }
    }
    return route
  }

  const routes = domainsRoutes[domain]
  if (!routes) {
    return null
  }

  const lookupByName = true

  /**
   * Pattern and controller are supported for legacy reasons. However
   * the URL builder only works with names
   */
  const lookupByPattern = !disableLegacyLookup
  const lookupByController = !disableLegacyLookup

  return (
    routes.find((route) => {
      if (method && !route.methods.includes(method)) {
        return false
      }

      if (
        (lookupByName && route.name === routeIdentifier) ||
        (lookupByPattern && route.pattern === routeIdentifier)
      ) {
        return true
      }

      if (lookupByController && route.handler && typeof route.handler === 'object') {
        return 'reference' in route.handler && route.handler.reference === routeIdentifier
      }

      return false
    }) || null
  )
}

/**
 * Makes URL for a given route pattern using its parsed tokens. The
 * tokens could be generated using the "parseRoute" method.
 *
 * @param pattern - The route pattern
 * @param tokens - Array of parsed route tokens
 * @param searchParamsStringifier - Function to stringify query parameters
 * @param params - Route parameters as array or object
 * @param options - URL options
 * @returns {string} The generated URL
 */
export function createURL(
  pattern: string,
  tokens: Pick<ClientRouteMatchItTokens, 'val' | 'type' | 'end'>[],
  searchParamsStringifier: (qs: Record<string, any>) => string,
  params?: any[] | { [param: string]: any },
  options?: URLOptions
): string {
  const uriSegments: string[] = []
  const paramsArray = Array.isArray(params) ? params : null
  const paramsObject = !Array.isArray(params) ? (params ?? {}) : {}

  let paramsIndex = 0
  for (const token of tokens) {
    /**
     * Static param
     */
    if (token.type === 0) {
      uriSegments.push(token.val === '/' ? '' : `${token.val}${token.end}`)
      continue
    }

    /**
     * Wildcard param. It will always be the last param, hence we will provide
     * it all the remaining values
     */
    if (token.type === 2) {
      const values = paramsArray ? paramsArray.slice(paramsIndex) : paramsObject['*']
      if (!Array.isArray(values) || !values.length) {
        throw new Error(
          `Cannot make URL for "${pattern}". Invalid value provided for the wildcard param`
        )
      }

      uriSegments.push(`${values.join('/')}${token.end}`)
      break
    }

    const paramName = token.val
    const value = paramsArray ? paramsArray[paramsIndex] : paramsObject[paramName]
    const isDefined = value !== undefined && value !== null

    /**
     * Required param
     */
    if (token.type === 1 && !isDefined) {
      throw new Error(
        `Cannot make URL for "${pattern}". Missing value for the "${paramName}" param`
      )
    }

    if (isDefined) {
      uriSegments.push(`${value}${token.end}`)
    }

    paramsIndex++
  }

  let URI = `/${uriSegments.join('/')}`

  /**
   * Prefix base URL
   */
  if (options?.prefixUrl) {
    URI = `${options?.prefixUrl.replace(/\/$/, '')}${URI}`
  }

  /**
   * Append query string
   */
  if (options?.qs) {
    const queryString = searchParamsStringifier(options?.qs)
    URI = queryString ? `${URI}?${queryString}` : URI
  }

  return URI
}
