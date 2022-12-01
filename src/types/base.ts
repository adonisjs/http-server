/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

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
