[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [RouterContract](../interfaces/_poppinss_http_server.routercontract.md)

# Interface: RouterContract

Shape of router exposed for creating routes

## Type parameters
#### Context 
#### Route 
#### Group 
#### Resource 
#### Brisk 
## Hierarchy

**RouterContract**

## Implemented by

* [Router](../classes/_poppinss_http_server.router.md)

## Index

### Properties

* [BriskRoute](_poppinss_http_server.routercontract.md#briskroute)
* [Route](_poppinss_http_server.routercontract.md#route)
* [RouteGroup](_poppinss_http_server.routercontract.md#routegroup)
* [RouteResource](_poppinss_http_server.routercontract.md#routeresource)
* [routes](_poppinss_http_server.routercontract.md#routes)

### Methods

* [any](_poppinss_http_server.routercontract.md#any)
* [commit](_poppinss_http_server.routercontract.md#commit)
* [destroy](_poppinss_http_server.routercontract.md#destroy)
* [find](_poppinss_http_server.routercontract.md#find)
* [forTesting](_poppinss_http_server.routercontract.md#fortesting)
* [get](_poppinss_http_server.routercontract.md#get)
* [group](_poppinss_http_server.routercontract.md#group)
* [namespace](_poppinss_http_server.routercontract.md#namespace)
* [on](_poppinss_http_server.routercontract.md#on)
* [patch](_poppinss_http_server.routercontract.md#patch)
* [post](_poppinss_http_server.routercontract.md#post)
* [put](_poppinss_http_server.routercontract.md#put)
* [resource](_poppinss_http_server.routercontract.md#resource)
* [route](_poppinss_http_server.routercontract.md#route-1)
* [shallowResource](_poppinss_http_server.routercontract.md#shallowresource)
* [toJSON](_poppinss_http_server.routercontract.md#tojson)
* [urlFor](_poppinss_http_server.routercontract.md#urlfor)
* [where](_poppinss_http_server.routercontract.md#where)

---

## Properties

<a id="briskroute"></a>

###  BriskRoute

**● BriskRoute**: *`MacroableConstructorContract`*

___
<a id="route"></a>

###  Route

**● Route**: *`MacroableConstructorContract`*

___
<a id="routegroup"></a>

###  RouteGroup

**● RouteGroup**: *`MacroableConstructorContract`*

___
<a id="routeresource"></a>

###  RouteResource

**● RouteResource**: *`MacroableConstructorContract`*

___
<a id="routes"></a>

###  routes

**● routes**: *([RouteContract](_poppinss_http_server.routecontract.md)<`Context`> \| [RouteResourceContract](_poppinss_http_server.routeresourcecontract.md)<`Context`> \| [RouteGroupContract](_poppinss_http_server.routegroupcontract.md)<`Context`> \| [BriskRouteContract](_poppinss_http_server.briskroutecontract.md)<`Context`>)[]*

___

## Methods

<a id="any"></a>

###  any

▸ **any**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="commit"></a>

###  commit

▸ **commit**(): `void`

**Returns:** `void`

___
<a id="destroy"></a>

###  destroy

▸ **destroy**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="find"></a>

###  find

▸ **find**(url: *`string`*, method: *`string`*, domain?: *`undefined` \| `string`*): `null` \| [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)<`Context`>

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

▸ **forTesting**(pattern?: *`undefined` \| `string`*, methods?: *`string`[]*, handler?: *`any`*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| `Optional` pattern | `undefined` \| `string` |
| `Optional` methods | `string`[] |
| `Optional` handler | `any` |

**Returns:** `Route`

___
<a id="get"></a>

###  get

▸ **get**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="group"></a>

###  group

▸ **group**(callback: *`function`*): `Group`

**Parameters:**

| Name | Type |
| ------ | ------ |
| callback | `function` |

**Returns:** `Group`

___
<a id="namespace"></a>

###  namespace

▸ **namespace**(namespace: *`string`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `this`

___
<a id="on"></a>

###  on

▸ **on**(pattern: *`string`*): `Brisk`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |

**Returns:** `Brisk`

___
<a id="patch"></a>

###  patch

▸ **patch**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="post"></a>

###  post

▸ **post**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="put"></a>

###  put

▸ **put**(pattern: *`string`*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="resource"></a>

###  resource

▸ **resource**(resource: *`string`*, controller: *`string`*): `Resource`

**Parameters:**

| Name | Type |
| ------ | ------ |
| resource | `string` |
| controller | `string` |

**Returns:** `Resource`

___
<a id="route-1"></a>

###  route

▸ **route**(pattern: *`string`*, methods: *`string`[]*, handler: *[RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`>*): `Route`

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| methods | `string`[] |
| handler | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)<`Context`> |

**Returns:** `Route`

___
<a id="shallowresource"></a>

###  shallowResource

▸ **shallowResource**(resource: *`string`*, controller: *`string`*): `Resource`

**Parameters:**

| Name | Type |
| ------ | ------ |
| resource | `string` |
| controller | `string` |

**Returns:** `Resource`

___
<a id="tojson"></a>

###  toJSON

▸ **toJSON**(): [RouteNode](../modules/_poppinss_http_server.md#routenode)<`Context`>[]

**Returns:** [RouteNode](../modules/_poppinss_http_server.md#routenode)<`Context`>[]

___
<a id="urlfor"></a>

###  urlFor

▸ **urlFor**(pattern: *`string`*, options: *`object`*, domain?: *`undefined` \| `string`*): `null` \| `string`

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

▸ **where**(key: *`string`*, matcher: *`string` \| `RegExp`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| matcher | `string` \| `RegExp` |

**Returns:** `this`

___

