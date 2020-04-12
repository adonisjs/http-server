[@adonisjs/http-server](../README.md) › ["src/MiddlewareStore/index"](../modules/_src_middlewarestore_index_.md) › [MiddlewareStore](_src_middlewarestore_index_.middlewarestore.md)

# Class: MiddlewareStore

Middleware store register and keep all the application middleware at one
place. Also middleware are resolved during the registration and any
part of the application can read them without extra overhead.

**`example`** 
```ts
const store = new MiddlewareStore()

store.register([
  'App/Middleware/Auth'
])

store.registerNamed({
  auth: 'App/Middleware/Auth'
})

store.get()
```

## Hierarchy

* **MiddlewareStore**

## Implements

* MiddlewareStoreContract

## Index

### Constructors

* [constructor](_src_middlewarestore_index_.middlewarestore.md#constructor)

### Methods

* [get](_src_middlewarestore_index_.middlewarestore.md#get)
* [getNamed](_src_middlewarestore_index_.middlewarestore.md#getnamed)
* [invokeMiddleware](_src_middlewarestore_index_.middlewarestore.md#invokemiddleware)
* [register](_src_middlewarestore_index_.middlewarestore.md#register)
* [registerNamed](_src_middlewarestore_index_.middlewarestore.md#registernamed)

## Constructors

###  constructor

\+ **new MiddlewareStore**(`container`: IocContract): *[MiddlewareStore](_src_middlewarestore_index_.middlewarestore.md)*

**Parameters:**

Name | Type |
------ | ------ |
`container` | IocContract |

**Returns:** *[MiddlewareStore](_src_middlewarestore_index_.middlewarestore.md)*

## Methods

###  get

▸ **get**(): *ResolvedMiddlewareHandler[]*

Return all middleware registered using [MiddlewareStore.register](_src_middlewarestore_index_.middlewarestore.md#register)
method

**Returns:** *ResolvedMiddlewareHandler[]*

___

###  getNamed

▸ **getNamed**(`name`: string): *null | ResolvedMiddlewareHandler*

Returns a single middleware by it's name registered
using [MiddlewareStore.registerNamed](_src_middlewarestore_index_.middlewarestore.md#registernamed) method.

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *null | ResolvedMiddlewareHandler*

___

###  invokeMiddleware

▸ **invokeMiddleware**(`middleware`: ResolvedMiddlewareHandler, `params`: [HttpContextContract, function]): *Promise‹any›*

Invokes a resolved middleware.

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | ResolvedMiddlewareHandler |
`params` | [HttpContextContract, function] |

**Returns:** *Promise‹any›*

___

###  register

▸ **register**(`middleware`: MiddlewareHandler[]): *this*

Register an array of global middleware. These middleware are read
by HTTP server and executed on every request

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | MiddlewareHandler[] |

**Returns:** *this*

___

###  registerNamed

▸ **registerNamed**(`middleware`: object): *this*

Register named middleware that can be referenced later on routes

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | object |

**Returns:** *this*
