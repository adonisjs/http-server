/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

import type { Router } from './main.ts'
import { createSignedURL, createURL } from '../utils.ts'
import type { LookupList, URLOptions, UrlFor, SignedURLOptions } from '../types/url_builder.ts'

/**
 * Creates the URLBuilder helper
 */
export function createUrlBuilder<Routes extends LookupList>(router: Router): UrlFor<Routes> {
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
    return createURL(
      router.findOrFail(routeIdentifier, domain, method, true),
      router.qs,
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

/**
 * Creates the URLBuilder helper for making signed URLs
 */
export function createSignedUrlBuilder<Routes extends LookupList>(
  router: Router,
  encryption: Encryption
): UrlFor<Routes, SignedURLOptions> {
  let domainsList: string[]

  function createSignedUrlForRoute(
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
    return createSignedURL(
      router.findOrFail(routeIdentifier, domain, method, true),
      router.qs,
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
    return {
      url: createSignedUrlForRoute(identifier, params, options, 'GET'),
      method: 'get',
      toString() {
        return this.url
      },
    }
  }

  signedRoute.post = function routePost(...[identifier, params, options]) {
    return {
      url: createSignedUrlForRoute(identifier, params, options, 'POST'),
      method: 'post',
      toString() {
        return this.url
      },
    }
  }

  signedRoute.put = function routePut(...[identifier, params, options]) {
    return {
      url: createSignedUrlForRoute(identifier, params, options, 'PUT'),
      method: 'put',
      toString() {
        return this.url
      },
    }
  }

  signedRoute.patch = function routePatch(...[identifier, params, options]) {
    return {
      url: createSignedUrlForRoute(identifier, params, options, 'PATCH'),
      method: 'patch',
      toString() {
        return this.url
      },
    }
  }

  signedRoute.delete = function routeDelete(...[identifier, params, options]) {
    return {
      url: createSignedUrlForRoute(identifier, params, options, 'DELETE'),
      method: 'delete',
      toString() {
        return this.url
      },
    }
  }

  signedRoute.method = function routeGet(method, ...[identifier, params, options]) {
    return {
      url: createSignedUrlForRoute(identifier, params, options, method),
      method,
      toString() {
        return this.url
      },
    }
  }

  return signedRoute
}
