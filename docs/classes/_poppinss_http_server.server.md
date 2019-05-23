[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [Server](../classes/_poppinss_http_server.server.md)

# Class: Server

Server class handles the HTTP requests by using all Adonis micro modules.

```
const http = require('http')
const { Request } = require('@adonisjs/request')
const { Response } = require('@adonisjs/response')
const { Router } = require('@adonisjs/router')
const { MiddlewareStore, Server, routePreProcessor } = require('@adonisjs/server')

const middlewareStore = new MiddlewareStore()
const router = new Router((route) => routePreProcessor(route, middlewareStore))

const server = new Server(Request, Response, router, middlewareStore)
http.createServer(server.handle.bind(server)).listen(3000)
```

## Type parameters
#### Context :  `HttpContextContract`
## Hierarchy

**Server**

## Implements

* `ServerContract`<`Context`>

## Index

### Constructors

* [constructor](_poppinss_http_server.server.md#constructor)

### Properties

* [instance](_poppinss_http_server.server.md#instance)

### Methods

* [after](_poppinss_http_server.server.md#after)
* [before](_poppinss_http_server.server.md#before)
* [handle](_poppinss_http_server.server.md#handle)
* [onError](_poppinss_http_server.server.md#onerror)
* [optimize](_poppinss_http_server.server.md#optimize)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Server**(_context: *`object`*, _router: *`RouterContract`<`Context`>*, _middlewareStore: *`MiddlewareStoreContract`<`Context`>*, _logger: *`LoggerContract`*, _httpConfig: *`ServerConfig`*): [Server](_poppinss_http_server.server.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| _context | `object` |
| _router | `RouterContract`<`Context`> |
| _middlewareStore | `MiddlewareStoreContract`<`Context`> |
| _logger | `LoggerContract` |
| _httpConfig | `ServerConfig` |

**Returns:** [Server](_poppinss_http_server.server.md)

___

## Properties

<a id="instance"></a>

### `<Optional>` instance

**● instance**: *`HttpServer` \| `HttpsServer`*

The server itself doesn't create the http server instance. However, the consumer of this class can create one and set the instance for further reference. This is what ignitor does.

___

## Methods

<a id="after"></a>

###  after

▸ **after**(cb: *`HookNode`<`Context`>*): `this`

Define hooks to be executed after the route handler. The after hooks can modify the lazy response. However, it shouldn't write the response to the socket.

**Parameters:**

| Name | Type |
| ------ | ------ |
| cb | `HookNode`<`Context`> |

**Returns:** `this`

___
<a id="before"></a>

###  before

▸ **before**(cb: *`HookNode`<`Context`>*): `this`

Define hooks to be executed as soon as a new request has been received

**Parameters:**

| Name | Type |
| ------ | ------ |
| cb | `HookNode`<`Context`> |

**Returns:** `this`

___
<a id="handle"></a>

###  handle

▸ **handle**(req: *`IncomingMessage`*, res: *`ServerResponse`*): `Promise`<`void`>

Handles a given HTTP request. This method can be attached to any HTTP server

**Parameters:**

| Name | Type |
| ------ | ------ |
| req | `IncomingMessage` |
| res | `ServerResponse` |

**Returns:** `Promise`<`void`>

___
<a id="onerror"></a>

###  onError

▸ **onError**(cb: *`ErrorHandlerNode`<`Context`>*): `this`

Define custom error handler to handler all errors occurred during HTTP request

**Parameters:**

| Name | Type |
| ------ | ------ |
| cb | `ErrorHandlerNode`<`Context`> |

**Returns:** `this`

___
<a id="optimize"></a>

###  optimize

▸ **optimize**(): `void`

Optimizes internal handlers, based upon the existence of before handlers and global middleware. This helps in increasing throughput by 10%

**Returns:** `void`

___

