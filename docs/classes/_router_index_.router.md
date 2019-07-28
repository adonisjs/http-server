> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["Router/index"](../modules/_router_index_.md) / [Router](_router_index_.router.md) /

# Class: Router <**Context**>

Router class exposes unified API to create new routes, group them or
create route resources.

**`example`** 
```ts
const router = new Router()

router.get('/', async function () {
  // handle request
})
```

## Type parameters

▪ **Context**

## Hierarchy

* **Router**

## Implements

* [RouterContract](../interfaces/_contracts_.routercontract.md)‹*`Context`*›

## Index

### Constructors

* [constructor](_router_index_.router.md#constructor)

### Properties

* [BriskRoute](_router_index_.router.md#briskroute)
* [Route](_router_index_.router.md#route)
* [RouteGroup](_router_index_.router.md#routegroup)
* [RouteResource](_router_index_.router.md#routeresource)
* [routes](_router_index_.router.md#routes)

### Methods

* [any](_router_index_.router.md#any)
* [commit](_router_index_.router.md#commit)
* [destroy](_router_index_.router.md#destroy)
* [forTesting](_router_index_.router.md#fortesting)
* [get](_router_index_.router.md#get)
* [group](_router_index_.router.md#group)
* [lookup](_router_index_.router.md#lookup)
* [match](_router_index_.router.md#match)
* [namespace](_router_index_.router.md#namespace)
* [on](_router_index_.router.md#on)
* [patch](_router_index_.router.md#patch)
* [post](_router_index_.router.md#post)
* [put](_router_index_.router.md#put)
* [resource](_router_index_.router.md#resource)
* [route](_router_index_.router.md#route)
* [shallowResource](_router_index_.router.md#shallowresource)
* [toJSON](_router_index_.router.md#tojson)
* [where](_router_index_.router.md#where)

## Constructors

###  constructor

\+ **new Router**(`_routeProcessor?`: undefined | function): *[Router](_router_index_.router.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_routeProcessor?` | undefined \| function |

**Returns:** *[Router](_router_index_.router.md)*

## Properties

###  BriskRoute

• **BriskRoute**: *[BriskRoute](_router_briskroute_.briskroute.md)* =  BriskRoute

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md).[BriskRoute](../interfaces/_contracts_.routercontract.md#briskroute)*

Exposing BriskRoute, RouteGroup and RouteResource constructors
to be extended from outside

___

###  Route

• **Route**: *[Route](_router_route_.route.md)* =  Route

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md).[Route](../interfaces/_contracts_.routercontract.md#route)*

___

###  RouteGroup

• **RouteGroup**: *[RouteGroup](_router_group_.routegroup.md)* =  RouteGroup

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md).[RouteGroup](../interfaces/_contracts_.routercontract.md#routegroup)*

___

###  RouteResource

• **RouteResource**: *[RouteResource](_router_resource_.routeresource.md)* =  RouteResource

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md).[RouteResource](../interfaces/_contracts_.routercontract.md#routeresource)*

___

###  routes

• **routes**: *[Route](_router_route_.route.md)‹*`Context`*› | [RouteResource](_router_resource_.routeresource.md)‹*`Context`*› | [RouteGroup](_router_group_.routegroup.md)‹*`Context`*› | [BriskRoute](_router_briskroute_.briskroute.md)‹*`Context`*›[]* =  []

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md).[routes](../interfaces/_contracts_.routercontract.md#routes)*

Collection of routes, including route resource and route
group. To get a flat list of routes, call `router.toJSON()`

## Methods

###  any

▸ **any**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define a route that handles all common HTTP methods

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  commit

▸ **commit**(): *void*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Commit routes to the store. After this, no more
routes can be registered.

**Returns:** *void*

___

###  destroy

▸ **destroy**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define `DELETE` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  forTesting

▸ **forTesting**(`pattern?`: undefined | string, `methods?`: string[], `handler?`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

Creates a route when writing tests and auto-commits it to the
routes store. Do not use this method inside your routes file.

The global matchers doesn't work for testing routes and hence you have
define inline matchers (if required). Also testing routes should be
created to test the route functionality, they should be created to
test middleware or validators by hitting a route from outside in.

**Parameters:**

Name | Type |
------ | ------ |
`pattern?` | undefined \| string |
`methods?` | string[] |
`handler?` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  get

▸ **get**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define `GET` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  group

▸ **group**(`callback`: function): *[RouteGroup](_router_group_.routegroup.md)‹*`Context`*›*

Creates a group of routes. A route group can apply transforms
to routes in bulk

**Parameters:**

▪ **callback**: *function*

▸ (): *void*

**Returns:** *[RouteGroup](_router_group_.routegroup.md)‹*`Context`*›*

___

###  lookup

▸ **lookup**(`routeIdentifier`: string, `forDomain?`: undefined | string): *null | [RouteLookupNode](../modules/_contracts_.md#routelookupnode)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Look route for a given `pattern`, `route handler` or `route name`. Later this
info can be used to make url for a given route.

**Parameters:**

Name | Type |
------ | ------ |
`routeIdentifier` | string |
`forDomain?` | undefined \| string |

**Returns:** *null | [RouteLookupNode](../modules/_contracts_.md#routelookupnode)‹*`Context`*›*

___

###  match

▸ **match**(`url`: string, `method`: string, `domain?`: undefined | string): *null | [MatchedRoute](../modules/_contracts_.md#matchedroute)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Find route for a given URL, method and optionally domain

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`method` | string |
`domain?` | undefined \| string |

**Returns:** *null | [MatchedRoute](../modules/_contracts_.md#matchedroute)‹*`Context`*›*

___

###  namespace

▸ **namespace**(`namespace`: string): *this*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define global controllers namespace for all the
routes

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  on

▸ **on**(`pattern`: string): *[BriskRoute](_router_briskroute_.briskroute.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Returns a brisk route instance for a given URL pattern

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |

**Returns:** *[BriskRoute](_router_briskroute_.briskroute.md)‹*`Context`*›*

___

###  patch

▸ **patch**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define `PATCH` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  post

▸ **post**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define `POST` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  put

▸ **put**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define `PUT` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  resource

▸ **resource**(`resource`: string, `controller`: string): *[RouteResource](_router_resource_.routeresource.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Registers a route resource with conventional set of routes

**Parameters:**

Name | Type |
------ | ------ |
`resource` | string |
`controller` | string |

**Returns:** *[RouteResource](_router_resource_.routeresource.md)‹*`Context`*›*

___

###  route

▸ **route**(`pattern`: string, `methods`: string[], `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *[Route](_router_route_.route.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Add route for a given pattern and methods

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`methods` | string[] |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *[Route](_router_route_.route.md)‹*`Context`*›*

___

###  shallowResource

▸ **shallowResource**(`resource`: string, `controller`: string): *[RouteResource](_router_resource_.routeresource.md)‹*`Context`*›*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Register a route resource with shallow nested routes.

**Parameters:**

Name | Type |
------ | ------ |
`resource` | string |
`controller` | string |

**Returns:** *[RouteResource](_router_resource_.routeresource.md)‹*`Context`*›*

___

###  toJSON

▸ **toJSON**(): *object & object[]*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Returns a flat list of routes JSON

**Returns:** *object & object[]*

___

###  where

▸ **where**(`param`: string, `matcher`: string | `RegExp`): *this*

*Implementation of [RouterContract](../interfaces/_contracts_.routercontract.md)*

Define global route matcher

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*