/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { type Container, type ContainerResolver, moduleImporter } from '@adonisjs/fold'

import type { LazyImport, UnWrapLazyImport } from '../types/base.js'
import type { GetMiddlewareArgs, MiddlewareAsClass } from '../types/middleware.js'

/**
 * Middleware store is used to register middleware as lazy imports and resolve
 * them as handle method objects.
 */
export class MiddlewareStore<
  NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>>
> {
  /**
   * Named middleware is an object of key-value pair
   */
  #namedMiddleware: NamedMiddleware

  /**
   * An array of global middleware
   */
  #middleware: LazyImport<MiddlewareAsClass>[]

  /**
   * Cache of resolved middleware. This is done to avoid creating too many
   * functions for a single lazily imported module.
   */
  #resolvedMiddleware: Map<
    keyof NamedMiddleware,
    { handle: (container: Container<any> | ContainerResolver<any>, ...args: any[]) => any }
  > = new Map()

  constructor(middleware: LazyImport<MiddlewareAsClass>[], namedMiddleware: NamedMiddleware) {
    this.#middleware = middleware
    this.#namedMiddleware = namedMiddleware
  }

  /**
   * Returns the handle method object for a given named middleware
   */
  get<Name extends keyof NamedMiddleware>(
    name: Name,
    args: GetMiddlewareArgs<UnWrapLazyImport<NamedMiddleware[Name]>>
  ) {
    if (this.#resolvedMiddleware.has(name)) {
      return {
        name,
        args,
        ...this.#resolvedMiddleware.get(name)!,
      }
    }

    const handler = moduleImporter(this.#namedMiddleware[name], 'handle').toHandleMethod()
    this.#resolvedMiddleware.set(name, handler)

    return {
      name,
      args,
      ...handler,
    }
  }

  /**
   * Returns an array of functions to resolved and invoke global
   * middleware
   */
  list() {
    return this.#middleware.map((middleware) =>
      moduleImporter(middleware, 'handle').toHandleMethod()
    )
  }
}
