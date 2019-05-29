[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [RouteGroup](../classes/_poppinss_http_server.routegroup.md)

# Class: RouteGroup

Group class exposes the API to take action on a group of routes. The group routes must be pre-defined using the constructor.

## Type parameters
#### Context 
## Hierarchy

 `Macroable`

**↳ RouteGroup**

## Implements

* [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)<`Context`>

## Index

### Constructors

* [constructor](_poppinss_http_server.routegroup.md#constructor)

### Properties

* [routes](_poppinss_http_server.routegroup.md#routes)
* [_getters](_poppinss_http_server.routegroup.md#_getters)
* [_macros](_poppinss_http_server.routegroup.md#_macros)

### Methods

* [as](_poppinss_http_server.routegroup.md#as)
* [domain](_poppinss_http_server.routegroup.md#domain)
* [middleware](_poppinss_http_server.routegroup.md#middleware)
* [namespace](_poppinss_http_server.routegroup.md#namespace)
* [prefix](_poppinss_http_server.routegroup.md#prefix)
* [where](_poppinss_http_server.routegroup.md#where)
* [getGetter](_poppinss_http_server.routegroup.md#getgetter)
* [getMacro](_poppinss_http_server.routegroup.md#getmacro)
* [getter](_poppinss_http_server.routegroup.md#getter)
* [hasGetter](_poppinss_http_server.routegroup.md#hasgetter)
* [hasMacro](_poppinss_http_server.routegroup.md#hasmacro)
* [hydrate](_poppinss_http_server.routegroup.md#hydrate)
* [macro](_poppinss_http_server.routegroup.md#macro)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new RouteGroup**(routes: *([Route](_poppinss_http_server.route.md)<`Context`> \| [RouteResource](_poppinss_http_server.routeresource.md)<`Context`> \| [BriskRoute](_poppinss_http_server.briskroute.md)<`Context`>)[]*): [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| routes | ([Route](_poppinss_http_server.route.md)<`Context`> \| [RouteResource](_poppinss_http_server.routeresource.md)<`Context`> \| [BriskRoute](_poppinss_http_server.briskroute.md)<`Context`>)[] |

**Returns:** [RouteGroup](_poppinss_http_server.routegroup.md)

___

## Properties

<a id="routes"></a>

###  routes

**● routes**: *([Route](_poppinss_http_server.route.md)<`Context`> \| [RouteResource](_poppinss_http_server.routeresource.md)<`Context`> \| [BriskRoute](_poppinss_http_server.briskroute.md)<`Context`>)[]*

___
<a id="_getters"></a>

### `<Static>``<Protected>` _getters

**● _getters**: *`object`*

#### Type declaration

___
<a id="_macros"></a>

### `<Static>``<Protected>` _macros

**● _macros**: *`object`*

#### Type declaration

___

## Methods

<a id="as"></a>

###  as

▸ **as**(name: *`string`*): `this`

Prepend name to the routes name

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `this`

___
<a id="domain"></a>

###  domain

▸ **domain**(domain: *`string`*): `this`

Define domain for all the routes

**Parameters:**

| Name | Type |
| ------ | ------ |
| domain | `string` |

**Returns:** `this`

___
<a id="middleware"></a>

###  middleware

▸ **middleware**(middleware: *`any` \| `any`[]*): `this`

Prepend an array of middleware to all routes middleware

**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | `any` \| `any`[] |

**Returns:** `this`

___
<a id="namespace"></a>

###  namespace

▸ **namespace**(namespace: *`string`*): `this`

Define namespace for all the routes inside the group

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `this`

___
<a id="prefix"></a>

###  prefix

▸ **prefix**(prefix: *`string`*): `this`

Define prefix all the routes in the group

**Parameters:**

| Name | Type |
| ------ | ------ |
| prefix | `string` |

**Returns:** `this`

___
<a id="where"></a>

###  where

▸ **where**(param: *`string`*, matcher: *`RegExp` \| `string`*): `this`

Define Regex matchers for a given param for all the routes

**Parameters:**

| Name | Type |
| ------ | ------ |
| param | `string` |
| matcher | `RegExp` \| `string` |

**Returns:** `this`

___
<a id="getgetter"></a>

### `<Static>` getGetter

▸ **getGetter**(name: *`string`*): `MacroableFn` \| `undefined`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `MacroableFn` \| `undefined`

___
<a id="getmacro"></a>

### `<Static>` getMacro

▸ **getMacro**(name: *`string`*): `MacroableFn` \| `undefined`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `MacroableFn` \| `undefined`

___
<a id="getter"></a>

### `<Static>` getter

▸ **getter**(name: *`string`*, callback: *`MacroableFn`*, singleton?: *`undefined` \| `false` \| `true`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| callback | `MacroableFn` |
| `Optional` singleton | `undefined` \| `false` \| `true` |

**Returns:** `void`

___
<a id="hasgetter"></a>

### `<Static>` hasGetter

▸ **hasGetter**(name: *`string`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `boolean`

___
<a id="hasmacro"></a>

### `<Static>` hasMacro

▸ **hasMacro**(name: *`string`*): `boolean`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `boolean`

___
<a id="hydrate"></a>

### `<Static>` hydrate

▸ **hydrate**(): `void`

**Returns:** `void`

___
<a id="macro"></a>

### `<Static>` macro

▸ **macro**(name: *`string`*, callback: *`MacroableFn`*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |
| callback | `MacroableFn` |

**Returns:** `void`

___

