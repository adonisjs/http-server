/*
 * @adonisjs/events
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'

import { Router } from '../src/Router'
import { Server } from '../src/Server'
import { Request } from '../src/Request'
import { Response } from '../src/Response'
import { fs, setupApp } from '../test-helpers'
import { HttpContext } from '../src/HttpContext'
import { CookieClient } from '../src/Cookie/Client'
import { MiddlewareStore } from '../src/MiddlewareStore'

test.group('Http Server Provider', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('register http server provider', async (assert) => {
    const app = await setupApp(['@adonisjs/encryption', '../../providers/HttpServerProvider'])

    assert.instanceOf(app.container.use('Adonis/Core/Route'), Router)
    assert.deepEqual(app.container.use('Adonis/Core/Request'), Request)
    assert.deepEqual(app.container.use('Adonis/Core/Response'), Response)
    assert.instanceOf(app.container.use('Adonis/Core/Server'), Server)
    assert.instanceOf(app.container.use('Adonis/Core/CookieClient'), CookieClient)
    assert.deepEqual(app.container.use('Adonis/Core/MiddlewareStore'), MiddlewareStore)
    assert.deepEqual(app.container.use('Adonis/Core/HttpContext'), HttpContext)
  })
})

test.group('Http Context', (group) => {
  group.afterEach(async () => {
    await fs.cleanup()
  })

  test('create fake Http context instance', async (assert) => {
    await setupApp(['@adonisjs/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/', {})

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/')
    assert.deepEqual(ctx.route!.middleware, [])
  })

  test('compute request url from params', async (assert) => {
    await setupApp(['@adonisjs/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/:id', { id: '1' })

    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })

  test('add macro to http context', async (assert) => {
    await setupApp(['@adonisjs/encryption', '../../providers/HttpServerProvider'])
    HttpContext.macro<HttpContext>('url', function url() {
      return `user/${this.params.id}`
    })

    const ctx = HttpContext.create('/:id', { id: '1' })
    assert.instanceOf(ctx, HttpContext)
    assert.equal(ctx.route!.pattern, '/:id')
    assert.equal(ctx.request.url(), '/1')
    assert.deepEqual(ctx.params, { id: '1' })
  })

  test('pass ctx to request and response', async (assert) => {
    await setupApp(['@adonisjs/encryption', '../../providers/HttpServerProvider'])
    const ctx = HttpContext.create('/', {})
    assert.deepEqual(ctx.request.ctx, ctx)
    assert.deepEqual(ctx.response.ctx, ctx)
  })
})
