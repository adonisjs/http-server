/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type RouterClient } from './router.ts'
import {
  type UrlFor,
  type LookupList,
  type URLOptions,
  type ClientRouteJSON,
  type MatchItRouteToken,
} from './types.ts'

/**
 * Makes URL for a given route pattern. The route pattern could be an
 * identifier or an array of tokens.
 */
export function createURL(
  identifier: string,
  tokens: Pick<MatchItRouteToken, 'val' | 'type' | 'end'>[],
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
          `Cannot make URL for "${identifier}". Invalid value provided for the wildcard param`
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
        `Cannot make URL for "${identifier}". Missing value for the "${paramName}" param`
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

/**
 * Creates the URLBuilder helper
 */
export function createUrlBuilder<Routes extends LookupList>(
  router: RouterClient<ClientRouteJSON>,
  searchParamsStringifier: (qs: Record<string, any>) => string
): UrlFor<Routes> {
  let domainsList: string[]

  function createUrlForRoute(
    identifier: string,
    params: any,
    options?: URLOptions,
    method?: string
  ) {
    if (!domainsList) {
      domainsList = Object.keys(router.toJSON()).filter((domain) => domain !== 'root')
    }

    const domain = domainsList.find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier
    const route = router.findOrFail(routeIdentifier, domain, method, true)
    return createURL(
      route.name ?? route.pattern,
      route.tokens,
      searchParamsStringifier,
      params,
      options
    )
  }

  /**
   * The urlFor helper is used to make URLs for pre-existing known routes. You can
   * make a URL using the route name or the route pattern.
   */
  const urlFor: UrlFor<Routes> = function route(...[identifier, params, options]) {
    return createUrlForRoute(identifier, params, options)
  }

  urlFor.get = function urlForMethodGet(...[identifier, params, options]) {
    return {
      url: createUrlForRoute(identifier, params, options, 'GET'),
      method: 'get',
      toString() {
        return this.url
      },
    }
  }

  urlFor.post = function urlForMethodPost(...[identifier, params, options]) {
    return {
      url: createUrlForRoute(identifier, params, options, 'POST'),
      method: 'post',
      toString() {
        return this.url
      },
    }
  }

  urlFor.put = function urlForMethodPut(...[identifier, params, options]) {
    return {
      url: createUrlForRoute(identifier, params, options, 'PUT'),
      method: 'put',
      toString() {
        return this.url
      },
    }
  }

  urlFor.patch = function urlForMethodPatch(...[identifier, params, options]) {
    return {
      url: createUrlForRoute(identifier, params, options, 'PATCH'),
      method: 'patch',
      toString() {
        return this.url
      },
    }
  }

  urlFor.delete = function urlForMethodDelete(...[identifier, params, options]) {
    return {
      url: createUrlForRoute(identifier, params, options, 'DELETE'),
      method: 'delete',
      toString() {
        return this.url
      },
    }
  }

  urlFor.method = function urlForCustomMethod(method, ...[identifier, params, options]) {
    return {
      url: createUrlForRoute(identifier, params, options, method),
      method,
      toString() {
        return this.url
      },
    }
  }

  return urlFor
}
