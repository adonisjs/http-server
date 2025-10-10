/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { moduleImporter } from '@adonisjs/fold'
import type { LazyImport, UnWrapLazyImport } from '@poppinss/utils/types'
import type {
  MiddlewareAsClass,
  GetMiddlewareArgs,
  ParsedNamedMiddleware,
  ParsedGlobalMiddleware,
} from './types/middleware.ts'

/**
 * Converts a middleware name and its lazy import to a factory function.
 *
 * The returned function can be used to reference the middleware with different
 * arguments every time, creating a parsed middleware object that contains all
 * necessary metadata for execution.
 *
 * @param name - The name of the middleware
 * @param middleware - Lazy import reference to the middleware class
 */
function middlewareReferenceBuilder(name: string, middleware: LazyImport<MiddlewareAsClass>) {
  const handler = moduleImporter(middleware, 'handle').toHandleMethod()
  return function (...args: any[]) {
    return {
      ...handler,
      name,
      reference: middleware,
      args: args[0],
    } satisfies ParsedNamedMiddleware
  }
}

/**
 * Define a collection of named middleware that can be referenced by name in routes and route groups.
 *
 * This function converts a collection of middleware classes into factory functions that can be
 * called with arguments to create middleware references. Each middleware in the collection
 * becomes available as a typed function that preserves the middleware's argument signature.
 *
 * @param collection - Object mapping middleware names to their lazy import references
 *
 * @example
 * ```ts
 * const namedMiddleware = defineNamedMiddleware({
 *   auth: () => import('./middleware/auth.ts'),
 *   throttle: () => import('./middleware/throttle.ts')
 * })
 *
 * // Usage in routes
 * router.get('/dashboard', [namedMiddleware.auth(), handler])
 * router.get('/api/data', [namedMiddleware.throttle({ max: 100 }), handler])
 * ```
 */
export function defineNamedMiddleware<
  NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>>,
>(collection: NamedMiddleware) {
  return Object.keys(collection).reduce(
    (result, key: keyof NamedMiddleware & string) => {
      result[key] = middlewareReferenceBuilder(key, collection[key])
      return result
    },
    {} as {
      [K in keyof NamedMiddleware]: <
        Args extends GetMiddlewareArgs<UnWrapLazyImport<NamedMiddleware[K]>>,
      >(
        ...args: Args
      ) => {
        name: K
        reference: LazyImport<MiddlewareAsClass> | MiddlewareAsClass
        args: Args[0]
        handle: ParsedGlobalMiddleware['handle']
      }
    }
  )
}
