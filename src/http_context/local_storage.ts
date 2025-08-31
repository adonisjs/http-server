/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { AsyncLocalStorage } from 'node:async_hooks'
import type { HttpContext } from './main.ts'

/**
 * Async local storage for HTTP context
 */
/**
 * Async local storage for HTTP context
 */
export const asyncLocalStorage: {
  /**
   * Check if the async local storage for the HTTP context is enabled or not
   */
  isEnabled: boolean
  /**
   * HTTP context storage instance for the current scope
   */
  storage: null | AsyncLocalStorage<HttpContext>
  /**
   * Create the storage instance. This method must be called only once.
   *
   * @returns {AsyncLocalStorage<HttpContext>} The created storage instance
   */
  create(): AsyncLocalStorage<HttpContext>
  /**
   * Destroy the create storage instance
   */
  destroy(): void
} = {
  isEnabled: false,

  storage: null,

  create(): AsyncLocalStorage<HttpContext> {
    this.isEnabled = true
    this.storage = new AsyncLocalStorage<HttpContext>()
    return this.storage
  },

  destroy(): void {
    this.isEnabled = false
    this.storage = null
  },
}
