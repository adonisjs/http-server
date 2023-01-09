/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

export type { NextFn } from '@poppinss/middleware/types'

/**
 * Accept one or more of the mentioned type
 */
export type OneOrMore<T> = T | T[]

/**
 * Class constructor type
 */
export type Constructor<T> = new (...args: any[]) => T

/**
 * A function that lazily imports a middleware
 */
export type LazyImport<DefaultExport> = () => Promise<{ default: DefaultExport }>

/**
 * Unwraps default export from a lazy import function
 */
export type UnWrapLazyImport<Fn extends LazyImport<any>> = Awaited<ReturnType<Fn>>['default']
