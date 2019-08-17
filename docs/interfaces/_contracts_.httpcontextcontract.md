> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["contracts"](../modules/_contracts_.md) / [HttpContextContract](_contracts_.httpcontextcontract.md) /

# Interface: HttpContextContract

Http request context passed to all middleware
and route handler

## Hierarchy

* **HttpContextContract**

## Implemented by

* [HttpContext](../classes/_httpcontext_index_.httpcontext.md)

## Index

### Properties

* [logger](_contracts_.httpcontextcontract.md#logger)
* [params](_contracts_.httpcontextcontract.md#optional-params)
* [profiler](_contracts_.httpcontextcontract.md#profiler)
* [request](_contracts_.httpcontextcontract.md#request)
* [response](_contracts_.httpcontextcontract.md#response)
* [route](_contracts_.httpcontextcontract.md#optional-route)
* [subdomains](_contracts_.httpcontextcontract.md#optional-subdomains)

## Properties

###  logger

• **logger**: *`LoggerContract`*

___

### `Optional` params

• **params**? : *any*

___

###  profiler

• **profiler**: *`ProfilerRowContract`*

___

###  request

• **request**: *`RequestContract`*

___

###  response

• **response**: *`ResponseContract`*

___

### `Optional` route

• **route**? : *[RouteNode](../modules/_contracts_.md#routenode)‹*this*›*

___

### `Optional` subdomains

• **subdomains**? : *any*