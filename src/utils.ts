/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Cache from 'tmp-cache'
import type { Encryption } from '@adonisjs/encryption'
import { RuntimeException, InvalidArgumentsException } from '@poppinss/utils'

import type { Qs } from './qs.js'
import { parseRoute } from './helpers.js'
import { Route } from './router/route.js'
import { RouteGroup } from './router/group.js'
import { BriskRoute } from './router/brisk.js'
import { RouteResource } from './router/resource.js'
import type { RouteJSON } from './types/route.js'
import type { SignedURLOptions, URLOptions } from './types/url_builder.js'

const proxyCache = new Cache({ max: 200 })

/**
 * Makes input string consistent by having only the starting
 * slash
 */
export function dropSlash(input: string): string {
  if (input === '/') {
    return '/'
  }

  return `/${input.replace(/^\//, '').replace(/\/$/, '')}`
}

/**
 * Returns a flat list of routes from the route groups and resources
 */
export function toRoutesJSON(
  routes: (RouteGroup | Route | RouteResource | BriskRoute)[]
): RouteJSON[] {
  return routes.reduce((list: RouteJSON[], route) => {
    if (route instanceof RouteGroup) {
      list = list.concat(toRoutesJSON(route.routes))
      return list
    }

    if (route instanceof RouteResource) {
      list = list.concat(toRoutesJSON(route.routes))
      return list
    }

    if (route instanceof BriskRoute) {
      if (route.route && !route.route.isDeleted()) {
        list.push(route.route.toJSON())
      }
      return list
    }

    if (!route.isDeleted()) {
      list.push(route.toJSON())
    }

    return list
  }, [])
}

/**
 * Helper to know if the remote address should
 * be trusted.
 */
export function trustProxy(
  remoteAddress: string,
  proxyFn: (addr: string, distance: number) => boolean
): boolean {
  if (proxyCache.has(remoteAddress)) {
    return proxyCache.get(remoteAddress) as boolean
  }

  const result = proxyFn(remoteAddress, 0)
  proxyCache.set(remoteAddress, result)
  return result
}

/**
 * Parses a range expression to an object filled with the range
 */
export function parseRange<T>(range: string, value: T): Record<number, T> {
  const parts = range.split('..')
  const min = Number(parts[0])
  const max = Number(parts[1])

  /**
   * The ending status code does not exists
   */
  if (parts.length === 1 && !Number.isNaN(min)) {
    return {
      [min]: value,
    }
  }

  /**
   * The starting status code is not a number
   */
  if (Number.isNaN(min) || Number.isNaN(max)) {
    return {}
  }

  /**
   * Min and max are same
   */
  if (min === max) {
    return {
      [min]: value,
    }
  }

  /**
   * Max cannot be smaller than min
   */
  if (max < min) {
    throw new InvalidArgumentsException(`Invalid range "${range}"`)
  }

  /**
   * Loop over the range and create a collection
   * of status codes
   */
  return [...Array(max - min + 1).keys()].reduce(
    (result, step) => {
      result[min + step] = value
      return result
    },
    {} as Record<number, T>
  )
}

/**
 * Makes URL for a given route pattern. The route pattern could be an
 * identifier or an array of tokens.
 */
export function createURL(
  identifierOrRoute: string | RouteJSON,
  qs: Qs,
  params?: any[] | { [param: string]: any },
  options?: URLOptions
): string {
  const uriSegments: string[] = []
  const paramsArray = Array.isArray(params) ? params : null
  const paramsObject = !Array.isArray(params) ? (params ?? {}) : {}
  const tokens =
    typeof identifierOrRoute === 'string' ? parseRoute(identifierOrRoute) : identifierOrRoute.tokens
  const identifier =
    typeof identifierOrRoute === 'string' ? identifierOrRoute : identifierOrRoute.pattern

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
        throw new RuntimeException(
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
      throw new RuntimeException(
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
    const queryString = qs.stringify(options?.qs)
    URI = queryString ? `${URI}?${queryString}` : URI
  }

  return URI
}

/**
 * Makes signed URL for a given route pattern. The route pattern could be an
 * identifier or an array of tokens.
 */
export function createSignedURL(
  identifierOrRoute: string | RouteJSON,
  qs: Qs,
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
    createURL(identifierOrRoute, qs, params, {
      ...options,
      prefixUrl: undefined,
    }),
    options?.expiresIn,
    options?.purpose
  )

  return createURL(identifierOrRoute, qs, params, {
    ...options,
    qs: { ...options?.qs, signature },
  })
}
