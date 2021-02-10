/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import { join } from 'path'
import { fork } from 'child_process'
import autocannon from 'autocannon'

function coolOff() {
  return new Promise((resolve) => setTimeout(resolve, 2000))
}

function autocannonRun(opts: any): Promise<void> {
  return new Promise((resolve) => {
    const instance = autocannon(opts, () => {
      resolve()
    })
    autocannon.track(instance)
  })
}

async function adonisRun() {
  console.log('ADONIS')
  const forked = fork(join(__dirname, 'adonis'))

  await coolOff()
  await autocannonRun({
    url: 'http://localhost:4000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  await autocannonRun({
    url: 'http://localhost:4000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  forked.kill('SIGINT')
  console.log('Completed')
}

async function fastifyRun() {
  console.log('FASTIFY')
  const forked = fork(join(__dirname, 'fastify'))

  await coolOff()
  await autocannonRun({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  await autocannonRun({
    url: 'http://localhost:3000',
    connections: 100,
    duration: 40,
    pipelining: 10,
  })

  forked.kill('SIGINT')
  console.log('Completed')
}

fastifyRun().then(coolOff).then(adonisRun)
