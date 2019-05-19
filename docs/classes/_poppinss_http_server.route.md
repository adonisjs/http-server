[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [Route](../classes/_poppinss_http_server.route.md)

# Class: Route

Route class is used to construct consistent \[\[RouteDefination\]\] using fluent API. An instance of route is usually obtained using the [Router](_poppinss_http_server.router.md) class helper methods.

*__example__*:
 ```js
const route = new Route('posts/:id', ['GET'], async function () {
})

route
  .where('id', /^[0-9]+$/)
  .middleware(async function () {
  })
```

## Type parameters
#### Context :  `any`
## Hierarchy

 `Macroable`

**↳ Route**

## Implements

* `RouteContract`<`Context`>

## Index

### Constructors

* [constructor](_poppinss_http_server.route.md#constructor)

### Properties

* [deleted](_poppinss_http_server.route.md#deleted)
* [name](_poppinss_http_server.route.md#name)
* [_getters](_poppinss_http_server.route.md#_getters)
* [_macros](_poppinss_http_server.route.md#_macros)

### Methods

* [as](_poppinss_http_server.route.md#as)
* [domain](_poppinss_http_server.route.md#domain)
* [middleware](_poppinss_http_server.route.md#middleware)
* [namespace](_poppinss_http_server.route.md#namespace)
* [prefix](_poppinss_http_server.route.md#prefix)
* [toJSON](_poppinss_http_server.route.md#tojson)
* [where](_poppinss_http_server.route.md#where)
* [getGetter](_poppinss_http_server.route.md#getgetter)
* [getMacro](_poppinss_http_server.route.md#getmacro)
* [getter](_poppinss_http_server.route.md#getter)
* [hasGetter](_poppinss_http_server.route.md#hasgetter)
* [hasMacro](_poppinss_http_server.route.md#hasmacro)
* [hydrate](_poppinss_http_server.route.md#hydrate)
* [macro](_poppinss_http_server.route.md#macro)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new Route**(_pattern: *`string`*, _methods: *`string`[]*, _handler: *`any`*, _namespace: *`string`*, _globalMatchers: *`RouteMatchers`*): [Route](_poppinss_http_server.route.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| _pattern | `string` |
| _methods | `string`[] |
| _handler | `any` |
| _namespace | `string` |
| _globalMatchers | `RouteMatchers` |

**Returns:** [Route](_poppinss_http_server.route.md)

___

## Properties

<a id="deleted"></a>

###  deleted

**● deleted**: *`boolean`* = false

A boolean to prevent route from getting registered within the [Store](_poppinss_http_server.store.md).

This flag must be set before [Router.commit](_poppinss_http_server.router.md#commit) method

___
<a id="name"></a>

###  name

**● name**: *`string`*

A unique name to lookup the route

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

▸ **as**(name: *`string`*, append?: *`boolean`*): `this`

Given memorizable name to the route. This is helpful, when you want to lookup route defination by it's name.

If `append` is true, then it will keep on appending to the existing name. This option is exposed for [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| name | `string` | - |
| `Default value` append | `boolean` | false |

**Returns:** `this`

___
<a id="domain"></a>

###  domain

▸ **domain**(domain: *`string`*): `this`

Define a custom domain for the route

**Parameters:**

| Name | Type |
| ------ | ------ |
| domain | `string` |

**Returns:** `this`

___
<a id="middleware"></a>

###  middleware

▸ **middleware**(middleware: *`any` \| `any`[]*, prepend?: *`boolean`*): `this`

Define an array of middleware to be executed on the route. If `prepend` is true, then middleware will be added to start of the existing middleware. The option is exposed for [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

| Name | Type | Default value |
| ------ | ------ | ------ |
| middleware | `any` \| `any`[] | - |
| `Default value` prepend | `boolean` | false |

**Returns:** `this`

___
<a id="namespace"></a>

###  namespace

▸ **namespace**(namespace: *`string`*): `this`

Define controller namespace for a given route

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `this`

___
<a id="prefix"></a>

###  prefix

▸ **prefix**(prefix: *`string`*): `this`

Define prefix for the route. Calling this method for multiple times will override the existing prefix.

This method is mainly exposed for the [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| prefix | `string` |

**Returns:** `this`

___
<a id="tojson"></a>

###  toJSON

▸ **toJSON**(): `RouteDefination`<`Context`>

Returns \[\[RouteDefination\]\] that can be passed to the [Store](_poppinss_http_server.store.md) for registering the route

**Returns:** `RouteDefination`<`Context`>

___
<a id="where"></a>

###  where

▸ **where**(param: *`string`*, matcher: *`string` \| `RegExp`*): `this`

Define Regex matcher for a given param

**Parameters:**

| Name | Type |
| ------ | ------ |
| param | `string` |
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

