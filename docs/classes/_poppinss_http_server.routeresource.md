[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [RouteResource](../classes/_poppinss_http_server.routeresource.md)

# Class: RouteResource

Resource route helps in defining multiple conventional routes. The support for shallow routes makes it super easy to avoid deeply nested routes. Learn more [http://weblog.jamisbuck.org/2007/2/5/nesting-resources](http://weblog.jamisbuck.org/2007/2/5/nesting-resources).

*__example__*:
 ```ts
const resource = new RouteResource('articles', 'ArticlesController')
```

## Type parameters
#### Context 
## Hierarchy

 `Macroable`

**↳ RouteResource**

## Implements

* [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)<`Context`>

## Index

### Constructors

* [constructor](_poppinss_http_server.routeresource.md#constructor)

### Properties

* [routes](_poppinss_http_server.routeresource.md#routes)
* [_getters](_poppinss_http_server.routeresource.md#_getters)
* [_macros](_poppinss_http_server.routeresource.md#_macros)

### Methods

* [apiOnly](_poppinss_http_server.routeresource.md#apionly)
* [except](_poppinss_http_server.routeresource.md#except)
* [middleware](_poppinss_http_server.routeresource.md#middleware)
* [namespace](_poppinss_http_server.routeresource.md#namespace)
* [only](_poppinss_http_server.routeresource.md#only)
* [where](_poppinss_http_server.routeresource.md#where)
* [getGetter](_poppinss_http_server.routeresource.md#getgetter)
* [getMacro](_poppinss_http_server.routeresource.md#getmacro)
* [getter](_poppinss_http_server.routeresource.md#getter)
* [hasGetter](_poppinss_http_server.routeresource.md#hasgetter)
* [hasMacro](_poppinss_http_server.routeresource.md#hasmacro)
* [hydrate](_poppinss_http_server.routeresource.md#hydrate)
* [macro](_poppinss_http_server.routeresource.md#macro)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new RouteResource**(_resource: *`string`*, _controller: *`string`*, _namespace: *`string`*, _globalMatchers: *[RouteMatchers](../modules/_poppinss_http_server.md#routematchers)*, _shallow?: *`boolean`*): [RouteResource](_poppinss_http_server.routeresource.md)

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| _resource | `string` | - |
| _controller | `string` | - |
| _namespace | `string` | - |
| _globalMatchers | [RouteMatchers](../modules/_poppinss_http_server.md#routematchers) | - |
| `Default value` _shallow | `boolean` | false |

**Returns:** [RouteResource](_poppinss_http_server.routeresource.md)

___

## Properties

<a id="routes"></a>

###  routes

**● routes**: *[Route](_poppinss_http_server.route.md)<`Context`>[]* =  []

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

<a id="apionly"></a>

###  apiOnly

▸ **apiOnly**(): `this`

Register api only routes. The `create` and `edit` routes, which are meant to show forms will not be registered

**Returns:** `this`

___
<a id="except"></a>

###  except

▸ **except**(names: *`string`[]*): `this`

Register all routes, except the one's defined

**Parameters:**

| Name | Type |
| ------ | ------ |
| names | `string`[] |

**Returns:** `this`

___
<a id="middleware"></a>

###  middleware

▸ **middleware**(middleware: *`object`*): `this`

Add middleware to routes inside the resource

**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | `object` |

**Returns:** `this`

___
<a id="namespace"></a>

###  namespace

▸ **namespace**(namespace: *`string`*): `this`

Define namespace for all the routes inside a given resource

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `this`

___
<a id="only"></a>

###  only

▸ **only**(names: *`string`[]*): `this`

Register only given routes and remove others

**Parameters:**

| Name | Type |
| ------ | ------ |
| names | `string`[] |

**Returns:** `this`

___
<a id="where"></a>

###  where

▸ **where**(key: *`string`*, matcher: *`string` \| `RegExp`*): `this`

Define matcher for params inside the resource

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| matcher | `string` \| `RegExp` |

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

