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
 * Query string parser used to parse and stringify query
 * strings.
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
