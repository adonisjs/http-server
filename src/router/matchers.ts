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
   * @returns Route matcher configuration for numeric values
   */
  number() {
    return { match: /^[0-9]+$/, cast: (value: string) => Number(value) }
  }

  /**
   * Enforce value to be formatted as uuid
   * @returns Route matcher configuration for UUID values
   */
  uuid() {
    return {
      match: /^[0-9a-zA-F]{8}-[0-9a-zA-F]{4}-[0-9a-zA-F]{4}-[0-9a-zA-F]{4}-[0-9a-zA-F]{12}$/,
      cast: (value: string) => value.toLowerCase(),
    }
  }

  /**
   * Enforce value to be formatted as slug
   * @returns Route matcher configuration for slug values
   */
  slug() {
    return { match: /^[^\s_-](?=[a-z0-9\\-])(?=.{2})(?:[^\s_-]|[-_][^\s_-])+$/ }
  }
}
