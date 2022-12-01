/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger } from '@adonisjs/logger'
import { LoggerConfig } from '@adonisjs/logger/types'

/**
 * Logger factory is used to generate logger class instances for
 * testing
 */
export class LoggerFactory {
  #options: LoggerConfig = {}

  /**
   * Merge encryption factory options
   */
  merge(options: LoggerConfig) {
    Object.assign(this.#options, options)
    return this
  }

  /**
   * Create instance of the logger class
   */
  create() {
    return new Logger(this.#options)
  }
}
