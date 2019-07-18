> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [HttpContextContract](_poppinss_http_server.httpcontextcontract.md) /

# Interface: HttpContextContract

Http request context passed to all middleware
and route handler

## Hierarchy

* **HttpContextContract**

## Implemented by

* [HttpContext](../classes/_poppinss_http_server.httpcontext.md)

## Index

### Properties

* [logger](_poppinss_http_server.httpcontextcontract.md#logger)
* [params](_poppinss_http_server.httpcontextcontract.md#optional-params)
* [request](_poppinss_http_server.httpcontextcontract.md#request)
* [response](_poppinss_http_server.httpcontextcontract.md#response)
* [route](_poppinss_http_server.httpcontextcontract.md#optional-route)
* [subdomains](_poppinss_http_server.httpcontextcontract.md#optional-subdomains)

## Properties

###  logger

• **logger**: *`LoggerContract`*

___

### `Optional` params

• **params**? : *any*

___

###  request

• **request**: *`RequestContract`*

___

###  response

• **response**: *`ResponseContract`*

___

### `Optional` route

• **route**? : *[RouteNode](../modules/_poppinss_http_server.md#routenode)‹*this*›*

___

### `Optional` subdomains

• **subdomains**? : *any*