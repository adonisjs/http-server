/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { HttpContext } from './http_context/main.ts'

/**
 * Schedule a promise to be settled after the response for the current HTTP
 * request has been sent to the client.
 *
 * This function is a sugar around "ctx.waitUntil()" and reads the HTTP
 * context from the async local storage. Therefore, it requires
 * "useAsyncLocalStorage" to be enabled inside "config/app.ts".
 *
 * @example
 * ```ts
 * import { waitUntil } from '@adonisjs/http-server'
 *
 * export default function ({ request }: HttpContext) {
 *   waitUntil(logAnalytics(request.url()))
 *   return 'ok'
 * }
 * ```
 *
 * @throws RuntimeException when async local storage is disabled or when
 * called outside of an HTTP request.
 */
export function waitUntil(promise: PromiseLike<unknown>): void {
  HttpContext.getOrFail().waitUntil(promise)
}
