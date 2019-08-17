> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["contracts"](_contracts_.md) /

# External module: "contracts"

## Index

### Interfaces

* [BriskRouteContract](../interfaces/_contracts_.briskroutecontract.md)
* [HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md)
* [MiddlewareStoreContract](../interfaces/_contracts_.middlewarestorecontract.md)
* [RouteContract](../interfaces/_contracts_.routecontract.md)
* [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)
* [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)
* [RouterContract](../interfaces/_contracts_.routercontract.md)
* [ServerContract](../interfaces/_contracts_.servercontract.md)

### Type aliases

* [DomainNode](_contracts_.md#domainnode)
* [ErrorHandlerNode](_contracts_.md#errorhandlernode)
* [HookNode](_contracts_.md#hooknode)
* [MatchedRoute](_contracts_.md#matchedroute)
* [MethodNode](_contracts_.md#methodnode)
* [MiddlewareNode](_contracts_.md#middlewarenode)
* [ResolvedControllerNode](_contracts_.md#resolvedcontrollernode)
* [ResolvedMiddlewareNode](_contracts_.md#resolvedmiddlewarenode)
* [RouteDefinition](_contracts_.md#routedefinition)
* [RouteHandlerNode](_contracts_.md#routehandlernode)
* [RouteLookupNode](_contracts_.md#routelookupnode)
* [RouteMatchers](_contracts_.md#routematchers)
* [RouteNode](_contracts_.md#routenode)
* [RoutesTree](_contracts_.md#routestree)
* [ServerConfigContract](_contracts_.md#serverconfigcontract)

## Type aliases

###  DomainNode

Ƭ **DomainNode**: *object*

Each domain node will have an object of methods and then
a nested object of routes

#### Type declaration:

* \[ **method**: *string*\]: [MethodNode](_contracts_.md#methodnode)‹*`Context`*›

___

###  ErrorHandlerNode

Ƭ **ErrorHandlerNode**: *function*

Error handler node

#### Type declaration:

▸ (`error`: any, `ctx`: `Context`): *`Promise<any>`*

**Parameters:**

Name | Type |
------ | ------ |
`error` | any |
`ctx` | `Context` |

___

###  HookNode

Ƭ **HookNode**: *function*

Before hooks are executed before finding the route or finding
middleware

#### Type declaration:

▸ (`ctx`: `Context`): *`Promise<void>`*

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | `Context` |

___

###  MatchedRoute

Ƭ **MatchedRoute**: *object*

Shape of the matched route for a pattern, method and domain. We set
them as spread options to the context.

#### Type declaration:

___

###  MethodNode

Ƭ **MethodNode**: *object*

An object of routes for a given HTTP method

#### Type declaration:

___

###  MiddlewareNode

Ƭ **MiddlewareNode**: *string | function*

Input middleware node must be function or a string pointing
to the IoC container

___

###  ResolvedControllerNode

Ƭ **ResolvedControllerNode**: *object | object*

Node after resolving controller.method binding
from the route

___

###  ResolvedMiddlewareNode

Ƭ **ResolvedMiddlewareNode**: *object | object*

Shape of resolved middleware. This information is
enough to execute the middleware

___

###  RouteDefinition

Ƭ **RouteDefinition**: *[RouteNode](_contracts_.md#routenode)‹*`Context`*› & object*

Route definition returned as a result of `route.toJSON` method

___

###  RouteHandlerNode

Ƭ **RouteHandlerNode**: *function | string*

The shape of the route handler

___

###  RouteLookupNode

Ƭ **RouteLookupNode**: *object*

Route look node is used to find the routes using
handler, pattern or name.

#### Type declaration:

___

###  RouteMatchers

Ƭ **RouteMatchers**: *object*

Shape of route param matchers

#### Type declaration:

* \[ **param**: *string*\]: `RegExp`

___

###  RouteNode

Ƭ **RouteNode**: *object*

Route node persisted within the store

#### Type declaration:

___

###  RoutesTree

Ƭ **RoutesTree**: *object*

Routes tree is a domain of DomainNodes

#### Type declaration:

___

###  ServerConfigContract

Ƭ **ServerConfigContract**: *`RequestConfigContract` & `ResponseConfigContract`*

Config requried by request and response