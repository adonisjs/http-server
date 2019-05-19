/*
 * @adonisjs/server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

/// <reference path="../contracts.ts" />

import { RouteNode, HttpContextContract } from '@poppinss/http-server/contracts'
import { RequestContract } from '@poppinss/request'
import { ResponseContract } from '@poppinss/response'

export class HttpContext implements HttpContextContract {
  public params?: any
  public subdomains?: any
  public route?: RouteNode<this>

  constructor (public request: RequestContract, public response: ResponseContract) {
  }
}
