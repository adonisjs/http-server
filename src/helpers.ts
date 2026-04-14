/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Cache from 'tmp-cache'
import type { IncomingHttpHeaders } from 'node:http'
import { InvalidArgumentsException } from '@poppinss/utils'

import { Route } from './router/route.js'
import { BriskRoute } from './router/brisk.js'
import { RouteGroup } from './router/group.js'
import type { RouteJSON } from './types/route.js'
import { RouteResource } from './router/resource.js'

const proxyCache = new Cache({ max: 200 })

/**
 * Validates that a URL is safe to use as a redirect destination.
 *
 * - Relative URLs must start with `/` and not be protocol-relative (`//`)
 * - Absolute URLs must parse successfully and their host must match
 *   `currentHost` or be listed in `allowedHosts`
 *
 * When `currentHost` and `allowedHosts` are omitted, absolute URLs
 * are accepted as long as they parse successfully.
 *
 * @param url - The URL to validate
 * @param currentHost - The current request's Host header value
 * @param allowedHosts - Array of additionally allowed hosts
 */
export function isValidRedirectUrl(
  url: string,
  currentHost?: string,
  allowedHosts?: string[]
): boolean {
  if (typeof url !== 'string' || url.trim() === '') {
    return false
  }

  if (url.startsWith('//')) {
    return false
  }

  if (url.startsWith('/')) {
    try {
      const parsed = new URL(url, 'http://localhost')
      return parsed.host === 'localhost'
    } catch {
      return false
    }
  }

  try {
    const parsed = new URL(url)

    /**
     * When no host constraints are provided, accept any
     * parseable absolute URL
     */
    if (!currentHost && (!allowedHosts || allowedHosts.length === 0)) {
      return true
    }

    if (currentHost && parsed.host === currentHost) {
      return true
    }

    if (allowedHosts && allowedHosts.length > 0 && allowedHosts.includes(parsed.host)) {
      return true
    }

    return false
  } catch {
    return false
  }
}

/**
 * Returns the previous URL from the request's `Referer` header,
 * validated against the request's `Host` header and an optional
 * list of allowed hosts using `isValidRedirectUrl`.
 *
 * @param headers - The incoming request headers
 * @param allowedHosts - Array of allowed referrer hosts
 * @param fallback - URL to return when referrer is missing or invalid
 */
export function getPreviousUrl(
  headers: IncomingHttpHeaders,
  allowedHosts: string[],
  fallback: string
): string {
  let referrer = headers['referer'] || headers['referrer']
  if (!referrer) {
    return fallback
  }

  if (Array.isArray(referrer)) {
    referrer = referrer[0]
  }

  if (isValidRedirectUrl(referrer, headers['host'], allowedHosts)) {
    return referrer
  }

  return fallback
}

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
