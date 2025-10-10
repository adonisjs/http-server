/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse, stringify } from 'qs'
import { type QSParserConfig } from './types/qs.ts'

/**
 * Query string parser that provides methods to parse and stringify query strings.
 *
 * This class wraps the popular 'qs' package with configurable options for parsing
 * and stringifying query parameters. It allows customization of array handling,
 * depth limits, and encoding behavior.
 *
 * @example
 * ```ts
 * const qs = new Qs({
 *   parse: { depth: 5, arrayLimit: 20 },
 *   stringify: { encode: false, skipNulls: true }
 * })
 *
 * const parsed = qs.parse('users[0][name]=john&users[0][age]=25')
 * const stringified = qs.stringify({ users: [{ name: 'john', age: 25 }] })
 * ```
 */
export class Qs {
  /**
   * Configuration object containing parse and stringify options for query strings
   */
  #config: QSParserConfig

  /**
   * Creates a new query string parser instance with the provided configuration
   * @param config - Configuration object with parse and stringify options
   */
  constructor(config: QSParserConfig) {
    this.#config = config
  }

  /**
   * Parses a query string into a JavaScript object using the configured options
   * @param value - Query string to parse (e.g., "foo=bar&baz=qux")
   * @returns Parsed object representation of the query string
   */
  parse = (value: string) => {
    return parse(value, this.#config.parse)
  }

  /**
   * Converts a JavaScript object into a query string using the configured options
   * @param value - Object to convert to query string
   * @returns Stringified query string representation of the object
   */
  stringify = (value: any) => {
    return stringify(value, this.#config.stringify)
  }
}
