/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Socket } from 'node:net'
import { Container } from '@adonisjs/fold'
import type { Logger } from '@adonisjs/logger'
import type { Encryption } from '@boringnode/encryption'
import { safeStringify } from '@poppinss/utils/json'
import { LoggerFactory } from '@adonisjs/logger/factories'
import { IncomingMessage, ServerResponse } from 'node:http'
import { EncryptionFactory } from '@boringnode/encryption/factories'

import { RouterFactory } from './router.ts'
import { HttpResponse } from '../src/response.ts'
import { HttpRequestFactory } from './request.ts'
import { type Router } from '../src/router/main.ts'
import type { HttpRequest } from '../src/request.ts'
import { QsParserFactory } from './qs_parser_factory.ts'
import { HttpContext } from '../src/http_context/main.ts'
import { type ResponseConfig } from '../src/types/response.ts'

type FactoryParameters = {
  req: IncomingMessage
  res: ServerResponse
  encryption: Encryption
  config: Partial<ResponseConfig>
  router: Router
  logger: Logger
  request: HttpRequest
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
   * Returns the logger instance
   */
  #createLogger() {
    return this.#parameters.logger || new LoggerFactory().create()
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
    const res = this.#createResponse(req)
    const encryption = this.#createEncryption()

    const response = new HttpResponse(
      req,
      res,
      encryption,
      this.#getConfig(),
      this.#createRouter(),
      new QsParserFactory().create()
    )

    /**
     * Wire up the HTTP context so that `response.ctx` is available, mirroring
     * the runtime where every response belongs to a context. The request is
     * reused when provided, so callers like `HttpRequestFactory` can share a
     * single request/response pair without creating a recursive factory loop.
     */
    const request =
      this.#parameters.request || new HttpRequestFactory().merge({ req, res, encryption }).create()
    new HttpContext(request, response, this.#createLogger(), new Container().createResolver())

    return response
  }
}
