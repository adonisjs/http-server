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
import { createCertificate } from 'pem'
import { createServer } from 'node:http'
import Middleware from '@poppinss/middleware'
import { createServer as httpsServer } from 'node:https'
import { EncryptionFactory } from '@adonisjs/encryption/test_factories/encryption'

import { RequestFactory } from '../factories/request.js'
import { CookieSerializer } from '../src/cookies/serializer.js'
import { HttpContextFactory } from '../factories/http_context.js'
import { UrlBuilder } from '../src/router/lookup_store/url_builder.js'
import { QsParserFactory } from '../factories/qs_parser_factory.js'

const encryption = new EncryptionFactory().create()
const serializer = new CookieSerializer(encryption)

test.group('Request', () => {
  test('get http request query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.qs()))
    })

    const { body } = await supertest(server).get('/?username=virk&age=22')
    assert.deepEqual(body, { username: 'virk', age: '22' })
  })

  test('update request initial body', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({ username: 'virk' })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          body: request.body(),
          all: request.all(),
          original: request.original(),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      body: { username: 'virk' },
      all: { username: 'virk' },
      original: { username: 'virk' },
    })
  })

  test('updating request body later must not impact the original body', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({ username: 'virk' })
      request.updateBody({ username: 'nikk' })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          body: request.body(),
          all: request.all(),
          original: request.original(),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      body: { username: 'nikk' },
      all: { username: 'nikk' },
      original: { username: 'virk' },
    })
  })

  test('updating nested properties of request body must not impact the original body', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({ user: { username: 'virk' } })
      const body = request.body()
      body.user.username = 'romain'

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          body: request.body(),
          all: request.all(),
          original: request.original(),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      body: { user: { username: 'romain' } },
      all: { user: { username: 'romain' } },
      original: { user: { username: 'virk' } },
    })
  })

  test('merge query string with all and original', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({ username: 'virk' })
      request.updateBody({ username: 'nikk' })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          body: request.body(),
          all: request.all(),
          original: request.original(),
        })
      )
    })

    const { body } = await supertest(server).get('/?age=22')
    assert.deepEqual(body, {
      body: { username: 'nikk' },
      all: { username: 'nikk', age: '22' },
      original: { username: 'virk', age: '22' },
    })
  })

  test('raise error when setInitialBody is called twice', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({})

      try {
        request.setInitialBody({})
      } catch ({ message }) {
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ message }))
      }
    })

    const { body } = await supertest(server).get('/?age=22')
    assert.deepEqual(body, {
      message: 'Cannot re-set initial body. Use "request.updateBody" instead',
    })
  })

  test('compute original and all even if body was never set', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          body: request.body(),
          all: request.all(),
          original: request.original(),
        })
      )
    })

    const { body } = await supertest(server).get('/?age=22')
    assert.deepEqual(body, {
      body: {},
      all: { age: '22' },
      original: { age: '22' },
    })
  })

  test('compute all when query string is updated', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.updateQs({ age: '24' })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          body: request.body(),
          all: request.all(),
          original: request.original(),
        })
      )
    })

    const { body } = await supertest(server).get('/?age=22')
    assert.deepEqual(body, {
      body: {},
      all: { age: '24' },
      original: { age: '22' },
    })
  })

  test('read input value from request', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ input: request.input('age') }))
    })

    const { body } = await supertest(server).get('/?age=22')
    assert.deepEqual(body, {
      input: '22',
    })
  })

  test('read nested input value from request', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ input: request.input('users.1') }))
    })

    const { body } = await supertest(server).get('/?users[0]=virk&users[1]=nikk')
    assert.deepEqual(body, {
      input: 'nikk',
    })
  })

  test('read array input value from request', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ input: request.input('users[1]') }))
    })

    const { body } = await supertest(server).get('/?users[0]=virk&users[1]=nikk')
    assert.deepEqual(body, {
      input: 'nikk',
    })
  })

  test('get all except few keys', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.except(['age'])))
    })

    const { body } = await supertest(server).get('/?age=22&username=virk')
    assert.deepEqual(body, {
      username: 'virk',
    })
  })

  test('get all except few keys from nested object', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({ user: { username: 'virk', age: 22 } })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.except(['user.age'])))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      user: {
        username: 'virk',
      },
    })
  })

  test('get only few keys', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.only(['age'])))
    })

    const { body } = await supertest(server).get('/?age=22&username=virk')
    assert.deepEqual(body, {
      age: '22',
    })
  })

  test('get request params', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      const ctx = new HttpContextFactory().merge({ request }).create()
      ctx.params = { id: 1 }
      request.ctx = ctx

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          params: request.params(),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      params: { id: 1 },
    })
  })

  test('get value for a given param', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      const ctx = new HttpContextFactory().merge({ request }).create()
      ctx.params = { id: 1 }
      request.ctx = ctx

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          id: request.param('id'),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      id: 1,
    })
  })

  test('get only few keys from nested object', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.setInitialBody({ user: { username: 'virk', age: 22 } })

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.only(['user.age'])))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      user: {
        age: 22,
      },
    })
  })

  test('get request headers', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.headers()))
    })

    const { body } = await supertest(server).get('/')
    assert.includeMembers(Object.keys(body), ['host'])
  })

  test('get value for a given request header', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ header: request.header('accept-encoding') }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      header: 'gzip, deflate',
    })
  })

  test('get ip address', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ip: request.ip() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      ip: '::ffff:127.0.0.1',
    })
  })

  test('get ip addresses as an array', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ip: request.ips() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      ip: ['::ffff:127.0.0.1'],
    })
  })

  test('get request protocol', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ protocol: request.protocol() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      protocol: 'http',
    })
  })

  test('return boolean telling request is secure or not', async ({ assert }, done) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
    createCertificate({}, async (error, keys) => {
      if (error) {
        done(error)
        return
      }

      const server = httpsServer({ key: keys.serviceKey, cert: keys.certificate }, (req, res) => {
        const request = new RequestFactory().merge({ req, res, encryption }).create()
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(JSON.stringify({ secure: request.secure() }))
      })

      const { body } = await supertest(server).get('/')
      assert.deepEqual(body, {
        secure: true,
      })
      done()
    })
  })
    .waitForDone()
    .skip(!!process.env.CI, 'Needs OpenSSL to run')

  test('get request hostname', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hostname: request.hostname() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      hostname: '127.0.0.1',
    })
  })

  test('return an array of subdomains', async ({ assert }) => {
    const server = createServer((req, res) => {
      req.headers.host = 'beta.adonisjs.com'

      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ subdomains: request.subdomains() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      subdomains: ['beta'],
    })
  })

  test('do not consider www a subdomain', async ({ assert }) => {
    const server = createServer((req, res) => {
      req.headers.host = 'www.adonisjs.com'

      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ subdomains: request.subdomains() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      subdomains: [],
    })
  })

  test('return true for ajax when X-Requested-With is xmlhttprequest', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ajax: request.ajax() }))
    })

    const { body } = await supertest(server).get('/').set('X-Requested-With', 'XMLHttpRequest')
    assert.deepEqual(body, {
      ajax: true,
    })
  })

  test('return false for ajax when X-Requested-With header is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ajax: request.ajax() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      ajax: false,
    })
  })

  test('return true for ajax when X-Pjax header is set', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ pjax: request.pjax() }))
    })

    const { body } = await supertest(server).get('/').set('X-Pjax', 'true')
    assert.deepEqual(body, {
      pjax: true,
    })
  })

  test('return request url without query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ url: request.url() }))
    })

    const { body } = await supertest(server).get('/?username=virk')
    assert.deepEqual(body, {
      url: '/',
    })
  })

  test('return request url with query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ url: request.url(true) }))
    })

    const { body } = await supertest(server).get('/?username=virk')
    assert.deepEqual(body, {
      url: '/?username=virk',
    })
  })

  test('return complete request url without query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ url: request.completeUrl() }))
    })

    const response = await supertest(server).get('/?username=virk')
    const { body, request } = response as any

    assert.deepEqual(body, {
      url: `http://${request.host}/`,
    })
  })

  test('return complete request url with query string', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ url: request.completeUrl(true) }))
    })

    const response = await supertest(server).get('/?username=virk')
    const { body, request } = response as any

    assert.deepEqual(body, {
      url: `http://${request.host}/?username=virk`,
    })
  })

  test('call getIp method to return ip address when defined inside config', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory()
        .merge({
          req,
          res,
          encryption,
          config: {
            getIp(_request) {
              return _request.header('host')!.split(':')[0]
            },
          },
        })
        .create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ ip: request.ip() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      ip: '127.0.0.1',
    })
  })

  test('return default value when referer header does not exists', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ referrer: request.header('referrer', 'foo.com') }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      referrer: 'foo.com',
    })
  })

  test('handle referer header spelling inconsistencies', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({ referrer: request.header('referrer'), referer: request.header('referer') })
      )
    })

    const { body } = await supertest(server).get('/').set('referer', 'foo.com')
    assert.deepEqual(body, {
      referrer: 'foo.com',
      referer: 'foo.com',
    })
  })

  test('return raw body as null when does not exists', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end(request.raw())
    })

    const { text } = await supertest(server).get('/')
    assert.equal(text, '')
  })

  test('update request raw body', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.updateRawBody(JSON.stringify({ username: 'virk' }))
      res.writeHead(200, { 'content-type': 'text/plain' })
      res.end(request.raw())
    })

    const { text } = await supertest(server).get('/')
    assert.deepEqual(JSON.parse(text), { username: 'virk' })
  })

  test('get null when request hostname is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      delete req.headers['host']

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hostname: request.hostname() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      hostname: null,
    })
  })

  test('get empty array when for subdomains request hostname is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      delete req.headers['host']

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ subdomains: request.subdomains() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      subdomains: [],
    })
  })

  test('set x-request-id header when id method is called', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory()
        .merge({ req, res, encryption, config: { generateRequestId: true } })
        .create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          id: request.id(),
          header: request.header('x-request-id'),
          reComputed: request.header('x-request-id'),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.exists(body.id)
    assert.exists(body.header)
    assert.exists(body.reComputed)

    assert.equal(body.id, body.header)
    assert.equal(body.id, body.reComputed)
  })

  test('do not generate request id when generateRequestId is false', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory()
        .merge({
          req,
          res,
          encryption,
          config: {
            generateRequestId: false,
          },
        })
        .create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          id: request.id(),
        })
      )
    })

    const { body } = await supertest(server).get('/')
    assert.notExists(body.id)
  })

  test('do not append ? when query string is empty', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ url: request.url(true) }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      url: '/',
    })
  })

  test('find if an identifier matches the request route pattern', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.ctx = new HttpContextFactory().merge({ request }).create()
      ;(request.ctx.route as any) = {
        pattern: '/users/:id',
        handler: () => {},
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          '/users/:id': request.matchesRoute('/users/:id'),
          '/users': request.matchesRoute('/users'),
        })
      )
    })

    const { body } = await supertest(server).get('/users/1')
    assert.deepEqual(body, {
      '/users/:id': true,
      '/users': false,
    })
  })

  test('find if an identifier matches the request route handler name', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.ctx = new HttpContextFactory().merge({ request }).create()
      request.ctx.route = {
        middleware: new Middleware(),
        meta: {},
        name: '',
        execute: () => {},
        pattern: '/users/:id',
        handler: { reference: '#controllers/user', handle: () => {} },
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          '/users/:id': request.matchesRoute('#controllers/user'),
          '/users': request.matchesRoute('/users'),
        })
      )
    })

    const { body } = await supertest(server).get('/users/1')
    assert.deepEqual(body, {
      '/users/:id': true,
      '/users': false,
    })
  })

  test('find if an identifier matches the request route name', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.ctx = new HttpContextFactory().merge({ request }).create()
      ;(request.ctx.route as any) = {
        pattern: '/users/:id',
        name: 'users.show',
        handler: { name: '#controllers/user', handle: () => {} },
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          '/users/:id': request.matchesRoute('users.show'),
          '/users': request.matchesRoute('/users'),
        })
      )
    })

    const { body } = await supertest(server).get('/users/1')
    assert.deepEqual(body, {
      '/users/:id': true,
      '/users': false,
    })
  })

  test('find if an one or more identifiers matches the request route name', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      request.ctx = new HttpContextFactory().merge({ request }).create()
      ;(request.ctx.route as any) = {
        pattern: '/users/:id',
        name: 'users.show',
        handler: { name: '#controllers/user', handle: () => {} },
      }

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          '/users/:id': request.matchesRoute(['users.show', 'users.list']),
          '/users': request.matchesRoute(['/users', '/users/:slug']),
        })
      )
    })

    const { body } = await supertest(server).get('/users/1')
    assert.deepEqual(body, {
      '/users/:id': true,
      '/users': false,
    })
  })

  test('get request json representation', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.toJSON()))
    })

    const { body } = await supertest(server).get('/')
    assert.containsSubset(body, {
      body: {},
      cookies: {},
      headers: {},
      hostname: '127.0.0.1',
      method: 'GET',
      params: {},
      protocol: 'http',
      query: null,
      subdomains: {},
      url: '/',
    })
  })
})

