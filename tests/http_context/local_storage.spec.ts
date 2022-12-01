/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { test } from '@japa/runner'
import { HttpContext } from '../../src/http_context/main.js'
import { asyncLocalStorage } from '../../src/http_context/local_storage.js'
import { HttpContextFactory } from '../../test_factories/http_context.js'

test.group('Http context | local storage', () => {
  test('get http context inside a local storage scope', async ({ assert }) => {
    assert.plan(2)

    const ctx = new HttpContextFactory().create()
    const localStorage = asyncLocalStorage.create()

    async function middleware() {
      assert.strictEqual(localStorage.getStore(), ctx)
    }
    async function controller() {
      assert.strictEqual(localStorage.getStore(), ctx)
    }

    await localStorage.run(ctx, async () => {
      await middleware()
      await controller()
    })
  })

  test('maintain context scope during parallel calls', async ({ assert }) => {
    assert.plan(10)

    const localStorage = asyncLocalStorage.create()

    class Scope {
      context!: HttpContext

      async middleware() {
        assert.strictEqual(localStorage.getStore(), this.context)
      }

      async controller() {
        assert.strictEqual(localStorage.getStore(), this.context)
      }

      create() {
        this.context = new HttpContextFactory().create()
        return localStorage.run(this.context, async () => {
          await this.middleware()
          await this.controller()
        })
      }
    }

    await Promise.all([
      new Scope().create(),
      new Scope().create(),
      new Scope().create(),
      new Scope().create(),
      new Scope().create(),
    ])
  })

  test('maintain context scope within setTimeout', async ({ assert }) => {
    assert.plan(10)

    const localStorage = asyncLocalStorage.create()

    class Scope {
      context!: HttpContext

      middleware() {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            assert.strictEqual(localStorage.getStore(), this.context)
            resolve()
          })
        })
      }

      controller() {
        return new Promise<void>((resolve) => {
          setTimeout(() => {
            assert.strictEqual(localStorage.getStore(), this.context)
            resolve()
          })
        })
      }

      create() {
        this.context = new HttpContextFactory().create()
        return localStorage.run(this.context, async () => {
          await this.middleware()
          await this.controller()
        })
      }
    }

    await Promise.all([
      new Scope().create(),
      new Scope().create(),
      new Scope().create(),
      new Scope().create(),
      new Scope().create(),
    ])
  })
})
