/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { moduleImporter } from '@adonisjs/fold'
import type { LazyImport, UnWrapLazyImport } from './types/base.js'
import type {
  GetMiddlewareArgs,
  MiddlewareAsClass,
  ParsedGlobalMiddleware,
} from './types/middleware.js'

/**
 * Converts a middleware name and its lazy import to a factory function. The function
 * can than later be used to reference the middleware with different arguments
 * every time.
 */
function middlewareReferenceBuilder(
  name: string | number | symbol,
  middleware: LazyImport<MiddlewareAsClass>
) {
  const handler = moduleImporter(middleware, 'handle').toHandleMethod()
  return function (...args: any[]) {
    return {
      name,
      args: args[0],
      ...handler,
    }
  }
}

/**
 * Define an collection of named middleware. The collection gets converted
 * into a collection of factory functions. Calling the function returns
 * a reference to the executable middleware.
 */
export function defineNamedMiddleware<
  NamedMiddleware extends Record<string | number | symbol, LazyImport<MiddlewareAsClass>>
>(collection: NamedMiddleware) {
  return Object.keys(collection).reduce(
    (result, key: keyof NamedMiddleware) => {
      result[key] = middlewareReferenceBuilder(key, collection[key])
      return result
    },
    {} as {
      [K in keyof NamedMiddleware]: <
        Args extends GetMiddlewareArgs<UnWrapLazyImport<NamedMiddleware[K]>>
      >(
        ...args: Args
      ) => {
        name: K
        args: Args[0]
      } & ParsedGlobalMiddleware
    }
  )
}
