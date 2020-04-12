<div align="center"><img src="https://res.cloudinary.com/adonisjs/image/upload/q_100/v1564392111/adonis-banner_o9lunk.png" width="600px"></div>

# AdonisJS Http Server
> Decently fast HTTP server used by AdonisJS

[![appveyor-image]][appveyor-url] [![circleci-image]][circleci-url] [![typescript-image]][typescript-url] [![npm-image]][npm-url] [![license-image]][license-url]

This module is extracted from the AdonisJS framework to work as a standalone HTTP server. The performance of the server is on par with Fastify (not as fast as fastify though).


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
## Table of contents

- [Benchmarks](#benchmarks)
- [Features](#features)
- [Usage](#usage)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Benchmarks
The benchmarking scheme is taken from the Fastify github repo. 

**Machine**: Quad-Core Intel Core i7, 2.2GHz, 16GB RAM
**Method**: autocannon -c 100 -d 40 -p 10 localhost:3000 * 2, taking the second average

| Framework          | Version                    | Router?      |  Requests/sec |
| :----------------- | :------------------------- | :----------: | ------------: |
| **Fastify**        | **2.0.0**                  | **&#10003;** | **58,740**    |
| **AdonisJS**        | **1.8.1**                 | **&#10003;** | **54,832**    |

You can run the same benchmarks by cloning the repo and then running the following command.

```sh
npm run benchmark
```

Since the program correctness and reliability is more important over micro optimizations. We pay penality on following fronts in comparison to Fastify.

- **The AdonisJS query string parser can parse arrays inside query string** `(/api?foo[]=bar&foo[]=fuzz&foo[]=buzz
)`, wherease fastify doesn't parse it by default for performance reasons. However, you can also define your own query string parser with fastify, but again, you will end up paying the same performance penality.
- **Subdomain based routing** is another front, where AdonisJS has to perform little bit extra work to find the correct route and it's handler.

## Features

- The most advanced router with support for **route resources**, **route groups**, **subdomains routing**.
- Support for **global** and **route specific** middleware.
- Reliable and stable query string parser.
- Global exception handler to catch all exceptions handled during an HTTP request.
- Sends data to AdonisJS inbuilt profiler

## Usage
You must be using the server inside a fully fledged AdonisJS application. Still, here's how you can start the standlone server.

```sh
npm i @adonisjs/http-server
```

```ts
import proxyaddr from 'proxy-addr'
import { createServer } from 'http'
import { Ioc } from '@adonisjs/fold'
import { Logger } from '@adonisjs/logger/build/standalone'
import { Profiler } from '@adonisjs/profiler/build/standalone'
import { Encryption } from '@adonisjs/encryption/build/standalone'

import { Server } from '@adonisjs/http-server'

const logger = new Logger({ enabled: true, level: 'trace', name: 'adonis' })
const profiler = new Profiler({ enabled: true })
const encryption = new Encryption({
  secret: 'averylongrandom32charslongsecret',
})

const server = new Server(new Ioc(), logger, profiler, encryption, {
  etag: false,
  jsonpCallbackName: 'callback',
  cookie: {},
  subdomainOffset: 2,
  generateRequestId: false,
  trustProxy: proxyaddr.compile('loopback'),
  allowMethodSpoofing: false,
})

server.router.get('/', async () => {
  return { hello: 'world' }
})
server.optimize()

createServer(server.handle.bind(server)).listen(4000)
```

[appveyor-image]: https://img.shields.io/appveyor/ci/thetutlage/http-server/master.svg?style=for-the-badge&logo=appveyor
[appveyor-url]: https://ci.appveyor.com/project/thetutlage/http-server "appveyor"

[circleci-image]: https://img.shields.io/circleci/project/github/adonisjs/http-server/master.svg?style=for-the-badge&logo=circleci
[circleci-url]: https://circleci.com/gh/adonisjs/http-server "circleci"

[typescript-image]: https://img.shields.io/badge/Typescript-294E80.svg?style=for-the-badge&logo=typescript
[typescript-url]:  "typescript"

[npm-image]: https://img.shields.io/npm/v/@adonisjs/http-server.svg?style=for-the-badge&logo=npm
[npm-url]: https://npmjs.org/package/@adonisjs/http-server "npm"

[license-image]: https://img.shields.io/npm/l/@adonisjs/http-server?color=blueviolet&style=for-the-badge
[license-url]: LICENSE.md "license"
