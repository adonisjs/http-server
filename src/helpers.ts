/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Cache from 'tmp-cache'
import { InvalidArgumentsException } from '@poppinss/utils'

import { Route } from './router/route.js'
import { BriskRoute } from './router/brisk.js'
import { RouteGroup } from './router/group.js'
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

  if (Number.isNaN(min) || Number.isNaN(max)) {
    return {}
  }

  if (min === max) {
    return {
      [min]: value,
    }
  }

  if (max < min) {
    throw new InvalidArgumentsException(`Invalid range "${range}"`)
  }

  return [...Array(max - min + 1).keys()].reduce((result, step) => {
    result[min + step] = value
    return result
  }, {} as Record<number, T>)
}
