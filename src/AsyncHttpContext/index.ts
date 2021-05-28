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

export let asyncHttpContextEnabled = false

export function setAsyncHttpContextEnabled(enabled: boolean) {
  asyncHttpContextEnabled = enabled
}

export const adonisLocalStorage = new AsyncLocalStorage<AsyncHttpContext>()

export class AsyncHttpContext {
  constructor(private ctx: HttpContextContract) {}

  public getContext() {
    return this.ctx
  }

  public run(callback: () => any) {
    return adonisLocalStorage.run(this, callback)
  }
}
