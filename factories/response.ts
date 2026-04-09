/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Socket } from 'node:net'
import type { Encryption } from '@boringnode/encryption'
import { IncomingMessage, ServerResponse } from 'node:http'
import { EncryptionFactory } from '@boringnode/encryption/factories'

import { RouterFactory } from './router.ts'
import { HttpResponse } from '../src/response.ts'
import { type Router } from '../src/router/main.ts'
import { QsParserFactory } from './qs_parser_factory.ts'
import { type ResponseConfig } from '../src/types/response.ts'
import { safeStringify } from '@poppinss/utils/json'

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
export class HttpResponseFactory {
  /**
   * Factory parameters for creating response instances
   */
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the config for the request class
   */
  #getConfig() {
    return {
      etag: false,
      serializeJSON: safeStringify,
      jsonpCallbackName: 'callback',
      redirect: {
        allowedHosts: [] as string[],
        forwardQueryString: false,
      },
      cookie: {
        maxAge: 90,
        path: '/',
        httpOnly: true,
        sameSite: false,
        secure: false,
      },
      ...this.#parameters.config,
    } satisfies ResponseConfig
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
   * @param req - The incoming message request object
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
   * @param params - Partial factory parameters to merge
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

    return new HttpResponse(
      req,
      this.#createResponse(req),
      this.#createEncryption(),
      this.#getConfig(),
      this.#createRouter(),
      new QsParserFactory().create()
    )
  }
}
