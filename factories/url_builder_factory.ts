/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { Encryption } from '@boringnode/encryption'
import { EncryptionFactory } from '@boringnode/encryption/factories'

import { RouterFactory } from './router.ts'
import type { Router } from '../src/router/main.ts'
import { type LookupList } from '../src/types/url_builder.ts'
import { createUrlBuilder } from '../src/client/url_builder.ts'
import { createSignedUrlBuilder } from '../src/router/signed_url_builder.ts'

type FactoryParameters = {
  router: Router
  encryption: Encryption
}

/**
 * URLBuilderFactory is used to create route and signed route helpers
 */
export class URLBuilderFactory<Routes extends LookupList> {
  /**
   * Factory parameters for creating URL builder instances
   */
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
   * @param params - Partial factory parameters to merge
   */
  merge(params: Partial<FactoryParameters>) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create URL builder helpers
   */
  create() {
    const router = this.#createRouter()

    return {
      urlFor: createUrlBuilder<Routes>(() => router.toJSON(), router.qs.stringify),
      signedUrlFor: createSignedUrlBuilder<Routes>(
        router,
        this.#createEncryption(),
        router.qs.stringify
      ),
    }
  }
}
