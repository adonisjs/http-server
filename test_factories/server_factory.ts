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
import { Server } from '../src/server/main.js'
import { EncryptionFactory } from './encryption.js'

import { defineConfig } from '../src/define_config.js'
import type { ServerConfig } from '../src/types/server.js'

type FactoryParameters = {
  app: Application<any, any>
  encryption: Encryption
  config: Partial<ServerConfig>
}

/**
 * Server factory is used to generate server class instances for
 * testing
 */
export class ServerFactory {
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the config for the server class
   */
  #getConfig() {
    return defineConfig(this.#parameters.config || {})
  }

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
   * Create server instance
   */
  create() {
    return new Server(this.#getApp(), this.#createEncryption(), this.#getConfig())
  }
}
