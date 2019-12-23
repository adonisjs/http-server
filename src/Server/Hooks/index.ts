/**
 * @module @adonisjs/http-server
 */

/*
* @adonisjs/http-server
*
* (c) Harminder Virk <virk@adonisjs.com>
*
* For the full copyright and license information, please view the LICENSE
* file that was distributed with this source code.
*/

/// <reference path="../../../adonis-typings/index.ts" />

import { HookNode, HooksContract } from '@ioc:Adonis/Core/Server'
import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'

/**
 * Exposes to API to register and execute before and after hooks
 */
export class Hooks implements HooksContract {
  /**
   * Registered before and after hooks
   */
  private hooks: {
    before: HookNode[],
    after: HookNode[],
  } = {
    before: [],
    after: [],
  }

  /**
   * Register before hook
   */
  public before (cb: HookNode): this {
    this.hooks.before.push(cb)
    return this
  }

  /**
   * Register after hook
   */
  public after (cb: HookNode): this {
    this.hooks.after.push(cb)
    return this
  }

  /**
   * Executing before hooks in series. If this method returns `true`,
   * it means that one of the before hooks wants to end the request
   * without further processing it.
   */
  public async executeBefore (ctx: HttpContextContract): Promise<boolean> {
    for (let hook of this.hooks.before) {
      await hook(ctx)

      /**
       * We must break the loop when one of the hooks set the response
       */
      if (ctx.response.hasLazyBody || !ctx.response.isPending) {
        return true
      }
    }
    return false
  }

  /**
   * Executes after hooks in series.
   */
  public async executeAfter (ctx: HttpContextContract) {
    for (let hook of this.hooks.after) {
      await hook(ctx)
    }
  }

  /**
   * The commit action enables us to optimize the hook handlers
   * for runtime peformance
   */
  public commit () {
    if (this.hooks.before.length === 0) {
      this.executeBefore = async () => false
    }

    if (this.hooks.after.length === 0) {
      this.executeAfter = async () => {}
    }
  }
}
