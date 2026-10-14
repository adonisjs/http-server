/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { createServer } from 'node:http'
import { Logger } from '@adonisjs/logger'
import { Emitter } from '@adonisjs/events'
import { Encryption } from '@boringnode/encryption'
import { chacha20poly1305 } from '@boringnode/encryption/drivers/chacha20_poly1305'
import { Application } from '@adonisjs/application'

import { defineConfig, Server } from '../build/index.js'

const app = new Application(new URL('./', import.meta.url), {
  environment: 'web',
  importer: () => {},
})
await app.init()

const encryption = new Encryption(
  chacha20poly1305({ id: 'app', keys: ['averylongrandom32charslongsecret'] })
)

const server = new Server(
  app,
  encryption,
  new Emitter(app),
  new Logger({ enabled: false }),
  defineConfig({
    serializeJSON(v) {
      return JSON.stringify(v)
    },
  })
)
server.getRouter().get('/', async (ctx) => {
  return ctx.response.send({ hello: 'world' })
})

await server.boot()

createServer(server.handle.bind(server)).listen(4000, () => {
  console.log('listening on 4000')
})
