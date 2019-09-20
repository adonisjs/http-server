[@adonisjs/http-server](../README.md) › ["src/Server/RequestHandler/index"](../modules/_src_server_requesthandler_index_.md) › [RequestHandler](_src_server_requesthandler_index_.requesthandler.md)

# Class: RequestHandler

Handles the request by invoking it's middleware chain, along with the
route finalHandler

## Hierarchy

* **RequestHandler**

## Index

### Constructors

* [constructor](_src_server_requesthandler_index_.requesthandler.md#constructor)

### Methods

* [commit](_src_server_requesthandler_index_.requesthandler.md#commit)
* [handle](_src_server_requesthandler_index_.requesthandler.md#handle)

## Constructors

###  constructor

\+ **new RequestHandler**(`_middlewareStore`: MiddlewareStoreContract, `_router`: RouterContract): *[RequestHandler](_src_server_requesthandler_index_.requesthandler.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_middlewareStore` | MiddlewareStoreContract |
`_router` | RouterContract |

**Returns:** *[RequestHandler](_src_server_requesthandler_index_.requesthandler.md)*

## Methods

###  commit

▸ **commit**(): *void*

Computing certain methods to optimize for runtime performance

**Returns:** *void*

___

###  handle

▸ **handle**(`ctx`: HttpContextContract): *Promise‹void›*

Handles the request and invokes required middleware/handlers

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | HttpContextContract |

**Returns:** *Promise‹void›*
