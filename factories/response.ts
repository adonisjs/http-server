/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Socket } from 'node:net'
import type { Encryption } from '@adonisjs/encryption'
import { IncomingMessage, ServerResponse } from 'node:http'
import { EncryptionFactory } from '@adonisjs/encryption/factories'

import { RouterFactory } from './router.ts'
import { Response } from '../src/response.ts'
import { type Router } from '../src/router/main.ts'
import { QsParserFactory } from './qs_parser_factory.ts'
import { type ResponseConfig } from '../src/types/response.ts'

type FactoryParameters = {
  req: IncomingMessage
  res: ServerResponse
  encryption: Encryption
  config: Partial<ResponseConfig>
  router: Router
}

/**
 * Response factory is used to generate response class instances for
 * testing
 */
export class ResponseFactory {
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the config for the request class
   */
  #getConfig() {
    return {
      etag: false,
      jsonpCallbackName: 'callback',
      cookie: {
        maxAge: 90,
        path: '/',
        httpOnly: true,
        sameSite: false,
        secure: false,
      },
      ...this.#parameters.config,
    }
  }

  /**
   * Returns the HTTP req object
   */
  #createRequest() {
    return this.#parameters.req || new IncomingMessage(new Socket())
  }

  /**
   * Returns an instance of the router
   */
  #createRouter() {
    return this.#parameters.router || new RouterFactory().create()
  }

  /**
   * Returns the HTTP res object
   */
  #createResponse(req: IncomingMessage) {
    return this.#parameters.res || new ServerResponse(req)
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
   * Create response class instance
   */
  create() {
    const req = this.#createRequest()

    return new Response(
      req,
      this.#createResponse(req),
      this.#createEncryption(),
      this.#getConfig(),
      this.#createRouter(),
      new QsParserFactory().create()
    )
  }
}
