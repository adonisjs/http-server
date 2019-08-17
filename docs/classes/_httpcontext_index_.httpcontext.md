> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["HttpContext/index"](../modules/_httpcontext_index_.md) / [HttpContext](_httpcontext_index_.httpcontext.md) /

# Class: HttpContext

Http context is passed to all route handlers, middleware,
error handler and server hooks.

## Hierarchy

* **HttpContext**

## Implements

* [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md)

## Index

### Constructors

* [constructor](_httpcontext_index_.httpcontext.md#constructor)

### Properties

* [logger](_httpcontext_index_.httpcontext.md#logger)
* [params](_httpcontext_index_.httpcontext.md#optional-params)
* [profiler](_httpcontext_index_.httpcontext.md#profiler)
* [request](_httpcontext_index_.httpcontext.md#request)
* [response](_httpcontext_index_.httpcontext.md#response)
* [route](_httpcontext_index_.httpcontext.md#optional-route)
* [subdomains](_httpcontext_index_.httpcontext.md#optional-subdomains)

### Methods

* [create](_httpcontext_index_.httpcontext.md#static-create)

## Constructors

###  constructor

\+ **new HttpContext**(`request`: `RequestContract`, `response`: `ResponseContract`, `logger`: `LoggerContract`, `profiler`: `ProfilerRowContract`): *[HttpContext](_httpcontext_index_.httpcontext.md)*

**Parameters:**

Name | Type |
------ | ------ |
`request` | `RequestContract` |
`response` | `ResponseContract` |
`logger` | `LoggerContract` |
`profiler` | `ProfilerRowContract` |

**Returns:** *[HttpContext](_httpcontext_index_.httpcontext.md)*

## Properties

###  logger

• **logger**: *`LoggerContract`*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[logger](../interfaces/_contracts_.httpcontextcontract.md#logger)*

___

### `Optional` params

• **params**? : *any*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[params](../interfaces/_contracts_.httpcontextcontract.md#optional-params)*

___

###  profiler

• **profiler**: *`ProfilerRowContract`*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[profiler](../interfaces/_contracts_.httpcontextcontract.md#profiler)*

___

###  request

• **request**: *`RequestContract`*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[request](../interfaces/_contracts_.httpcontextcontract.md#request)*

___

###  response

• **response**: *`ResponseContract`*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[response](../interfaces/_contracts_.httpcontextcontract.md#response)*

___

### `Optional` route

• **route**? : *[RouteNode](../modules/_contracts_.md#routenode)‹*this*›*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[route](../interfaces/_contracts_.httpcontextcontract.md#optional-route)*

___

### `Optional` subdomains

• **subdomains**? : *any*

*Implementation of [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md).[subdomains](../interfaces/_contracts_.httpcontextcontract.md#optional-subdomains)*

## Methods

### `Static` create

▸ **create**(`routePattern`: string, `routeParams`: any, `req?`: `IncomingMessage`, `res?`: `ServerResponse`, `serverConfig?`: [ServerConfigContract](../modules/_contracts_.md#serverconfigcontract)): *[HttpContext](_httpcontext_index_.httpcontext.md)*

Creates a new fake context instance for a given route.

**Parameters:**

Name | Type |
------ | ------ |
`routePattern` | string |
`routeParams` | any |
`req?` | `IncomingMessage` |
`res?` | `ServerResponse` |
`serverConfig?` | [ServerConfigContract](../modules/_contracts_.md#serverconfigcontract) |

**Returns:** *[HttpContext](_httpcontext_index_.httpcontext.md)*