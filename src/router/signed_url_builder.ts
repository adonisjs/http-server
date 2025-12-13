/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@boringnode/encryption'

import { type Router } from './main.ts'
import { createSignedURL } from '../helpers.ts'
import { type UrlFor, type LookupList, type SignedURLOptions } from '../types/url_builder.ts'

/**
 * Creates the URLBuilder helper for making signed URLs
 * @param router - The router instance
 * @param encryption - Encryption service for signing URLs
 * @param searchParamsStringifier - Function to stringify query string parameters
 * @returns URL builder function for creating signed URLs
 */
export function createSignedUrlBuilder<Routes extends LookupList>(
  router: Router,
  encryption: Encryption,
  searchParamsStringifier: (qs: Record<string, any>) => string
): UrlFor<Routes, SignedURLOptions> {
  let domainsList: string[]

  function createSignedUrlForRoute(
    identifier: string,
    params: any,
    options?: SignedURLOptions,
    method?: string
  ) {
    if (!domainsList) {
      domainsList = Object.keys(router.toJSON()).filter((domain) => domain !== 'root')
    }

    const domain = domainsList.find((name) => identifier.startsWith(`${name}@`))
    const routeIdentifier = domain ? identifier.replace(new RegExp(`^${domain}@`), '') : identifier
    const route = router.findOrFail(routeIdentifier, domain, method, true)
    return createSignedURL(
      route.name ?? route.pattern,
      route.tokens,
      searchParamsStringifier,
      encryption,
      params,
      options
    )
  }

  const signedRoute: UrlFor<Routes, SignedURLOptions> = function route(
    ...[identifier, params, options]
  ) {
    return createSignedUrlForRoute(identifier, params, options)
  }

  signedRoute.get = function routeGet(...[identifier, params, options]) {
    const method = 'GET'
    const url = createSignedUrlForRoute(identifier, params, options, method)

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

  signedRoute.post = function routePost(...[identifier, params, options]) {
    const method = 'POST'
    const url = createSignedUrlForRoute(identifier, params, options, method)

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

  signedRoute.put = function routePut(...[identifier, params, options]) {
    const method = 'PUT'
    const url = createSignedUrlForRoute(identifier, params, options, method)

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

  signedRoute.patch = function routePatch(...[identifier, params, options]) {
    const method = 'PATCH'
    const url = createSignedUrlForRoute(identifier, params, options, method)

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

  signedRoute.delete = function routeDelete(...[identifier, params, options]) {
    const method = 'DELETE'
    const url = createSignedUrlForRoute(identifier, params, options, method)

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

  signedRoute.method = function routeGet(method, ...[identifier, params, options]) {
    const url = createSignedUrlForRoute(identifier, params, options, method)

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

  return signedRoute
}
