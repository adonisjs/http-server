/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Router } from './main.ts'
import { createURL } from '../helpers.ts'
import { type UrlFor, type LookupList, type URLOptions } from '../types/url_builder.ts'

/**
 * Creates the URLBuilder helper
 * @param router - The router instance
 * @param searchParamsStringifier - Function to stringify query string parameters
 * @returns URL builder function for creating URLs
 */
export function createUrlBuilder<Routes extends LookupList>(
  router: Router,
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
