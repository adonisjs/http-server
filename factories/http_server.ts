/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import getPort from 'get-port'
import { getActiveTest } from '@japa/runner'
import { IncomingMessage, Server, ServerResponse, createServer } from 'node:http'

export const httpServer = {
  async create(handler: (req: IncomingMessage, res: ServerResponse) => any | Promise<any>) {
    const server = createServer(handler)
    const test = getActiveTest()
    test?.cleanup(() => {
      server.close()
    })

    const port = await getPort({ port: 3000 })
    return new Promise<{ server: Server; url: string; port: number }>((resolve) => {
      server.listen(port, 'localhost', () => {
        return resolve({ server, port, url: `http://localhost:${port}` })
      })
    })
  },
}
