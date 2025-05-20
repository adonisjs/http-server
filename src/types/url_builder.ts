/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Prettify } from '@poppinss/types'

/**
 * Options accepted by "url" and "route" helper methods
 */
export type URLOptions = {
  qs?: Record<string, any>
  prefixUrl?: string
}

/**
 * Options accepted by "signedUrl" and "signedRoute" helper methods
 */
export type SignedURLOptions = URLOptions & {
  expiresIn?: string | number
  purpose?: string
}

/**
 * Returns params for a route identifier
 */
export type RouteBuilderArguments<
  Routes,
  Identifier extends keyof Routes,
  Options extends any = URLOptions,
> = Routes extends LookupList
  ? Prettify<
      [undefined] extends [Routes[Identifier]['params']]
        ? [
            identifier: Identifier,
            params?: Routes[Identifier]['params'] | Routes[Identifier]['paramsTuple'],
            options?: Options,
          ]
        : [
            identifier: Identifier,
            params: Routes[Identifier]['params'] | Routes[Identifier]['paramsTuple'],
            options?: Options,
          ]
    >
  : never

/**
 * LookupList type is used by the URLBuilder to provide
 * type-safety when creating URLs.
 *
 * There is no runtime property that matches this type. Its
 * purely for type-inference.
 */
export type LookupList = {
  [identifier: string]: {
    paramsTuple?: [...any[]]
    params?: {
      [name: string]: any
    }
  }
}
