/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Macroable } from '@poppinss/macroable'
import type { Application } from '@adonisjs/application'

import { Route } from './route.js'
import type { ParsedGlobalMiddleware } from '../types/middleware.js'
import type { MakeUrlOptions, RouteFn, RouteMatchers } from '../types/route.js'

/**
 * Brisk routes exposes the API to configure the route handler by chaining
 * one of the pre-defined methods.
 *
 * For example: Instead of defining the redirect logic as a callback, one can
 * chain the `.redirect` method.
 *
 * Brisk routes are always registered under the `GET` HTTP method.
 */
export class BriskRoute extends Macroable {
  /**
   * Route pattern
   */
  #pattern: string

  /**
   * Matchers inherited from the router
   */
  #globalMatchers: RouteMatchers

  /**
   * Reference to the AdonisJS application
   */
  #app: Application<any, any>

  /**
   * Middleware registered on the router
   */
  #routerMiddleware: ParsedGlobalMiddleware[]

  /**
   * Reference to route instance. Set after `setHandler` is called
   */
  route: null | Route = null

  constructor(
    app: Application<any, any>,
    routerMiddleware: ParsedGlobalMiddleware[],
    options: {
      pattern: string
      globalMatchers: RouteMatchers
    }
  ) {
    super()
    this.#app = app
    this.#routerMiddleware = routerMiddleware
    this.#pattern = options.pattern
    this.#globalMatchers = options.globalMatchers
  }

  /**
   * Set handler for the brisk route
   */
  setHandler(handler: RouteFn): Route {
    this.route = new Route(this.#app, this.#routerMiddleware, {
      pattern: this.#pattern,
      globalMatchers: this.#globalMatchers,
      methods: ['GET', 'HEAD'],
      handler: handler,
    })

    return this.route
  }

  /**
   * Redirects to a given route. Params from the original request will
   * be used when no custom params are defined.
   */
  redirect(
    identifier: string,
    params?: any[] | Record<string, any>,
    options?: MakeUrlOptions
  ): Route {
    return this.setHandler(async (ctx) => {
      return ctx.response.redirect().toRoute(identifier, params || ctx.params, options)
    })
  }

  /**
   * Redirect request to a fixed URL
   */
  redirectToPath(url: string): Route {
    return this.setHandler(async (ctx) => {
      return ctx.response.redirect().toPath(url)
    })
  }
}
