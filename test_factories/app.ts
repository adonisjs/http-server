/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { Application } from '@adonisjs/application'
import { AppEnvironments } from '@adonisjs/application/types'

/**
 * App factory is used to generate application class instances for
 * testing
 */
export class AppFactory {
  #parameters: Partial<{
    appRoot: URL
    options: { environment: AppEnvironments }
  }> = {}

  /**
   * Merge parameters accepted by the AppFactory
   */
  merge(
    params: Partial<{
      appRoot: URL
      options: { environment: AppEnvironments }
    }>
  ) {
    Object.assign(this.#parameters, params)
    return this
  }

  /**
   * Create application class instance
   */
  create() {
    return new Application(
      this.#parameters.appRoot || new URL('./app/', import.meta.url),
      this.#parameters.options || { environment: 'web' }
    )
  }
}
