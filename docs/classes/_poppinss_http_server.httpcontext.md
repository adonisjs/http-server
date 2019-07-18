> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [HttpContext](_poppinss_http_server.httpcontext.md) /

# Class: HttpContext

Http context is passed to all route handlers, middleware,
error handler and server hooks.

## Hierarchy

* **HttpContext**

## Implements

* [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md)

## Index

### Constructors

* [constructor](_poppinss_http_server.httpcontext.md#constructor)

### Properties

* [logger](_poppinss_http_server.httpcontext.md#logger)
* [params](_poppinss_http_server.httpcontext.md#optional-params)
* [request](_poppinss_http_server.httpcontext.md#request)
* [response](_poppinss_http_server.httpcontext.md#response)
* [route](_poppinss_http_server.httpcontext.md#optional-route)
* [subdomains](_poppinss_http_server.httpcontext.md#optional-subdomains)

### Methods

* [create](_poppinss_http_server.httpcontext.md#static-create)

## Constructors

###  constructor

\+ **new HttpContext**(`request`: `RequestContract`, `response`: `ResponseContract`, `logger`: `LoggerContract`): *[HttpContext](_poppinss_http_server.httpcontext.md)*

**Parameters:**

Name | Type |
------ | ------ |
`request` | `RequestContract` |
`response` | `ResponseContract` |
`logger` | `LoggerContract` |

**Returns:** *[HttpContext](_poppinss_http_server.httpcontext.md)*

## Properties

###  logger

• **logger**: *`LoggerContract`*

*Implementation of [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md).[logger](../interfaces/_poppinss_http_server.httpcontextcontract.md#logger)*

___

### `Optional` params

• **params**? : *any*

*Implementation of [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md).[params](../interfaces/_poppinss_http_server.httpcontextcontract.md#optional-params)*

___

###  request

• **request**: *`RequestContract`*

*Implementation of [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md).[request](../interfaces/_poppinss_http_server.httpcontextcontract.md#request)*

___

###  response

• **response**: *`ResponseContract`*

*Implementation of [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md).[response](../interfaces/_poppinss_http_server.httpcontextcontract.md#response)*

___

### `Optional` route

• **route**? : *[RouteNode](../modules/_poppinss_http_server.md#routenode)‹*this*›*

*Implementation of [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md).[route](../interfaces/_poppinss_http_server.httpcontextcontract.md#optional-route)*

___

### `Optional` subdomains

• **subdomains**? : *any*

*Implementation of [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md).[subdomains](../interfaces/_poppinss_http_server.httpcontextcontract.md#optional-subdomains)*

## Methods

### `Static` create

▸ **create**(`routePattern`: string, `routeParams`: any, `req?`: `IncomingMessage`, `res?`: `ServerResponse`, `serverConfig?`: [ServerConfigContract](../modules/_poppinss_http_server.md#serverconfigcontract)): *[HttpContext](_poppinss_http_server.httpcontext.md)*

Creates a new fake context instance for a given route.

**Parameters:**

Name | Type |
------ | ------ |
`routePattern` | string |
`routeParams` | any |
`req?` | `IncomingMessage` |
`res?` | `ServerResponse` |
`serverConfig?` | [ServerConfigContract](../modules/_poppinss_http_server.md#serverconfigcontract) |

**Returns:** *[HttpContext](_poppinss_http_server.httpcontext.md)*