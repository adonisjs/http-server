**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["src/Server/PreCompiler/index"](../modules/_src_server_precompiler_index_.md) › [PreCompiler](_src_server_precompiler_index_.precompiler.md)

# Class: PreCompiler

Precompiler is used to pre compiler the route handler and middleware. We
lookup the middleware and controllers upfront in the IoC container
and cache the lookup to boost the runtime performance.

Also each route gets a `finalHandler` property, which is used to invoke the
route middleware and the route actual handler

## Hierarchy

* **PreCompiler**

## Index

### Constructors

* [constructor](_src_server_precompiler_index_.precompiler.md#constructor)

### Methods

* [compileRoute](_src_server_precompiler_index_.precompiler.md#compileroute)

## Constructors

###  constructor

\+ **new PreCompiler**(`container`: IocContract, `_middlewareStore`: MiddlewareStoreContract): *[PreCompiler](_src_server_precompiler_index_.precompiler.md)*

**Parameters:**

Name | Type |
------ | ------ |
`container` | IocContract |
`_middlewareStore` | MiddlewareStoreContract |

**Returns:** *[PreCompiler](_src_server_precompiler_index_.precompiler.md)*

## Methods

###  compileRoute

▸ **compileRoute**(`route`: RouteNode): *void*

Pre-compile route handler and it's middleware to boost runtime performance. Since
most of this work is repetitive, we pre-compile and avoid doing it on every
request

**Parameters:**

Name | Type |
------ | ------ |
`route` | RouteNode |

**Returns:** *void*