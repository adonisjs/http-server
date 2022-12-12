/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@adonisjs/encryption'
import type { Application } from '@adonisjs/application'

import { AppFactory } from './app.js'
import { Router } from '../src/router/main.js'
import { EncryptionFactory } from './encryption.js'
import { QsParserFactory } from './qs_parser_factory.js'

type FactoryParameters = {
  app: Application<any, any>
  encryption: Encryption
}

/**
 * Router factory is used to generate router class instances for
 * testing
 */
export class RouterFactory {
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns an instance of the application class
   */
  #getApp() {
    return this.#parameters.app || new AppFactory().create()
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
   * Create router instance
   */
  create() {
    return new Router(this.#getApp(), this.#createEncryption(), new QsParserFactory().create())
  }
}
