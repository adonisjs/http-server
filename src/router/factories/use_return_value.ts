/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { HttpContext } from '../../http_context/main.js'

/**
 * A factory function that uses the return value of the request
 * pipeline as the response
 */
export function useReturnValue(ctx: HttpContext) {
  return function (value: any) {
    if (
      value !== undefined && // Return value is explicitly defined
      !ctx.response.hasLazyBody && // Lazy body is not set
      value !== ctx.response // Return value is not the instance of response object
    ) {
      ctx.response.send(value)
    }
  }
}
