**[@adonisjs/http-server](../README.md)**

[Globals](../README.md) › ["src/Router/index"](../modules/_src_router_index_.md) › [Router](_src_router_index_.router.md)

# Class: Router

Router class exposes unified API to create new routes, group them or
create route resources.

**`example`** 
```ts
const router = new Router()

router.get('/', async function () {
  // handle request
})
```

## Hierarchy

* **Router**

## Implements

* RouterContract

## Index

### Constructors

* [constructor](_src_router_index_.router.md#constructor)

### Properties

* [BriskRoute](_src_router_index_.router.md#briskroute)
* [Route](_src_router_index_.router.md#route)
* [RouteGroup](_src_router_index_.router.md#routegroup)
* [RouteResource](_src_router_index_.router.md#routeresource)
* [routes](_src_router_index_.router.md#routes)

### Methods

* [any](_src_router_index_.router.md#any)
* [commit](_src_router_index_.router.md#commit)
* [destroy](_src_router_index_.router.md#destroy)
* [forTesting](_src_router_index_.router.md#fortesting)
* [get](_src_router_index_.router.md#get)
* [group](_src_router_index_.router.md#group)
* [lookup](_src_router_index_.router.md#lookup)
* [match](_src_router_index_.router.md#match)
* [on](_src_router_index_.router.md#on)
* [patch](_src_router_index_.router.md#patch)
* [post](_src_router_index_.router.md#post)
* [put](_src_router_index_.router.md#put)
* [resource](_src_router_index_.router.md#resource)
* [route](_src_router_index_.router.md#route)
* [shallowResource](_src_router_index_.router.md#shallowresource)
* [toJSON](_src_router_index_.router.md#tojson)
* [where](_src_router_index_.router.md#where)

## Constructors

###  constructor

\+ **new Router**(`_routeProcessor?`: undefined | function): *[Router](_src_router_index_.router.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_routeProcessor?` | undefined \| function |

**Returns:** *[Router](_src_router_index_.router.md)*

## Properties

###  BriskRoute

• **BriskRoute**: *[BriskRoute](_src_router_briskroute_.briskroute.md)* =  BriskRoute

Exposing BriskRoute, RouteGroup and RouteResource constructors
to be extended from outside

___

###  Route

• **Route**: *[Route](_src_router_route_.route.md)* =  Route

___

###  RouteGroup

• **RouteGroup**: *[RouteGroup](_src_router_group_.routegroup.md)* =  RouteGroup

___

###  RouteResource

• **RouteResource**: *[RouteResource](_src_router_resource_.routeresource.md)* =  RouteResource

___

###  routes

• **routes**: *[Route](_src_router_route_.route.md) | [BriskRoute](_src_router_briskroute_.briskroute.md) | [RouteResource](_src_router_resource_.routeresource.md) | [RouteGroup](_src_router_group_.routegroup.md)[]* =  []

Collection of routes, including route resource and route
group. To get a flat list of routes, call `router.toJSON()`

## Methods

###  any

▸ **any**(`pattern`: string, `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Define a route that handles all common HTTP methods

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  commit

▸ **commit**(): *void*

Commit routes to the store. After this, no more
routes can be registered.

**Returns:** *void*

___

###  destroy

▸ **destroy**(`pattern`: string, `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Define `DELETE` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  forTesting

▸ **forTesting**(`pattern?`: undefined | string, `methods?`: string[], `handler?`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

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
`handler?` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  get

▸ **get**(`pattern`: string, `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Define `GET` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  group

▸ **group**(`callback`: function): *[RouteGroup](_src_router_group_.routegroup.md)*

Creates a group of routes. A route group can apply transforms
to routes in bulk

**Parameters:**

▪ **callback**: *function*

▸ (): *void*

**Returns:** *[RouteGroup](_src_router_group_.routegroup.md)*

___

###  lookup

▸ **lookup**(`routeIdentifier`: string, `forDomain?`: undefined | string): *null | RouteLookupNode*

Look route for a given `pattern`, `route handler` or `route name`. Later this
info can be used to make url for a given route.

**Parameters:**

Name | Type |
------ | ------ |
`routeIdentifier` | string |
`forDomain?` | undefined \| string |

**Returns:** *null | RouteLookupNode*

___

###  match

▸ **match**(`url`: string, `method`: string, `domain?`: undefined | string): *null | MatchedRoute*

Find route for a given URL, method and optionally domain

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`method` | string |
`domain?` | undefined \| string |

**Returns:** *null | MatchedRoute*

___

###  on

▸ **on**(`pattern`: string): *[BriskRoute](_src_router_briskroute_.briskroute.md)*

Returns a brisk route instance for a given URL pattern

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |

**Returns:** *[BriskRoute](_src_router_briskroute_.briskroute.md)*

___

###  patch

▸ **patch**(`pattern`: string, `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Define `PATCH` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  post

▸ **post**(`pattern`: string, `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Define `POST` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  put

▸ **put**(`pattern`: string, `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Define `PUT` route

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  resource

▸ **resource**(`resource`: string, `controller`: string): *[RouteResource](_src_router_resource_.routeresource.md)*

Registers a route resource with conventional set of routes

**Parameters:**

Name | Type |
------ | ------ |
`resource` | string |
`controller` | string |

**Returns:** *[RouteResource](_src_router_resource_.routeresource.md)*

___

###  route

▸ **route**(`pattern`: string, `methods`: string[], `handler`: RouteHandlerNode): *[Route](_src_router_route_.route.md)*

Add route for a given pattern and methods

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`methods` | string[] |
`handler` | RouteHandlerNode |

**Returns:** *[Route](_src_router_route_.route.md)*

___

###  shallowResource

▸ **shallowResource**(`resource`: string, `controller`: string): *[RouteResource](_src_router_resource_.routeresource.md)*

Register a route resource with shallow nested routes.

**Parameters:**

Name | Type |
------ | ------ |
`resource` | string |
`controller` | string |

**Returns:** *[RouteResource](_src_router_resource_.routeresource.md)*

___

###  toJSON

▸ **toJSON**(): *object & object[]*

Returns a flat list of routes JSON

**Returns:** *object & object[]*

___

###  where

▸ **where**(`param`: string, `matcher`: string | RegExp): *this*

Define global route matcher

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| RegExp |

**Returns:** *this*