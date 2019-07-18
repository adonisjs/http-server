> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [ServerContract](_poppinss_http_server.servercontract.md) /

# Interface: ServerContract <**Context**>

HTTP server

## Type parameters

▪ **Context**: *[HttpContextContract](_poppinss_http_server.httpcontextcontract.md)*

## Hierarchy

* **ServerContract**

## Implemented by

* [Server](../classes/_poppinss_http_server.server.md)

## Index

### Properties

* [instance](_poppinss_http_server.servercontract.md#optional-instance)

### Methods

* [after](_poppinss_http_server.servercontract.md#after)
* [before](_poppinss_http_server.servercontract.md#before)
* [handle](_poppinss_http_server.servercontract.md#handle)
* [onError](_poppinss_http_server.servercontract.md#onerror)
* [optimize](_poppinss_http_server.servercontract.md#optimize)

## Properties

### `Optional` instance

• **instance**? : *`HttpServer` | `HttpsServer`*

## Methods

###  after

▸ **after**(`cb`: [HookNode](../modules/_poppinss_http_server.md#hooknode)‹*`Context`*›): *this*

**Parameters:**

Name | Type |
------ | ------ |
`cb` | [HookNode](../modules/_poppinss_http_server.md#hooknode)‹*`Context`*› |

**Returns:** *this*

___

###  before

▸ **before**(`cb`: [HookNode](../modules/_poppinss_http_server.md#hooknode)‹*`Context`*›): *this*

**Parameters:**

Name | Type |
------ | ------ |
`cb` | [HookNode](../modules/_poppinss_http_server.md#hooknode)‹*`Context`*› |

**Returns:** *this*

___

###  handle

▸ **handle**(`req`: `IncomingMessage`, `res`: `ServerResponse`): *`Promise<void>`*

**Parameters:**

Name | Type |
------ | ------ |
`req` | `IncomingMessage` |
`res` | `ServerResponse` |

**Returns:** *`Promise<void>`*

___

###  onError

▸ **onError**(`cb`: [ErrorHandlerNode](../modules/_poppinss_http_server.md#errorhandlernode)‹*`Context`*›): *this*

**Parameters:**

Name | Type |
------ | ------ |
`cb` | [ErrorHandlerNode](../modules/_poppinss_http_server.md#errorhandlernode)‹*`Context`*› |

**Returns:** *this*

___

###  optimize

▸ **optimize**(): *void*

**Returns:** *void*