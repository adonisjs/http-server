/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Macroable from '@poppinss/macroable'

/**
 * Shortcut methods for commonly used route matchers
 */
export class RouteMatchers extends Macroable {
  /**
   * Enforce value to be a number and also casts it to number data
   * type
   */
  number() {
    return { match: /^[0-9]+$/, cast: (value: string) => Number(value) }
  }

  /**
   * Enforce value to be formatted as uuid
   */
  uuid() {
    return {
      match: /^[0-9a-zA-F]{8}-[0-9a-zA-F]{4}-[0-9a-zA-F]{4}-[0-9a-zA-F]{4}-[0-9a-zA-F]{12}$/,
      cast: (value: string) => value.toLowerCase(),
    }
  }

  /**
   * Enforce value to be formatted as slug
   */
  slug() {
    return { match: /^[^\s-_](?!.*?[-_]{2,})([a-z0-9-\\]{1,})[^\s]*[^-_\s]$/ }
  }
}