test.group('Request | Content negotiation', () => {
  test('content negotiate the request content-type', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: request.is(['json', 'html']) }))
    })

    const { body } = await supertest(server)
      .post('/')
      .set('content-type', 'application/json')
      .send({ username: 'virk' })

    assert.deepEqual(body, {
      type: 'json',
    })
  })

  test('return null when request body is empty', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ type: request.is(['json', 'html']) }))
    })

    const { body } = await supertest(server).get('/').set('content-type', 'application/json')
    assert.deepEqual(body, {
      type: null,
    })
  })

  test('return all types from most to least preferred', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ types: request.types() }))
    })

    const { body } = await supertest(server).get('/').set('accept', 'application/json')
    assert.deepEqual(body, {
      types: ['application/json'],
    })
  })

  test('return the most relavant accept type', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ accepts: request.accepts(['jsonp', 'json']) }))
    })

    const { body } = await supertest(server).get('/').set('accept', 'application/json')
    assert.deepEqual(body, {
      accepts: 'json',
    })
  })

  test('return all accept languages', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ languages: request.languages() }))
    })

    const { body } = await supertest(server).get('/').set('accept-language', 'en-uk')
    assert.deepEqual(body, {
      languages: ['en-uk'],
    })
  })

  test('return the most relavant language', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ language: request.language(['en', 'en-us', 'de']) }))
    })

    const { body } = await supertest(server).get('/').set('accept-language', 'en-uk')
    assert.deepEqual(body, {
      language: 'en',
    })
  })

  test('return all accept charsets', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ charsets: request.charsets() }))
    })

    const { body } = await supertest(server).get('/').set('accept-charset', 'utf-8')
    assert.deepEqual(body, {
      charsets: ['utf-8'],
    })
  })

  test('return most relevant charset', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ charset: request.charset(['utf-8', 'base64']) }))
    })

    const { body } = await supertest(server).get('/').set('accept-charset', 'utf-8')
    assert.deepEqual(body, {
      charset: 'utf-8',
    })
  })

  test('return all encodings', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ encodings: request.encodings() }))
    })

    const { body } = await supertest(server).get('/').set('accept-encoding', 'gzip')
    assert.deepEqual(body, {
      encodings: ['gzip', 'identity'],
    })
  })

  test('return matching encoding', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ encoding: request.encoding(['utf-8', 'gzip']) }))
    })

    const { body } = await supertest(server).get('/').set('accept-encoding', 'gzip')
    assert.deepEqual(body, {
      encoding: 'gzip',
    })
  })

  test('return false from request.stale when etag and if-match-none are same', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.setHeader('etag', 'foo')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ stale: request.stale() }))
    })

    const { body } = await supertest(server).get('/').set('if-none-match', 'foo')
    assert.deepEqual(body, {
      stale: false,
    })
  })
})

