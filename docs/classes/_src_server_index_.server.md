[@adonisjs/http-server](../README.md) › ["src/Server/index"](../modules/_src_server_index_.md) › [Server](_src_server_index_.server.md)

# Class: Server

Server class handles the HTTP requests by using all Adonis micro modules.

## Hierarchy

* **Server**

## Implements

* ServerContract

## Index

### Constructors

* [constructor](_src_server_index_.server.md#constructor)

### Properties

* [hooks](_src_server_index_.server.md#hooks)
* [instance](_src_server_index_.server.md#optional-instance)
* [middleware](_src_server_index_.server.md#middleware)
* [router](_src_server_index_.server.md#router)

### Methods

* [errorHandler](_src_server_index_.server.md#errorhandler)
* [handle](_src_server_index_.server.md#handle)
* [optimize](_src_server_index_.server.md#optimize)

## Constructors

###  constructor

\+ **new Server**(`container`: IocContract, `logger`: LoggerContract, `profiler`: ProfilerContract, `encryption`: EncryptionContract, `httpConfig`: ServerConfigContract): *[Server](_src_server_index_.server.md)*

**Parameters:**

Name | Type |
------ | ------ |
`container` | IocContract |
`logger` | LoggerContract |
`profiler` | ProfilerContract |
`encryption` | EncryptionContract |
`httpConfig` | ServerConfigContract |

**Returns:** *[Server](_src_server_index_.server.md)*

## Properties

###  hooks

• **hooks**: *[Hooks](_src_server_hooks_index_.hooks.md)‹›* = new Hooks()

Server before/after hooks

___

### `Optional` instance

• **instance**? : *HttpServer | HttpsServer*

The server itself doesn't create the http server instance. However, the consumer
of this class can create one and set the instance for further reference. This
is what ignitor does.

___

###  middleware

• **middleware**: *[MiddlewareStore](_src_middlewarestore_index_.middlewarestore.md)‹›* = new MiddlewareStore(this.container)

The middleware store to register global and named middleware

___

###  router

• **router**: *[Router](_src_router_index_.router.md)‹›* = new Router(this.encryption, (route) => this.precompiler.compileRoute(route))

The route to register routes

## Methods

###  errorHandler

▸ **errorHandler**(`handler`: ErrorHandlerNode): *this*

Define custom error handler to handler all errors
occurred during HTTP request

**Parameters:**

Name | Type |
------ | ------ |
`handler` | ErrorHandlerNode |

**Returns:** *this*

___

###  handle

▸ **handle**(`req`: IncomingMessage, `res`: ServerResponse): *Promise‹void›*

Handles a given HTTP request. This method can be attached to any HTTP
server

**Parameters:**

Name | Type |
------ | ------ |
`req` | IncomingMessage |
`res` | ServerResponse |

**Returns:** *Promise‹void›*

___

###  optimize

▸ **optimize**(): *void*

Optimizes internal handlers, based upon the existence of
before handlers and global middleware. This helps in
increasing throughput by 10%

**Returns:** *void*
