/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../adonis-typings/index.ts" />

import Cache from 'tmp-cache'
import { stat, Stats } from 'fs'

import { Route } from './Router/Route'
import { RouteGroup } from './Router/Group'
import { BriskRoute } from './Router/BriskRoute'
import { RouteResource } from './Router/Resource'
import { RouterException } from './Exceptions/RouterException'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import { RouteJSON, MakeUrlOptions, MakeSignedUrlOptions } from '@ioc:Adonis/Core/Route'

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
 * Converts and array of routes or route groups or route resource to a flat
 * list of route defination.
 */
export function toRoutesJSON(
  routes: (RouteGroup | RouteResource | Route | BriskRoute)[]
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
export function processPattern(pattern: string, data: any): string {
  let url = pattern

  if (url.indexOf(':') > -1) {
    /*
     * Split pattern when route has dynamic segments
     */
    const tokens = url.split('/')

    /*
     * Lookup over the route tokens and replace them the params values
     */
    url = tokens
      .map((token) => {
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
          throw RouterException.cannotMakeRoute(paramName, pattern)
        }

        return param
      })
      .join('/')
  }

  return url
}

/**
 * Returns a boolean telling if the return value must be used as
 * the response body or not
 */
export function useReturnValue(returnValue: any, ctx: HttpContextContract) {
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
 * Invokes a callback if any of the defined keys is part of the values object
 */
function onIntersect(values: any, keys: string[], callback: (key: string) => void) {
  if (Array.isArray(values)) {
    return
  }

  const valueKeys = Object.keys(values)
  const matchingKey = keys.find((key) => valueKeys.includes(key))
  if (matchingKey) {
    callback(matchingKey)
  }
}

/**
 * Normalizes the makeURL options to work with the new API and the old
 * one as well
 */
export function normalizeMakeUrlOptions(params?: any[] | MakeUrlOptions, options?: MakeUrlOptions) {
  /**
   * Params used to be options earlier. So we are checking a few properties of it
   */
  params = params || {}
  options = options || {}

  const normalizedParams = params['params'] ? params['params'] : params
  const qs = options.qs || params['qs']
  const domain = options.domain || params['domain']
  const prefixUrl = options.prefixUrl || params['prefixUrl']

  /**
   * Using legacy options
   */
  onIntersect(params, ['prefixDomain', 'domainParams', 'qs', 'params'], () => {
    process.emitWarning(
      'DeprecationWarning',
      'You are using legacy the API of the "Route.makeUrl". We recommend reading the docs and use the latest API'
    )
  })

  return { params: normalizedParams, qs, domain, prefixUrl }
}

/**
 * Normalizes the make signed url options by allowing params to appear on
 * top level object with option to nest inside `params` property.
 */
export function normalizeMakeSignedUrlOptions(
  params?: any[] | MakeSignedUrlOptions,
  options?: MakeSignedUrlOptions
) {
  /**
   * Params used to be options earlier. So we are checking a few properties of it
   */
  params = params || {}
  options = options || {}

  const normalizedParams = params['params'] ? params['params'] : params
  const qs = options.qs || params['qs']
  const expiresIn = options.expiresIn || params['expiresIn']
  const purpose = options.purpose || params['purpose']
  const domain = options.domain
  const prefixUrl = options.prefixUrl

  /**
   * Using legacy options
   */
  onIntersect(
    params,
    ['prefixDomain', 'domainParams', 'qs', 'params', 'purpose', 'expiresIn'],
    () => {
      process.emitWarning(
        'DeprecationWarning',
        'You are using legacy the API of the "Route.makeSignedUrl". We recommend reading the docs and use the latest API'
      )
    }
  )

  return { params: normalizedParams, qs, domain, prefixUrl, expiresIn, purpose }
}

/**
 * Wraps `fs.stat` to promise interface.
 */
export function statFn(filePath: string): Promise<Stats> {
  return new Promise((resolve, reject) => {
    stat(filePath, (error, stats) => {
      if (error) {
        reject(error)
        return
      }
      resolve(stats)
    })
  })
}