test.group('Request | cache', () => {
  test('return false from hasBody when request has no body', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasBody: request.hasBody() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      hasBody: false,
    })
  })

  test('return true from hasBody when request has no body', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasBody: request.hasBody() }))
    })

    const { body } = await supertest(server).post('/').set('username', 'virk')
    assert.deepEqual(body, {
      hasBody: true,
    })
  })

  test('return true from request.fresh when etag and if-match-none are same', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.setHeader('etag', 'foo')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ fresh: request.fresh() }))
    })

    const { body } = await supertest(server).get('/').set('if-none-match', 'foo')
    assert.deepEqual(body, {
      fresh: true,
    })
  })

  test('return false from request.fresh when etag and if-match-none are same but method is POST', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.setHeader('etag', 'foo')
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ fresh: request.fresh() }))
    })

    const { body } = await supertest(server).post('/').set('if-none-match', 'foo')
    assert.deepEqual(body, {
      fresh: false,
    })
  })

  test('return false from request.fresh when etag and if-match-none are same but statusCode is 301', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.setHeader('etag', 'foo')
      res.writeHead(301, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ fresh: request.fresh() }))
    })

    const { body } = await supertest(server).get('/').set('if-none-match', 'foo')
    assert.deepEqual(body, {
      fresh: false,
    })
  })
})

