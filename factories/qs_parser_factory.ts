/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Qs } from '../src/qs.ts'
import type { QSParserConfig } from '../src/types/qs.ts'

/**
 * QS Parser factory is used to generate the query string
 * parser for testing
 */
export class QsParserFactory {
  /**
   * Default configuration options for the QS parser
   */
  #options: QSParserConfig = {
    parse: {
      depth: 5,
      parameterLimit: 1000,
      allowSparse: false,
      arrayLimit: 20,
      comma: true,
    },
    stringify: {
      encode: true,
      encodeValuesOnly: false,
      arrayFormat: 'indices',
      skipNulls: false,
    },
  }

  /**
   * Merge QS parser factory options
   * @param options - Partial options to merge with existing configuration
   */
  merge(
    options: Partial<{
      parse: Partial<QSParserConfig['parse']>
      stringify: Partial<QSParserConfig['stringify']>
    }>
  ) {
    Object.assign(this.#options.parse, options.parse)
    Object.assign(this.#options.stringify, options.stringify)
    return this
  }

  /**
   * Create instance of the QS parser class
   */
  create() {
    return new Qs(this.#options)
  }
}
