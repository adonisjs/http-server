/**
 * @module @adonisjs/http-server
 */

/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../adonis-typings/index.ts" />

import { stringify } from 'querystring'
import { Exception } from '@poppinss/utils'

import { Route } from './Router/Route'
import { RouteGroup } from './Router/Group'
import { BriskRoute } from './Router/BriskRoute'
import { RouteResource } from './Router/Resource'
import { RouteDefinition } from '@ioc:Adonis/Core/Route'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

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
): RouteDefinition[] {
  return routes.reduce((list: RouteDefinition[], route) => {
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
export function makeUrl (pattern: string, options: { params: any, qs: any }): string {
  let url = pattern

  if (url.indexOf(':') > -1) {
    /**
     * Split pattern when route has dynamic segments
     */
    const tokens = url.split('/')

    /**
     * Lookup over the route tokens and replace them the params values
     */
    url = tokens.map((token) => {
      if (!token.startsWith(':')) {
        return token
      }

      const isOptional = token.endsWith('?')
      const paramName = token.replace(/^:/, '').replace(/\?$/, '')
      const param = options.params[paramName]

      /**
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

  /**
   * Stringify query string and append to the URL (if exists)
   */
  const qs = stringify(options.qs)
  return qs ? `${url}?${qs}` : url
}

/**
 * Returns a boolean telling if the return value must be used as
 * the response body or not
 */
export function useReturnValue (returnValue: any, ctx: HttpContextContract) {
  return (
    returnValue !== undefined &&            // Return value is explicitly defined
    returnValue !== ctx.response &&         // Return value is not the instance of response object
    !ctx.response.hasLazyBody               // Lazy body is not set
  )
}
