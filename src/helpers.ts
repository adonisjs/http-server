/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import QuickLru from 'quick-lru'
import { Exception } from '@poppinss/utils'

import { Route } from './Router/Route'
import { RouteGroup } from './Router/Group'
import { BriskRoute } from './Router/BriskRoute'
import { RouteResource } from './Router/Resource'
import { RouteJSON, MakeUrlOptions, MakeSignedUrlOptions } from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

const proxyCache = new QuickLru({ maxSize: 100 })

/**
 * Makes input string consistent by having only the starting
 * slash
 */
export function dropSlash (input: string): string {
  if (input === '/') {
    return '/'
  }

  return `/${input.replace(/^\//, '').replace(/\/$/, '')}`
}

/**
 * Converts and array of routes or route groups or route resource to a flat
 * list of route defination.
 */
export function toRoutesJSON (
  routes: (RouteGroup | RouteResource | Route | BriskRoute)[],
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
      if (route.route) {
        list.push(route.route.toJSON())
      }
      return list
    }

    if (!route.deleted) {
      list.push(route.toJSON())
    }

    return list
  }, [])
}

/**
 * Makes url for a route pattern and params and querystring.
 */
export function processPattern (pattern: string, data: any): string {
  let url = pattern

  if (url.indexOf(':') > -1) {
    /*
     * Split pattern when route has dynamic segments
     */
    const tokens = url.split('/')

    /*
     * Lookup over the route tokens and replace them the params values
     */
    url = tokens.map((token) => {
      if (!token.startsWith(':')) {
        return token
      }

      const isOptional = token.endsWith('?')
      const paramName = token.replace(/^:/, '').replace(/\?$/, '')
      const param = data[paramName]

      /*
       * A required param is always required to make the complete URL
       */
      if (!param && !isOptional) {
        throw new Exception(
          `\`${paramName}\` param is required to make URL for \`${pattern}\` route`,
          500,
          'E_MISSING_ROUTE_PARAM_VALUE',
        )
      }

      return param
    }).join('/')
  }

  return url
}

/**
 * Returns a boolean telling if the return value must be used as
 * the response body or not
 */
export function useReturnValue (returnValue: any, ctx: HttpContextContract) {
  return (
    returnValue !== undefined && // Return value is explicitly defined
    returnValue !== ctx.response && // Return value is not the instance of response object
    !ctx.response.hasLazyBody // Lazy body is not set
  )
}

/**
 * Since finding the trusted proxy based upon the remote address
 * is an expensive function, we cache its result
 */
export function trustProxy (
  remoteAddress: string,
  proxyFn: (addr: string, distance: number) => boolean,
): boolean {
  if (proxyCache.has(remoteAddress)) {
    return proxyCache.get(remoteAddress) as boolean
  }

  const result = proxyFn(remoteAddress, 0)
  proxyCache.set(remoteAddress, result)
  return result
}

/**
 * Normalizes the make url options by allowing params to appear on
 * top level object with option to nest inside `params` property.
 */
export function normalizeMakeUrlOptions (options?: MakeUrlOptions): Required<MakeUrlOptions> {
  const params = options ? (options.params ? options.params : options) : {}
  const qs = options && options.qs ? options.qs : {}
  const domainParams = options && options.domainParams ? options.domainParams : {}
  const prefixDomain = options && options.prefixDomain !== undefined ? options.prefixDomain : true
  return { params, qs, domainParams, prefixDomain }
}

/**
 * Normalizes the make signed url options by allowing params to appear on
 * top level object with option to nest inside `params` property.
 */
export function normalizeMakeSignedUrlOptions (
  options?: MakeSignedUrlOptions,
): Required<MakeUrlOptions> & { purpose?: string, expiresIn?: string | number } {
  const params = options ? (options.params ? options.params : options) : {}
  const qs = options && options.qs ? options.qs : {}
  const domainParams = options && options.domainParams ? options.domainParams : {}
  const prefixDomain = options && options.prefixDomain !== undefined ? options.prefixDomain : true
  const expiresIn = options && options.expiresIn !== undefined ? options.expiresIn : undefined
  const purpose = options && options.purpose ? options.purpose : undefined

  return {
    params,
    qs,
    domainParams,
    prefixDomain,
    expiresIn,
    purpose,
  }
}
