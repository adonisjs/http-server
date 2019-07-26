> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["Server/routePreProcessor"](_server_routepreprocessor_.md) /

# External module: "Server/routePreProcessor"

## Index

### Functions

* [routePreProcessor](_server_routepreprocessor_.md#routepreprocessor)

## Functions

###  routePreProcessor

▸ **routePreProcessor**<**Context**>(`route`: [RouteNode](_contracts_.md#routenode)‹*`Context`*›, `middlewareStore`: [MiddlewareStoreContract](../interfaces/_contracts_.middlewarestorecontract.md)‹*`Context`*›): *void*

Hooks into route registration lifecycle and attaches finalHandler to
execute the route middleware and final handler.

We pre-compile routes and final handler to a single function, which improves
the performance by reducing the overhead of processing middleware on each
request

**Type parameters:**

▪ **Context**

**Parameters:**

Name | Type |
------ | ------ |
`route` | [RouteNode](_contracts_.md#routenode)‹*`Context`*› |
`middlewareStore` | [MiddlewareStoreContract](../interfaces/_contracts_.middlewarestorecontract.md)‹*`Context`*› |

**Returns:** *void*