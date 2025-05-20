/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'
import { EncryptionFactory } from '@adonisjs/encryption/factories'

import { RouterFactory } from './router.js'
import { URLBuilder } from '../src/url_builder.js'
import type { Router } from '../src/router/main.js'
import type { LookupList } from '../src/types/url_builder.js'

type FactoryParameters = {
  router: Router
  encryption: Encryption
}

/**
 * URLBuilderFactory is used to create a URLBuilder instance for testing
 */
export class URLBuilderFactory<Routes extends LookupList> {
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns an instance of the router
   */
  #createRouter() {
    return this.#parameters.router || new RouterFactory().create()
  }

  /**
   * Returns an instance of the encryptor to encrypt
   * signed URLs
   */
  #createEncryption() {
    return this.#parameters.encryption || new EncryptionFactory().create()
  }

  /**
   * Merge factory params
   */
  merge(params: Partial<FactoryParameters>) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create URL builder helpers
   */
  create() {
    return new URLBuilder<Routes>(this.#createRouter(), this.#createEncryption())
  }
}
