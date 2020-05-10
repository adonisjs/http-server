/*
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Redirect' {
  import { MakeUrlOptions } from '@ioc:Adonis/Core/Route'

  export interface RedirectContract {
    status (statusCode: number): this
    withQs (): this
    withQs (values: { [key: string]: any }): this
    withQs (name: string, value: any): this

    back (): void
    toRoute (routeIdentifier: string, urlOptions?: MakeUrlOptions, domain?: string): void
    toPath (url: string): void
  }
}
