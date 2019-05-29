[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [Router](../classes/_poppinss_http_server.router.md)

# Class: Router

Router class exposes unified API to create new routes, group them or create route resources.

*__example__*:
 ```ts
const router = new Router()

router.get('/', async function () {
  // handle request
})
```

## Type parameters
#### Context 
## Hierarchy

**Router**

## Implements

* [RouterContract](../interfaces/_poppinss_http_server.routercontract.md)<`Context`>

## Index

### Constructors

* [constructor](_poppinss_http_server.router.md#constructor)

### Properties

* [BriskRoute](_poppinss_http_server.router.md#briskroute)
* [Route](_poppinss_http_server.router.md#route)
* [RouteGroup](_poppinss_http_server.router.md#routegroup)
* [RouteResource](_poppinss_http_server.router.md#routeresource)
* [routes](_poppinss_http_server.router.md#routes)

### Methods

* [any](_poppinss_http_server.router.md#any)
* [commit](_poppinss_http_server.router.md#commit)
* [destroy](_poppinss_http_server.router.md#destroy)
* [find](_poppinss_http_server.router.md#find)
* [forTesting](_poppinss_http_server.router.md#fortesting)
* [get](_poppinss_http_server.router.md#get)
* [group](_poppinss_http_server.router.md#group)
* [namespace](_poppinss_http_server.router.md#namespace)
* [on](_poppinss_http_server.router.md#on)
* [patch](_poppinss_http_server.router.md#patch)
* [post](_poppinss_http_server.router.md#post)
* [put](_poppinss_http_server.router.md#put)
* [resource](_poppinss_http_server.router.md#resource)
* [route](_poppinss_http_server.router.md#route-1)
* [shallowResource](_poppinss_http_server.router.md#shallowresource)
* [toJSON](_poppinss_http_server.router.md#tojson)
* [urlFor](_poppinss_http_server.router.md#urlfor)
* [where](_poppinss_http_server.router.md#where)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Router**(_routeProcessor?: *`undefined` \| `function`*): [Router](_poppinss_http_server.router.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` _routeProcessor | `undefined` \| `function` |

**Returns:** [Router](_poppinss_http_server.router.md)

___

## Properties

<a id="briskroute"></a>

###  BriskRoute

**● BriskRoute**: *[BriskRoute](_poppinss_http_server.briskroute.md)* =  BriskRoute

Exposing BriskRoute, RouteGroup and RouteResource constructors to be extended from outside

___
<a id="route"></a>

###  Route

**● Route**: *[Route](_poppinss_http_server.route.md)* =  Route

___
<a id="routegroup"></a>

###  RouteGroup

**● RouteGroup**: *[RouteGroup](_poppinss_http_server.routegroup.md)* =  RouteGroup

___
<a id="routeresource"></a>

###  RouteResource

**● RouteResource**: *[RouteResource](_poppinss_http_server.routeresource.md)* =  RouteResource

___
<a id="routes"></a>

###  routes

**● routes**: *([Route](_poppinss_http_server.route.md)<`Context`> \| [RouteResource](_poppinss_http_server.routeresource.md)<`Context`> \| [RouteGroup](_poppinss_http_server.routegroup.md)<`Context`> \| [BriskRoute](_poppinss_http_server.briskroute.md)<`Context`>)[]* =  []

Collection of routes, including route resource and route group. To get a flat list of routes, call `router.toJSON()`

___

## Methods

<a id="any"></a>

###  any

▸ **any**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Define a route that handles all common HTTP methods

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="commit"></a>

###  commit

▸ **commit**(): `void`

Commit routes to the store. After this, no more routes can be registered.

**Returns:** `void`

___
<a id="destroy"></a>

###  destroy

▸ **destroy**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Define `DELETE` route

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="find"></a>

###  find

▸ **find**(url: *`string`*, method: *`string`*, domain?: *`undefined` \| `string`*): `null` \| [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)<`Context`>

Find route for a given URL, method and optionally domain

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |
| method | `string` |
| `Optional` domain | `undefined` \| `string` |

**Returns:** `null` \| [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)<`Context`>

___
<a id="fortesting"></a>

###  forTesting

▸ **forTesting**(pattern?: *`undefined` \| `string`*, methods?: *`string`[]*, handler?: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Creates a route when writing tests and auto-commits it to the routes store. Do not use this method inside your routes file.

The global matchers doesn't work for testing routes and hence you have define inline matchers (if required). Also testing routes should be created to test the route functionality, they should be created to test middleware or validators by hitting a route from outside in.

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` pattern | `undefined` \| `string` |
| `Optional` methods | `string`[] |
| `Optional` handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="get"></a>

###  get

▸ **get**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Define `GET` route

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="group"></a>

###  group

▸ **group**(callback: *`function`*): [RouteGroup](_poppinss_http_server.routegroup.md)<`Context`>

Creates a group of routes. A route group can apply transforms to routes in bulk

**Parameters:**

| Name | Type |
| ------ | ------ |
| callback | `function` |

**Returns:** [RouteGroup](_poppinss_http_server.routegroup.md)<`Context`>

___
<a id="namespace"></a>

###  namespace

▸ **namespace**(namespace: *`string`*): `this`

Define global controllers namespace for all the routes

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `this`

___
<a id="on"></a>

###  on

▸ **on**(pattern: *`string`*): [BriskRoute](_poppinss_http_server.briskroute.md)<`Context`>

Returns a brisk route instance for a given URL pattern

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |

**Returns:** [BriskRoute](_poppinss_http_server.briskroute.md)<`Context`>

___
<a id="patch"></a>

###  patch

▸ **patch**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Define `PATCH` route

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="post"></a>

###  post

▸ **post**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Define `POST` route

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="put"></a>

###  put

▸ **put**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Define `PUT` route

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="resource"></a>

###  resource

▸ **resource**(resource: *`string`*, controller: *`string`*): [RouteResource](_poppinss_http_server.routeresource.md)<`Context`>

Registers a route resource with conventional set of routes

**Parameters:**

| Name | Type |
| ------ | ------ |
| resource | `string` |
| controller | `string` |

**Returns:** [RouteResource](_poppinss_http_server.routeresource.md)<`Context`>

___
<a id="route-1"></a>

###  route

▸ **route**(pattern: *`string`*, methods: *`string`[]*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): [Route](_poppinss_http_server.route.md)<`Context`>

Add route for a given pattern and methods

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| methods | `string`[] |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

___
<a id="shallowresource"></a>

###  shallowResource

▸ **shallowResource**(resource: *`string`*, controller: *`string`*): [RouteResource](_poppinss_http_server.routeresource.md)<`Context`>

Register a route resource with shallow nested routes.

**Parameters:**

| Name | Type |
| ------ | ------ |
| resource | `string` |
| controller | `string` |

**Returns:** [RouteResource](_poppinss_http_server.routeresource.md)<`Context`>

___
<a id="tojson"></a>

###  toJSON

▸ **toJSON**(): (`object` & `object`)[]

Returns a flat list of routes JSON

**Returns:** (`object` & `object`)[]

___
<a id="urlfor"></a>

###  urlFor

▸ **urlFor**(pattern: *`string`*, options: *`object`*, domain?: *`undefined` \| `string`*): `null` \| `string`

Makes the URL for a pre-registered route. The `params` is required to substitute values for dynamic segments and `qs` is optional for adding query string.

If the domain for the route is defined, then a protocol relative URL for that domain will be returned.

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| options | `object` |
| `Optional` domain | `undefined` \| `string` |

**Returns:** `null` \| `string`

___
<a id="where"></a>

###  where

▸ **where**(param: *`string`*, matcher: *`string` \| `RegExp`*): `this`

Define global route matcher

**Parameters:**

| Name | Type |
| ------ | ------ |
| param | `string` |
| matcher | `string` \| `RegExp` |

**Returns:** `this`

___

