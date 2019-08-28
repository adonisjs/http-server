**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["contracts"](../modules/_contracts_.md) › [ServerContract](_contracts_.servercontract.md)

# Interface: ServerContract <**Context**>

HTTP server

## Type parameters

▪ **Context**: *[HttpContextContract](_contracts_.httpcontextcontract.md)*

## Hierarchy

* **ServerContract**

## Implemented by

* [Server](../classes/_server_index_.server.md)

## Index

### Properties

* [instance](_contracts_.servercontract.md#optional-instance)

### Methods

* [after](_contracts_.servercontract.md#after)
* [before](_contracts_.servercontract.md#before)
* [errorHandler](_contracts_.servercontract.md#errorhandler)
* [handle](_contracts_.servercontract.md#handle)
* [optimize](_contracts_.servercontract.md#optimize)

## Properties

### `Optional` instance

• **instance**? : *HttpServer | HttpsServer*

## Methods

###  after

▸ **after**(`cb`: [HookNode](../modules/_contracts_.md#hooknode)‹Context›): *this*

**Parameters:**

Name | Type |
------ | ------ |
`cb` | [HookNode](../modules/_contracts_.md#hooknode)‹Context› |

**Returns:** *this*

___

###  before

▸ **before**(`cb`: [HookNode](../modules/_contracts_.md#hooknode)‹Context›): *this*

**Parameters:**

Name | Type |
------ | ------ |
`cb` | [HookNode](../modules/_contracts_.md#hooknode)‹Context› |

**Returns:** *this*

___

###  errorHandler

▸ **errorHandler**(`handler`: [ErrorHandlerNode](../modules/_contracts_.md#errorhandlernode)‹Context› | string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`handler` | [ErrorHandlerNode](../modules/_contracts_.md#errorhandlernode)‹Context› \| string |

**Returns:** *this*

___

###  handle

▸ **handle**(`req`: IncomingMessage, `res`: ServerResponse): *Promise‹void›*

**Parameters:**

Name | Type |
------ | ------ |
`req` | IncomingMessage |
`res` | ServerResponse |

**Returns:** *Promise‹void›*

___

###  optimize

▸ **optimize**(): *void*

**Returns:** *void*