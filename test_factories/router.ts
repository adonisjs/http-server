/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type Encryption from '@adonisjs/encryption'
import type { Application } from '@adonisjs/application'

import { AppFactory } from './app.js'
import { Router } from '../src/router/main.js'
import { EncryptionFactory } from './encryption.js'
import type { LazyImport } from '../src/types/base.js'
import { QsParserFactory } from './qs_parser_factory.js'
import { MiddlewareStore } from '../src/middleware/store.js'
import type { MiddlewareAsClass } from '../src/types/middleware.js'

type FactoryParameters<NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>>> = {
  app: Application
  encryption: Encryption
  middlewareStore: MiddlewareStore<NamedMiddleware>
}

/**
 * Router factory is used to generate router class instances for
 * testing
 */
export class RouterFactory<
  NamedMiddleware extends Record<string, LazyImport<MiddlewareAsClass>> = any
> {
  #parameters: Partial<FactoryParameters<NamedMiddleware>> = {}

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
   * Returns an instance of the middleware store
   */
  #createMiddlewareStore() {
    return this.#parameters.middlewareStore || new MiddlewareStore([], {} as NamedMiddleware)
  }

  /**
   * Merge factory params
   */
  merge(params: Partial<FactoryParameters<NamedMiddleware>>) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create router instance
   */
  create() {
    return new Router<NamedMiddleware>(
      this.#getApp(),
      this.#createEncryption(),
      this.#createMiddlewareStore(),
      new QsParserFactory().create()
    )
  }
}
