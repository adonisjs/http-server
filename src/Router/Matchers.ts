/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../../adonis-typings/index.ts" />

import { Macroable } from 'macroable'
import { RouteMatchersContract } from '@ioc:Adonis/Core/Route'

/**
 * Shortcut methods for commonly used route matchers
 */
export class RouteMatchers extends Macroable implements RouteMatchersContract {
  protected static macros = {}
  protected static getters = {}

  /**
   * Enforce value to be a number and also casts it to number data
   * type
   */
  public number(): { match: RegExp; cast: (value: string) => number } {
    return { match: /^[0-9]+$/, cast: (value) => Number(value) }
  }

  /**
   * Enforce value to be formatted as uuid
   */
  public uuid(): { match: RegExp; cast: (value: string) => string } {
    return {
      match: /^[0-9a-zA-F]{8}-[0-9a-zA-F]{4}-[0-9a-zA-F]{4}-[0-9a-zA-F]{4}-[0-9a-zA-F]{12}$/,
      cast: (value) => value.toLowerCase(),
    }
  }

  /**
   * Enforce value to be formatted as slug
   */
  public slug(): { match: RegExp } {
    return { match: /^[^\s-_](?!.*?[-_]{2,})([a-z0-9-\\]{1,})[^\s]*[^-_\s]$/ }
  }
}
