/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { fastify } from 'fastify'
import middie from '@fastify/middie'

const app = fastify()
await app.register(middie.default)

app.get('/', (_, reply) => {
  reply.send({ hello: 'world' })
})

app.listen(
  {
    port: 3000,
  },
  () => {
    console.log('listening on 3000')
  }
)