test.group('Request | Method spoofing', () => {
  test('return request http method', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ method: request.method() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      method: 'GET',
    })
  })

  test('return request spoofed http method when spoofing is enabled', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory()
        .merge({
          req,
          res,
          encryption,
          config: { allowMethodSpoofing: true },
        })
        .create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ method: request.method() }))
    })

    const { body } = await supertest(server).post('/?_method=put')
    assert.deepEqual(body, {
      method: 'PUT',
    })
  })

  test('return original http method when spoofing is enabled but original method is GET', async ({
    assert,
  }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory()
        .merge({
          req,
          res,
          encryption,
          config: { allowMethodSpoofing: true },
        })
        .create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ method: request.method() }))
    })

    const { body } = await supertest(server).get('/?_method=put')
    assert.deepEqual(body, {
      method: 'GET',
    })
  })
})

test.group('Request | Cookies', () => {
  test('get all unparsed cookies', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify(request.cookiesList()))
    })

    const cookies = serializer.encode('name', 'virk')!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      name: cookies.split('=')[1],
    })
  })

  test('get all unsigned cookies via plainCookies', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(
        JSON.stringify({
          plainCookies: { name: request.plainCookie('name') },
          cookies: { name: request.cookie('name') },
        })
      )
    })

    const cookies = serializer.encode('name', 'virk')!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      plainCookies: {
        name: 'virk',
      },
      cookies: {},
    })
  })

  test('get all signed cookies', async ({ assert }) => {
    const server = createServer((req, res) => {
      try {
        const request = new RequestFactory().merge({ req, res, encryption }).create()
        res.writeHead(200, { 'content-type': 'application/json' })
        res.end(
          JSON.stringify({
            plainCookies: { name: request.plainCookie('name') },
            cookies: { name: request.cookie('name') },
          })
        )
      } catch (error) {
        console.log(error)
      }
    })

    const cookies = serializer.sign('name', 'virk')!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      plainCookies: {},
      cookies: {
        name: 'virk',
      },
    })
  })

  test('get value for a single cookie', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.cookie('name') }))
    })

    const cookies = serializer.sign('name', 'virk')!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      name: 'virk',
    })
  })

  test('use default value when actual value is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.cookie('name', 'nikk') }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      name: 'nikk',
    })
  })

  test('get value for a single unsigned cookie', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.plainCookie('name') }))
    })

    const cookies = serializer.encode('name', 'virk')!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      name: 'virk',
    })
  })

  test('use default value when actual unsigned value is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.plainCookie('name', 'nikk') }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      name: 'nikk',
    })
  })

  test('get value for a single not encoded cookie', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory()
        .merge({
          req,
          res,
          encryption,
        })
        .create()

      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.plainCookie('name', undefined, false) }))
    })

    const cookies = serializer.encode('name', 'virk', { encode: false })!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      name: 'virk',
    })
  })

  test('get value for a single encrypted', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.encryptedCookie('name') }))
    })

    const cookies = serializer.encrypt('name', 'virk')!
    const { body } = await supertest(server).get('/').set('cookie', cookies)
    assert.deepEqual(body, {
      name: 'virk',
    })
  })

  test('use default value when actual value is missing', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ name: request.encryptedCookie('name', 'nikk') }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      name: 'nikk',
    })
  })
})

