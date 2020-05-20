/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import test from 'japa'
import supertest from 'supertest'
import { createServer } from 'http'
import { Encryption } from '@adonisjs/encryption/build/standalone'

import { Router } from '../src/Router'
import { Response } from '../src/Response'
import { ResponseConfig } from '@ioc:Adonis/Core/Response'

const SECRET = Math.random().toFixed(36).substring(2, 38)
const encryption = new Encryption({ secret: 'averylongrandom32charslongsecret' })
const router = new Router(encryption)

const fakeConfig = (conf?: Partial<ResponseConfig>) => {
  return Object.assign({
    etag: false,
    secret: SECRET,
    jsonpCallbackName: 'callback',
    cookie: {
      maxAge: 90,
      path: '/',
      httpOnly: true,
      sameSite: false,
      secure: false,
    },
  }, conf)
}

test.group('Redirect', () => {
  test('redirect to given url', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url with query string', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=romain').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with query string using new API', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().withQs().toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=romain').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query string', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().withQs('username', 'romain').toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query string overwriting the forward rules', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().withQs().withQs('username', 'romain').toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/?username=virk').redirects(1)
    assert.equal(header.location, '/foo?username=romain')
  })

  test('redirect to given url with custom query given as object', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().withQs({
        username: 'romain',
        username2: 'virk',
      }).toPath('/foo')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo?username=romain&username2=virk')
  })

  test('do not set query string when originally there was no query string', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('/foo', true)
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect to given url and set custom statusCode', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('/foo', false, 301)
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('redirect to given url and set custom statusCode using new API', async () => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().status(301).toPath('/foo')
      response.finish()
    })

    await supertest(server).get('/').redirects(1).expect(301)
  })

  test('redirect back to referrer', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').set('referrer', '/foo').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect back to referer', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').set('referer', '/foo').redirects(1)
    assert.equal(header.location, '/foo')
  })

  test('redirect back to root (/) when referrer header is not set', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect('back')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/')
  })

  test('redirect to given route', async (assert) => {
    router.get('posts', 'PostsController.index').as('posts.index')
    router.commit()

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().toRoute('posts.index')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts')
  })

  test('redirect to given route with params', async (assert) => {
    router.get('posts/:id', 'PostsController.show').as('post.show')
    router.commit()

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().toRoute('post.show', { params: { id: 1 }})
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, '/posts/1')
  })

  test.skip('redirect to given route with domain', async (assert) => {
    router.get('posts/create', 'PostsController.create').as('post.create').domain('domain.example.com')
    router.commit()

    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)
      response.redirect().toRoute('post.create', {}, 'domain.example.com')
      response.finish()
    })

    const { header } = await supertest(server).get('/').redirects(1)
    assert.equal(header.location, 'domain.example.com/posts/create')
  })

  test('throw when given route is not found', async (assert) => {
    const server = createServer((req, res) => {
      const config = fakeConfig()
      const response = new Response(req, res, encryption, config, router)

      assert.throw(() => {
        response.redirect().toRoute('should.throw')
      }, 'Unable to lookup route for "should.throw" identifier')

      response.finish()
    })

    await supertest(server).get('/').redirects(1)
  })
})
