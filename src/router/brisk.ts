/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Macroable from '@poppinss/macroable'
import type { Application } from '@adonisjs/application'

import { Route } from './route.ts'
import type { HttpContext } from '../http_context/main.ts'
import type { RouteFn, RouteMatchers } from '../types/route.ts'
import type { ParsedGlobalMiddleware } from '../types/middleware.ts'
import type {
  RoutesList,
  LookupList,
  URLOptions,
  GetRoutesForMethod,
  RouteBuilderArguments,
} from '../types/url_builder.ts'

/**
 * Options for declarative route redirects
 */
type RedirectResponseOptions = {
  /** HTTP status code for the redirect response */
  status?: number
  /** Whether to forward the incoming request query string */
  forwardQueryString?: boolean
}

type RedirectOptions = URLOptions & RedirectResponseOptions

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
  #app: Application<any>

  /**
   * Middleware registered on the router
   */
  #routerMiddleware: ParsedGlobalMiddleware[]

  /**
   * Reference to route instance. Set after `setHandler` is called
   */
  route: null | Route = null

  /**
   * Creates a new BriskRoute instance
   * @param app - The AdonisJS application instance
   * @param routerMiddleware - Array of global middleware registered on the router
   * @param options - Configuration options for the brisk route
   */
  constructor(
    app: Application<any>,
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
   * @param handler - The route handler function
   * @returns The created route instance
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
   * @param args - Route identifier, parameters, and options for building the redirect URL
   * @returns The created route instance
   */
  redirect<Identifier extends keyof GetRoutesForMethod<RoutesList, 'GET'> & string>(
    ...args: RoutesList extends LookupList
      ? RouteBuilderArguments<Identifier, RoutesList['GET'][Identifier], RedirectOptions>
      : []
  ): Route {
    const [identifier, params, options] = args as any[]

    function redirectsToRoute(ctx: HttpContext) {
      const redirector = ctx.response.redirect()
      if (options?.status) {
        redirector.status(options.status)
      }
      if (options?.forwardQueryString !== undefined) {
        redirector.withQs(options.forwardQueryString)
      }
      return (redirector.toRoute as any)(identifier, params || ctx.params, options)
    }

    Object.defineProperty(redirectsToRoute, 'listArgs', { value: identifier, writable: false })
    return this.setHandler(redirectsToRoute)
  }

  /**
   * Redirect request to a fixed URL
   * @param url - The URL to redirect to
   * @param options - Optional redirect options including HTTP status code and query string forwarding
   * @returns The created route instance
   */
  redirectToPath(url: string, options?: RedirectResponseOptions): Route {
    function redirectsToPath(ctx: HttpContext) {
      const redirector = ctx.response.redirect()
      if (options?.status) {
        redirector.status(options.status)
      }
      if (options?.forwardQueryString !== undefined) {
        redirector.withQs(options.forwardQueryString)
      }
      return redirector.toPath(url)
    }

    Object.defineProperty(redirectsToPath, 'listArgs', { value: url, writable: false })
    return this.setHandler(redirectsToPath)
  }
}
