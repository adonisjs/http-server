/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { parse, stringify } from 'neoqs'
import { QSParserConfig } from './types/qs.js'

/**
 * Query string parser used to parse and stringify query
 * strings.
 */
export class Qs {
  #config: QSParserConfig

  constructor(config: QSParserConfig) {
    this.#config = config
  }

  parse(value: string) {
    return parse(value, this.#config.parse)
  }

  stringify(value: any) {
    return stringify(value, this.#config.stringify)
  }
}