test.group('Verify signed url', () => {
  test('return false when signature is not defined', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature() }))
    })

    const { body } = await supertest(server).get('/')
    assert.deepEqual(body, {
      hasValidSignature: false,
    })
  })

  test('return false when signature cannot be decrypted', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature() }))
    })

    const { body } = await supertest(server).get('/?signature=sadjksadkjsaadjk')
    assert.deepEqual(body, {
      hasValidSignature: false,
    })
  })

  test('return true when signature is valid', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature() }))
    })

    const url = new UrlBuilder(encryption, {} as any, new QsParserFactory().create())
      .params({ name: 'virk' })
      .disableRouteLookup()
      .makeSigned('/')

    const { body } = await supertest(server).get(url)
    assert.deepEqual(body, {
      hasValidSignature: true,
    })
  })

  test('return true when signature is valid without any querystring', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature() }))
    })

    const url = new UrlBuilder(encryption, {} as any, new QsParserFactory().create())
      .disableRouteLookup()
      .makeSigned('/')

    const { body } = await supertest(server).get(url)
    assert.deepEqual(body, {
      hasValidSignature: true,
    })
  })

  test('return false when signature is valid but expired', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature() }))
    })

    const url = new UrlBuilder(encryption, {} as any, new QsParserFactory().create())
      .disableRouteLookup()
      .makeSigned('/', {
        expiresIn: -100,
      })

    const { body } = await supertest(server).get(url)
    assert.deepEqual(body, {
      hasValidSignature: false,
    })
  })

  test('return true when expiry is in future', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature() }))
    })

    const url = new UrlBuilder(encryption, {} as any, new QsParserFactory().create())
      .disableRouteLookup()
      .makeSigned('/', {
        expiresIn: '1 hour',
      })

    const { body } = await supertest(server).get(url)
    assert.deepEqual(body, {
      hasValidSignature: true,
    })
  })

  test('return false when purpose is different', async ({ assert }) => {
    const server = createServer((req, res) => {
      const request = new RequestFactory().merge({ req, res, encryption }).create()
      res.writeHead(200, { 'content-type': 'application/json' })
      res.end(JSON.stringify({ hasValidSignature: request.hasValidSignature('login') }))
    })

    const url = new UrlBuilder(encryption, {} as any, new QsParserFactory().create())
      .disableRouteLookup()
      .makeSigned('/', {
        purpose: 'register',
      })

    const { body } = await supertest(server).get(url)
    assert.deepEqual(body, {
      hasValidSignature: false,
    })
  })
})
