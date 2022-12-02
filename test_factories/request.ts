/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Socket } from 'node:net'
import proxyAddr from 'proxy-addr'
import type Encryption from '@adonisjs/encryption'
import { IncomingMessage, ServerResponse } from 'node:http'

import { Request } from '../src/request.js'
import { EncryptionFactory } from './encryption.js'
import { RequestConfig } from '../src/types/request.js'

type FactoryParameters = {
  url: string
  method: string
  req: IncomingMessage
  res: ServerResponse
  encryption: Encryption
  config: Partial<RequestConfig>
}

/**
 * Request factory is used to generate request class instances for
 * testing
 */
export class RequestFactory {
  #parameters: Partial<FactoryParameters> = {}

  /**
   * Returns the config for the request class
   */
  #getConfig() {
    return {
      allowMethodSpoofing: false,
      trustProxy: proxyAddr.compile('loopback'),
      subdomainOffset: 2,
      generateRequestId: true,
      useAsyncLocalStorage: Boolean(process.env.ASYNC_HOOKS),
      ...this.#parameters.config,
    }
  }

  /**
   * Returns the HTTP req object
   */
  #createRequest() {
    const req = this.#parameters.req || new IncomingMessage(new Socket())
    if (this.#parameters.url) {
      req.url = this.#parameters.url
    }

    if (this.#parameters.method) {
      req.method = this.#parameters.method
    }

    return req
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
   * Create request
   */
  create() {
    const req = this.#createRequest()
    return new Request(req, this.#createResponse(req), this.#createEncryption(), this.#getConfig())
  }
}
