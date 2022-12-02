/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { moduleImporter } from '@adonisjs/fold'
import { RuntimeException } from '@poppinss/utils'

import type { LazyImport, UnWrapLazyImport } from '../types/base.js'
import type {
  GetMiddlewareArgs,
  MiddlewareAsClass,
  ParsedGlobalMiddleware,
} from '../types/middleware.js'

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
  #namedMiddleware?: NamedMiddleware

  /**
   * An array of global middleware
   */
  #middleware: ParsedGlobalMiddleware[]

  /**
   * Cache of resolved middleware. This is done to avoid creating too many
   * functions for a single lazily imported module.
   */
  #resolvedMiddleware: Map<keyof NamedMiddleware, ParsedGlobalMiddleware> = new Map()

  constructor(middleware: LazyImport<MiddlewareAsClass>[], namedMiddleware?: NamedMiddleware) {
    this.#middleware = middleware.map((one) => moduleImporter(one, 'handle').toHandleMethod())
    this.#namedMiddleware = namedMiddleware
  }

  /**
   * Returns the handle method object for a given named middleware
   */
  get<
    Name extends keyof NamedMiddleware,
    Args extends GetMiddlewareArgs<UnWrapLazyImport<NamedMiddleware[Name]>>
  >(
    name: Name,
    ...args: Args
  ): {
    name: Name
    args: any
  } & ParsedGlobalMiddleware {
    if (this.#resolvedMiddleware.has(name)) {
      return {
        name,
        args: args[0],
        ...this.#resolvedMiddleware.get(name)!,
      }
    }

    if (!this.#namedMiddleware || !this.#namedMiddleware[name]) {
      throw new RuntimeException(
        `Cannot resolve "${String(
          name
        )}" middleware. Make sure the middleware is registered before using it`
      )
    }

    const handler = moduleImporter(this.#namedMiddleware[name], 'handle').toHandleMethod()
    this.#resolvedMiddleware.set(name, handler)

    return {
      name,
      args: args[0],
      ...handler,
    }
  }

  /**
   * Returns an array of functions to resolve and invoke global
   * middleware
   */
  list() {
    return this.#middleware
  }
}
