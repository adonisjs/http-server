/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import type { HttpContext } from './main.js'

/**
 * Async local storage for HTTP context
 */
export const asyncLocalStorage: {
  isEnabled: boolean
  storage: null | AsyncLocalStorage<HttpContext>
  create(): AsyncLocalStorage<HttpContext>
  destroy(): void
} = {
  /**
   * Check if the async local storage for the HTTP
   * context is enabled or not
   */
  isEnabled: false,

  /**
   * HTTP context storage instance for the current scope
   */
  storage: null,

  /**
   * Create the storage instance. This method must be called only
   * once.
   */
  create() {
    this.isEnabled = true
    this.storage = new AsyncLocalStorage<HttpContext>()
    return this.storage
  },

  /**
   * Destroy the create storage instance
   */
  destroy() {
    this.isEnabled = false
    this.storage = null
  },
}
