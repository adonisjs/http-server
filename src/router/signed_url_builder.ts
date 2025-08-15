/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'

import { type Router } from './main.ts'
import { createURL } from './url_builder.ts'
import { type MatchItRouteToken } from '../types/route.ts'
import { type UrlFor, type LookupList, type SignedURLOptions } from '../types/url_builder.ts'

/**
 * Makes signed URL for a given route pattern. The route pattern could be an
 * identifier or an array of tokens.
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
  const signature = encryption.verifier.sign(
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
 * Creates the URLBuilder helper for making signed URLs
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
