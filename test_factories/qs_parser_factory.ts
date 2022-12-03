/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Qs } from '../src/qs.js'
import type { QSParserConfig } from '../src/types/qs.js'

/**
 * QS Parser factory is used to generate the query string
 * parser for testing
 */
export class QsParserFactory {
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
   * Merge encryption factory options
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
   * Create instance of the logger class
   */
  create() {
    return new Qs(this.#options)
  }
}
