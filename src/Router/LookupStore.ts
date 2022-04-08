/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import qs from 'qs'
import encodeurl from 'encodeurl'

import {
  RouteJSON,
  LookupStoreTree,
  UrlBuilderContract,
  LookupStoreIdentifier,
} from '@ioc:Adonis/Core/Route'

import { RouterException } from '../Exceptions/RouterException'
import { EncryptionContract } from '@ioc:Adonis/Core/Encryption'

/**
 * Url builder is responsible for building the URLs
 */
export class UrlBuilder implements UrlBuilderContract {
  /**
   * Params to be used for building the URL
   */
  private routeParams: any[] | Record<string, any>

  /**
   * A custom query string to append to the URL
   */
  private queryString: Record<string, any> = {}

  /**
   * A baseUrl to prefix to the endpoint
   */
  private baseUrl: string

  constructor(private encryption: EncryptionContract, private routes: LookupStoreIdentifier[]) {}

  /**
   * Processes the pattern against the params
   */
  private processPattern(pattern: string): string {
    let url: string[] = []
    const isParamsAnArray = Array.isArray(this.routeParams)

    /*
     * Split pattern when route has dynamic segments
     */
    const tokens = pattern.split('/')
    let paramsIndex = 0

    for (const token of tokens) {
      /**
       * Expected wildcard param to be at the end always and hence
       * we must break out from the loop
       */
      if (token === '*') {
        const wildcardParams = isParamsAnArray
          ? this.routeParams.slice(paramsIndex)
          : this.routeParams['*']

        if (!wildcardParams || !Array.isArray(wildcardParams) || !wildcardParams.length) {
          throw RouterException.cannotMakeRoute('*', pattern)
        }

        url = url.concat(wildcardParams)
        break
      }

      /**
       * Token is a static value
       */
      if (!token.startsWith(':')) {
        url.push(token)
      } else {
        const isOptional = token.endsWith('?')
        const paramName = token.replace(/^:/, '').replace(/\?$/, '')
        const param = isParamsAnArray ? this.routeParams[paramsIndex] : this.routeParams[paramName]

        paramsIndex++

        /*
         * A required param is always required to make the complete URL
         */
        if (!param && !isOptional) {
          throw RouterException.cannotMakeRoute(paramName, pattern)
        }

        url.push(param)
      }
    }

    return url.join('/')
  }

  /**
   * Suffix the query string to the URL
   */
  private suffixQueryString(url: string): string {
    if (this.queryString) {
      const encoded = qs.stringify(this.queryString)
      url = encoded ? `${url}?${encodeurl(encoded)}` : url
    }

    return url
  }

  /**
   * Finds the route inside the list of registered routes and
   * raises exception when unable to
   */
  public findRouteOrFail(identifier: string) {
    const route = this.routes.find(({ name, pattern, handler }) => {
      return name === identifier || pattern === identifier || handler === identifier
    })

    if (!route) {
      throw RouterException.cannotLookupRoute(identifier)
    }

    return route
  }

  /**
   * Prefix a custom url to the final URI
   */
  public prefixUrl(url: string): this {
    this.baseUrl = url
    return this
  }

  /**
   * Append query string to the final URI
   */
  public qs(queryString?: Record<string, any>): this {
    if (!queryString) {
      return this
    }
    this.queryString = queryString
    return this
  }

  /**
   * Define required params to resolve the route
   */
  public params(params?: any[] | Record<string, any>): this {
    if (!params) {
      return this
    }

    this.routeParams = params
    return this
  }

  /**
   * Generate url for the given route identifier
   */
  public make(identifier: string) {
    const route = this.findRouteOrFail(identifier)
    const url = this.processPattern(route.pattern)
    return this.suffixQueryString(this.baseUrl ? `${this.baseUrl}${url}` : url)
  }

  /**
   * Generate url for the given route identifier
   */
  public makeSigned(
    identifier: string,
    options?: { expiresIn?: string | number; purpose?: string }
  ) {
    const route = this.findRouteOrFail(identifier)
    const url = this.processPattern(route.pattern)

    /*
     * Making the signature from the qualified url. We do not prefix the domain when
     * making signature, since it just makes the signature big.
     *
     * There might be a case, when someone wants to generate signature for the same route
     * on their 2 different domains, but we ignore that case for now and can consider
     * it later (when someone asks for it)
     */
    const signature = this.encryption.verifier.sign(
      this.suffixQueryString(url),
      options?.expiresIn,
      options?.purpose
    )

    /*
     * Adding signature to the query string and re-making the url again
     */
    Object.assign(this.queryString, { signature })

    return this.suffixQueryString(this.baseUrl ? `${this.baseUrl}${url}` : url)
  }
}

/**
 * The look up store to make URLs for a given route by looking
 * it by its name, route handler or the pattern directly.
 */
export class LookupStore {
  /**
   * Shape of the registered routes. Optimized for lookups
   */
  public tree: LookupStoreTree = {}

  constructor(private encryption: EncryptionContract) {}

  /**
   * Register a route for lookups
   */
  public register(route: RouteJSON) {
    const domain = route.domain || 'root'
    this.tree[domain] = this.tree[domain] || []
    this.tree[domain].push({
      methods: route.methods,
      name: route.name,
      handler: route.handler,
      pattern: route.pattern,
    })
  }

  /**
   * Returns the route builder for the root domain
   */
  public builder() {
    return this.builderForDomain('root')
  }

  /**
   * Returns the route builder a given domain.
   */
  public builderForDomain(domainPattern: string) {
    const domainRoutes = this.tree[domainPattern]
    if (!domainRoutes && domainPattern !== 'root') {
      throw RouterException.cannotLookupDomain(domainPattern)
    }

    return new UrlBuilder(this.encryption, domainRoutes || [])
  }
}
