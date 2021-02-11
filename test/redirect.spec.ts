/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import { Socket } from 'net'
import supertest from 'supertest'
import { createServer, IncomingMessage, ServerResponse } from 'http'

import { Router } from '../src/Router'
import { Response } from '../src/Response'
import { encryption, responseConfig } from '../test-helpers'

test.group('Redirect', () => {
  test('redirect to given url', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url with query string', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=romain').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url and forward current query string', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=romain').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query string', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs('username', 'romain').toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query string overwriting the forward rules', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs().withQs('username', 'romain').toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query given as object', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response
        .redirect()
        .withQs({
          username: 'romain',
          username2: 'virk',
        })
        .toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain&username2=virk')
  })

  test('do not set query string when originally there was no query string', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url and set custom statusCode', async () => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect('/foo', false, 301)
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('redirect to given url and set custom statusCode using fluent API', async () => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().status(301).toPath('/foo')
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('redirect back to referrer', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').set('referrer', '/foo').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect back to referrer with existing query string', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs().back()
      response.finish()
    })

    const { header } = await supertest(server)
      .get('/')
      .set('referrer', '/foo?name=virk')
      .redirects(1)

    assert.equal(header.location, '/foo?name=virk')
  })

  test('redirect back to referrer with query string', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs({ name: 'virk' }).back()
      response.finish()
    })

    const { header } = await supertest(server)
      .get('/')
      .set('referer', '/foo?name=virk')
      .redirects(1)

    assert.equal(header.location, '/foo?name=virk')
  })

  test('redirect back to root (/) when referrer header is not set', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/')
  })

  test('redirect to given route', async (assert) => {
    const router = new Router(encryption)
    router.get('posts', 'PostsController.index').as('posts.index')
    router.commit()

    const server = createServer((req, res) => {
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().toRoute('posts.index')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts')
  })

  test('redirect to given route with params', async (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.show').as('post.show')
    router.commit()

    const server = createServer((req, res) => {
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().toRoute('post.show', { id: 1 })
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts/1')
  })

  test.failing('redirect to given route with domain', async (assert) => {
    const router = new Router(encryption)
    router
      .get('posts/create', 'PostsController.create')
      .as('post.create')
      .domain('domain.example.com')

    router.commit()

    const req = new IncomingMessage(new Socket())
    const res = new ServerResponse(req)
    const response = new Response(req, res, encryption, responseConfig, router)
    response.redirect().toRoute('post.create', {}, 'domain.example.com')

    /**
     * Header location cannot be protocol agnostic. We need to add support for
     * defining domain protocols in the router and then this test should pass
     */
    assert.equal(response.getHeader('location'), 'http://domain.example.com/posts/create')
  })

  test('redirect to given route and forward query string', async (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.show').as('post.show')
    router.commit()

    const server = createServer((req, res) => {
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs().toRoute('post.show', { id: 1 })
      response.finish()
    })

    const { header } = await supertest(server).get('/?published=true').redirects(1)
    assert.equal(header.location, '/posts/1?published=true')
  })

  test('redirect to given route and add qs via makeRoute', async (assert) => {
    const router = new Router(encryption)
    router.get('posts/:id', 'PostsController.show').as('post.show')
    router.commit()

    const server = createServer((req, res) => {
      const response = new Response(req, res, encryption, responseConfig, router)
      response
        .redirect()
        .withQs('user', 'virk')
        .toRoute('post.show', { id: 1, qs: { published: true } })

      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts/1?user=virk&published=true')
  })

  test('throw when given route is not found', async (assert) => {
    const router = new Router(encryption)
    const server = createServer((req, res) => {
      const response = new Response(req, res, encryption, responseConfig, router)

      assert.throw(() => {
        response.redirect().toRoute('posts')
      }, 'E_CANNOT_FIND_ROUTE: Cannot find route for "posts" identifier')

      response.finish()
    })

    await supertest(server).get('/').redirects(1)
  })

  test('merge query string values when withQs is called multiple times', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs('username', 'romain').withQs('age', 28).toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain&age=28')
  })

  test('merge query string with current url qs values', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs().withQs('age', 28).toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(header.location, '/foo?username=virk&age=28')
  })

  test('do not set query string original url has no qs', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('clear existing qs', async (assert) => {
    const server = createServer((req, res) => {
      const router = new Router(encryption)
      const response = new Response(req, res, encryption, responseConfig, router)
      response.redirect().withQs('name', 'virk').clearQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })
})
