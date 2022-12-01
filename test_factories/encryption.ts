/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import Encryption from '@adonisjs/encryption'
import { EncryptionOptions } from '@adonisjs/encryption/types'

/**
 * Encryption factory is used to generate encryption class instances for
 * testing
 */
export class EncryptionFactory {
  #options: EncryptionOptions = {
    secret: 'averylongrandomsecretkey',
  }

  /**
   * Merge encryption factory options
   */
  merge(options: Partial<EncryptionOptions>) {
    Object.assign(this.#options, options)
    return this
  }

  /**
   * Create instance of encryption class
   */
  create() {
    return new Encryption(this.#options)
  }
}
