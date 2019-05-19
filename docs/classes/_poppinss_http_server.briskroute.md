[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [BriskRoute](../classes/_poppinss_http_server.briskroute.md)

# Class: BriskRoute

Brisk route enables you to expose expressive API for defining route handler.

For example: AdonisJs uses [BriskRoute](_poppinss_http_server.briskroute.md) `Route.on().render()` to render a view without defining a controller method or closure.

## Type parameters
#### Context 
## Hierarchy

 `Macroable`

**↳ BriskRoute**

## Implements

* `BriskRouteContract`<`Context`>

## Index

### Constructors

* [constructor](_poppinss_http_server.briskroute.md#constructor)

### Properties

* [route](_poppinss_http_server.briskroute.md#route)
* [_getters](_poppinss_http_server.briskroute.md#_getters)
* [_macros](_poppinss_http_server.briskroute.md#_macros)

### Methods

* [setHandler](_poppinss_http_server.briskroute.md#sethandler)
* [getGetter](_poppinss_http_server.briskroute.md#getgetter)
* [getMacro](_poppinss_http_server.briskroute.md#getmacro)
* [getter](_poppinss_http_server.briskroute.md#getter)
* [hasGetter](_poppinss_http_server.briskroute.md#hasgetter)
* [hasMacro](_poppinss_http_server.briskroute.md#hasmacro)
* [hydrate](_poppinss_http_server.briskroute.md#hydrate)
* [macro](_poppinss_http_server.briskroute.md#macro)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new BriskRoute**(_pattern: *`string`*, _namespace: *`string`*, _globalMatchers: *`RouteMatchers`*): [BriskRoute](_poppinss_http_server.briskroute.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| _pattern | `string` |
| _namespace | `string` |
| _globalMatchers | `RouteMatchers` |

**Returns:** [BriskRoute](_poppinss_http_server.briskroute.md)

___

## Properties

<a id="route"></a>

###  route

**● route**: *`null` \| [Route](_poppinss_http_server.route.md)<`Context`>* =  null

Reference to route instance. Set after `setHandler` is called

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

<a id="sethandler"></a>

###  setHandler

▸ **setHandler**(handler: *`RouteHandlerNode`<`Context`>*, invokedBy: *`string`*, methods?: *`string`[]*): [Route](_poppinss_http_server.route.md)<`Context`>

Set handler for the brisk route. The `invokedBy` string is the reference to the method that calls this method. It is required to create human readable error message when `setHandler` is called for multiple times.

**Parameters:**

| Name | Type |
| ------ | ------ |
| handler | `RouteHandlerNode`<`Context`> |
| invokedBy | `string` |
| `Optional` methods | `string`[] |

**Returns:** [Route](_poppinss_http_server.route.md)<`Context`>

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

