/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Cache from 'tmp-cache'
import { InvalidArgumentsException } from '@poppinss/utils/exception'

import { type Route } from './router/route.js'
import { RouteGroup } from './router/group.js'
import { BriskRoute } from './router/brisk.js'
import type { RouteJSON } from './types/route.js'
import { RouteResource } from './router/resource.js'

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

function decodeComponentChar(highCharCode: number, lowCharCode: number) {
  if (highCharCode === 50) {
    if (lowCharCode === 53) return '%'

    if (lowCharCode === 51) return '#'
    if (lowCharCode === 52) return '$'
    if (lowCharCode === 54) return '&'
    if (lowCharCode === 66) return '+'
    if (lowCharCode === 98) return '+'
    if (lowCharCode === 67) return ','
    if (lowCharCode === 99) return ','
    if (lowCharCode === 70) return '/'
    if (lowCharCode === 102) return '/'
    return null
  }
  if (highCharCode === 51) {
    if (lowCharCode === 65) return ':'
    if (lowCharCode === 97) return ':'
    if (lowCharCode === 66) return ';'
    if (lowCharCode === 98) return ';'
    if (lowCharCode === 68) return '='
    if (lowCharCode === 100) return '='
    if (lowCharCode === 70) return '?'
    if (lowCharCode === 102) return '?'
    return null
  }
  if (highCharCode === 52 && lowCharCode === 48) {
    return '@'
  }
  return null
}

export function safeDecodeURI(path: string, useSemicolonDelimiter: boolean) {
  let shouldDecode = false
  let shouldDecodeParam = false

  let querystring = ''

  for (let i = 1; i < path.length; i++) {
    const charCode = path.charCodeAt(i)

    if (charCode === 37) {
      const highCharCode = path.charCodeAt(i + 1)
      const lowCharCode = path.charCodeAt(i + 2)

      if (decodeComponentChar(highCharCode, lowCharCode) === null) {
        shouldDecode = true
      } else {
        shouldDecodeParam = true
        // %25 - encoded % char. We need to encode one more time to prevent double decoding
        if (highCharCode === 50 && lowCharCode === 53) {
          shouldDecode = true
          path = path.slice(0, i + 1) + '25' + path.slice(i + 1)
          i += 2
        }
        i += 2
      }
      // Some systems do not follow RFC and separate the path and query
      // string with a `;` character (code 59), e.g. `/foo;jsessionid=123456`.
      // Thus, we need to split on `#` as well as `?` and `;` if the useSemicolonDelimiter option is enabled.
    } else if (charCode === 63 || charCode === 35 || (charCode === 59 && useSemicolonDelimiter)) {
      querystring = path.slice(i + 1)
      path = path.slice(0, i)
      break
    }
  }

  const decodedPath = shouldDecode ? decodeURI(path) : path
  return { pathname: decodedPath, query: querystring, shouldDecodeParam }
}
