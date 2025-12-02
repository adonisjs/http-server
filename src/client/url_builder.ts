/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createURL, findRoute } from './helpers.ts'
import { type UrlFor, type LookupList, type URLOptions, type ClientRouteJSON } from './types.ts'

export * from './types.ts'
export { createURL, findRoute }

/**
 * Creates the URLBuilder helper
 * @param router - The router instance
 * @param searchParamsStringifier - Function to stringify query string parameters
 * @returns URL builder function for creating URLs
 */
export function createUrlBuilder<Routes extends LookupList>(
  routesLoader:
    | { [domain: string]: ClientRouteJSON[] }
    | (() => { [domain: string]: ClientRouteJSON[] }),
  searchParamsStringifier: (qs: Record<string, any>) => string
): UrlFor<Routes> {
  let domainsList: string[]
  let domainsRoutes: { [domain: string]: ClientRouteJSON[] }

  function createUrlForRoute(
    identifier: string,
    params: any,
    options?: URLOptions,
    method?: string
  ) {
    if (!domainsRoutes) {
      domainsRoutes = typeof routesLoader === 'function' ? routesLoader() : routesLoader
      if (!domainsRoutes || typeof domainsRoutes !== 'object') {
        throw new Error(
          `Cannot construct routes. Expected the value to be an object, instead received ${typeof domainsRoutes}`
        )
      }
      if (!domainsList) {
        domainsList = Object.keys(domainsRoutes).filter((domain) => domain !== 'root')
      }
    }

    const domain = domainsList.find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier
    const route = findRoute(domainsRoutes, routeIdentifier, domain, method, true)
    if (!route) {
      if (method) {
        throw new Error(`Cannot lookup route "${routeIdentifier}" for method "${method}"`)
      }
      throw new Error(`Cannot lookup route "${routeIdentifier}"`)
    }

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
    const method = 'GET'
    const url = createUrlForRoute(identifier, params, options, method)

    return {
      url,
      method,
      toString() {
        return url
      },
      form: {
        action: url,
        method,
      },
    }
  }

  urlFor.post = function urlForMethodPost(...[identifier, params, options]) {
    const method = 'POST'
    const url = createUrlForRoute(identifier, params, options, method)

    return {
      url,
      method,
      toString() {
        return url
      },
      form: {
        action: url,
        method,
      },
    }
  }

  urlFor.put = function urlForMethodPut(...[identifier, params, options]) {
    const method = 'PUT'
    const url = createUrlForRoute(identifier, params, options, method)

    return {
      url,
      method,
      toString() {
        return url
      },
      form: {
        action: url,
        method,
      },
    }
  }

  urlFor.patch = function urlForMethodPatch(...[identifier, params, options]) {
    const method = 'PATCH'
    const url = createUrlForRoute(identifier, params, options, method)

    return {
      url,
      method,
      toString() {
        return url
      },
      form: {
        action: url,
        method,
      },
    }
  }

  urlFor.delete = function urlForMethodDelete(...[identifier, params, options]) {
    const method = 'DELETE'
    const url = createUrlForRoute(identifier, params, options, method)

    return {
      url,
      method,
      toString() {
        return url
      },
      form: {
        action: url,
        method,
      },
    }
  }

  urlFor.method = function urlForCustomMethod(method, ...[identifier, params, options]) {
    const url = createUrlForRoute(identifier, params, options, method)
    return {
      url,
      method,
      toString() {
        return url
      },
      form: {
        action: url,
        method,
      },
    }
  }

  return urlFor
}
