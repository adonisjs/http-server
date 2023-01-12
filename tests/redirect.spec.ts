/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import supertest from 'supertest'
import { test } from '@japa/runner'
import { createServer } from 'node:http'
import { AppFactory } from '@adonisjs/application/test_factories/app'
import { EncryptionFactory } from '@adonisjs/encryption/test_factories/encryption'

import { RouterFactory } from '../test_factories/router.js'
import { ResponseFactory } from '../test_factories/response.js'

const BASE_URL = new URL('./app/', import.meta.url)

const app = new AppFactory().create(BASE_URL)
const encryption = new EncryptionFactory().create()
const router = new RouterFactory().merge({ app, encryption }).create()

test.group('Redirect', () => {
  test('redirect to given url', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url with query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=romain').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url and forward current query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=romain').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs('username', 'romain').toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query string overwriting the forward rules', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs().withQs('username', 'romain').toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query given as object', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

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

  test('do not set query string when originally there was no query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url and set custom statusCode', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect('/foo', false, 301)
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('redirect to given url and set custom statusCode using fluent API', async () => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect().status(301).toPath('/foo')
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('redirect back to referrer', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').set('referrer', '/foo').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect back to referrer with existing query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect().withQs().back()
      response.finish()
    })

    const { header } = await supertest(server)
      .get('/')
      .set('referrer', '/foo?name=virk')
      .redirects(1)

    assert.equal(header.location, '/foo?name=virk')
  })

  test('redirect back to referrer with query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect().withQs({ name: 'virk' }).back()
      response.finish()
    })

    const { header } = await supertest(server)
      .get('/')
      .set('referer', '/foo?name=virk')
      .redirects(1)

    assert.equal(header.location, '/foo?name=virk')
  })

  test('redirect back to root (/) when referrer header is not set', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/')
  })

  test('redirect back to root (/) when referrer header is empty', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').set('referer', '').redirects(1)

    assert.equal(header.location, '/')
  })

  test('redirect to given route', async ({ assert }) => {
    const route = new RouterFactory().merge({ app, encryption }).create()
    route.get('posts', 'PostsController.index').as('posts.index')
    route.commit()

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router: route }).create()
      response.redirect().toRoute('posts.index')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts')
  })

  test('redirect to given route with params', async ({ assert }) => {
    const route = new RouterFactory().merge({ app, encryption }).create()
    route.get('posts/:id', 'PostsController.show').as('post.show')
    route.commit()

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router: route }).create()
      response.redirect().toRoute('post.show', { id: 1 })
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts/1')
  })

  test('redirect to given route with domain', async ({ assert }) => {
    const route = new RouterFactory().merge({ app, encryption }).create()
    route
      .get('posts/create', 'PostsController.create')
      .as('post.create')
      .domain('domain.example.com')

    route.commit()

    const response = new ResponseFactory().merge({ encryption, router: route }).create()

    response.redirect().toRoute('post.create', {}, { domain: 'domain.example.com' })

    /**
     * Header location cannot be protocol agnostic. We need to add support for
     * defining domain protocols in the router and then this test should pass
     */
    assert.equal(response.getHeader('location'), '/posts/create')
  })

  test('redirect to given route and forward query string', async ({ assert }) => {
    const route = new RouterFactory().merge({ app, encryption }).create()

    route.get('posts/:id', 'PostsController.show').as('post.show')
    route.commit()

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router: route }).create()
      response.redirect().withQs().toRoute('post.show', { id: 1 })
      response.finish()
    })

    const { header } = await supertest(server).get('/?published=true').redirects(1)
    assert.equal(header.location, '/posts/1?published=true')
  })

  test('redirect to given route and add qs via makeRoute', async ({ assert }) => {
    const route = new RouterFactory().merge({ app, encryption }).create()

    route.get('posts/:id', 'PostsController.show').as('post.show')
    route.commit()

    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router: route }).create()

      response
        .redirect()
        .withQs('user', 'virk')
        .toRoute('post.show', { id: 1 }, { qs: { published: true } })

      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts/1?user=virk&published=true')
  })

  test('throw when given route is not found', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()

      assert.throws(() => {
        response.redirect().toRoute('posts')
      }, 'Cannot lookup route "posts"')

      response.finish()
    })

    await supertest(server).get('/').redirects(1)
  })

  test('merge query string values when withQs is called multiple times', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs('username', 'romain').withQs('age', 28).toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain&age=28')
  })

  test('merge query string with current url qs values', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs().withQs('age', 28).toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(header.location, '/foo?username=virk&age=28')
  })

  test('do not set query string original url has no qs', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('clear existing qs', async ({ assert }) => {
    const server = createServer((req, res) => {
      const response = new ResponseFactory().merge({ req, res, encryption, router }).create()
      response.redirect().withQs('name', 'virk').clearQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })
})
