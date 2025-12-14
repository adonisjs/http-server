/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@boringnode/encryption'
import type { Application } from '@adonisjs/application'
import { AppFactory } from '@adonisjs/application/factories'
import { EncryptionFactory } from '@boringnode/encryption/factories'

import { Router } from '../src/router/main.ts'
import { QsParserFactory } from './qs_parser_factory.ts'

type FactoryParameters = {
  app: Application<any>
  encryption: Encryption
}

/**
 * Router factory is used to generate router class instances for
 * testing
 */
export class RouterFactory {
  /**
   * Factory parameters for creating router instances
   */
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns an instance of the application class
   */
  #getApp() {
    return this.#parameters.app || new AppFactory().create(new URL('./app/', import.meta.url))
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
   * @param params - Partial factory parameters to merge
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
