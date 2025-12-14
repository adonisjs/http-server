/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Logger } from '@adonisjs/logger'
import { Emitter } from '@adonisjs/events'
import type { Encryption } from '@boringnode/encryption'
import type { Application } from '@adonisjs/application'
import { AppFactory } from '@adonisjs/application/factories'
import { EncryptionFactory } from '@boringnode/encryption/factories'

import { Server } from '../src/server/main.ts'
import { defineConfig } from '../src/define_config.ts'
import type { ServerConfig } from '../src/types/server.ts'

type FactoryParameters = {
  app: Application<any>
  logger: Logger
  encryption: Encryption
  emitter: Emitter<any>
  config: Partial<ServerConfig>
}

/**
 * Server factory is used to generate server class instances for
 * testing
 */
export class ServerFactory {
  /**
   * Factory parameters for creating server instances
   */
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the emitter instance
   */
  #getEmitter() {
    return this.#parameters.emitter || new Emitter(this.#getApp())
  }

  /**
   * Returns the logger instance
   */
  #getLogger() {
    return this.#parameters.logger || new Logger({ enabled: false })
  }

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
   * Create server instance
   */
  create() {
    return new Server(
      this.#getApp(),
      this.#createEncryption(),
      this.#getEmitter(),
      this.#getLogger(),
      this.#getConfig()
    )
  }
}
