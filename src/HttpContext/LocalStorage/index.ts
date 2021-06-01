/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { AsyncLocalStorage } from 'async_hooks'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Find if the async localstorage is enabled or not
 */
export let usingAsyncLocalStorage = false

/**
 * Toggle the async local storage
 */
export function useAsyncLocalStorage(enabled: boolean) {
  usingAsyncLocalStorage = enabled
}

/**
 * Async local storage for the HTTP context
 */
export const httpContextLocalStorage = new AsyncLocalStorage<HttpContextContract>()
