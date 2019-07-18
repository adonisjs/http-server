> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [Route](_poppinss_http_server.route.md) /

# Class: Route <**Context**>

Route class is used to construct consistent [RouteDefination](../modules/_poppinss_http_server.md#routedefination) using
fluent API. An instance of route is usually obtained using the
[Router](_poppinss_http_server.router.md) class helper methods.

**`example`** 
```ts
const route = new Route('posts/:id', ['GET'], async function () {
})

route
  .where('id', /^[0-9]+$/)
  .middleware(async function () {
  })
```

## Type parameters

▪ **Context**: *any*

## Hierarchy

* `Macroable`

  * **Route**

## Implements

* [RouteContract](../interfaces/_poppinss_http_server.routecontract.md)‹*`Context`*›

## Index

### Constructors

* [constructor](_poppinss_http_server.route.md#constructor)

### Properties

* [deleted](_poppinss_http_server.route.md#deleted)
* [name](_poppinss_http_server.route.md#name)
* [_getters](_poppinss_http_server.route.md#static-protected-_getters)
* [_macros](_poppinss_http_server.route.md#static-protected-_macros)

### Methods

* [as](_poppinss_http_server.route.md#as)
* [domain](_poppinss_http_server.route.md#domain)
* [middleware](_poppinss_http_server.route.md#middleware)
* [namespace](_poppinss_http_server.route.md#namespace)
* [prefix](_poppinss_http_server.route.md#prefix)
* [toJSON](_poppinss_http_server.route.md#tojson)
* [where](_poppinss_http_server.route.md#where)
* [getGetter](_poppinss_http_server.route.md#static-getgetter)
* [getMacro](_poppinss_http_server.route.md#static-getmacro)
* [getter](_poppinss_http_server.route.md#static-getter)
* [hasGetter](_poppinss_http_server.route.md#static-hasgetter)
* [hasMacro](_poppinss_http_server.route.md#static-hasmacro)
* [hydrate](_poppinss_http_server.route.md#static-hydrate)
* [macro](_poppinss_http_server.route.md#static-macro)

## Constructors

###  constructor

\+ **new Route**(`_pattern`: string, `_methods`: string[], `_handler`: any, `_namespace`: string, `_globalMatchers`: [RouteMatchers](../modules/_poppinss_http_server.md#routematchers)): *[Route](_poppinss_http_server.route.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_pattern` | string |
`_methods` | string[] |
`_handler` | any |
`_namespace` | string |
`_globalMatchers` | [RouteMatchers](../modules/_poppinss_http_server.md#routematchers) |

**Returns:** *[Route](_poppinss_http_server.route.md)*

## Properties

###  deleted

• **deleted**: *boolean* = false

*Implementation of [RouteContract](../interfaces/_poppinss_http_server.routecontract.md).[deleted](../interfaces/_poppinss_http_server.routecontract.md#deleted)*

A boolean to prevent route from getting registered within
the [Store](_poppinss_http_server.store.md).

This flag must be set before [Router.commit](_poppinss_http_server.router.md#commit) method

___

###  name

• **name**: *string*

*Implementation of [RouteContract](../interfaces/_poppinss_http_server.routecontract.md).[name](../interfaces/_poppinss_http_server.routecontract.md#name)*

A unique name to lookup the route

___

### `Static` `Protected` _getters

▪ **_getters**: *object*

*Overrides void*

#### Type declaration:

___

### `Static` `Protected` _macros

▪ **_macros**: *object*

*Overrides void*

#### Type declaration:

## Methods

###  as

▸ **as**(`name`: string, `append`: boolean): *this*

Give memorizable name to the route. This is helpful, when you
want to lookup route defination by it's name.

If `append` is true, then it will keep on appending to the existing
name. This option is exposed for [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`name` | string | - |
`append` | boolean | false |

**Returns:** *this*

___

###  domain

▸ **domain**(`domain`: string, `overwrite`: boolean): *this*

Define a custom domain for the route

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`domain` | string | - |
`overwrite` | boolean | false |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: any | any[], `prepend`: boolean): *this*

Define an array of middleware to be executed on the route. If `prepend`
is true, then middleware will be added to start of the existing
middleware. The option is exposed for [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`middleware` | any \| any[] | - |
`prepend` | boolean | false |

**Returns:** *this*

___

###  namespace

▸ **namespace**(`namespace`: string, `overwrite`: boolean): *this*

Define controller namespace for a given route

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`namespace` | string | - |
`overwrite` | boolean | false |

**Returns:** *this*

___

###  prefix

▸ **prefix**(`prefix`: string): *this*

*Implementation of [RouteContract](../interfaces/_poppinss_http_server.routecontract.md)*

Define prefix for the route. Calling this method for multiple times will
override the existing prefix.

This method is mainly exposed for the [RouteGroup](_poppinss_http_server.routegroup.md)

**Parameters:**

Name | Type |
------ | ------ |
`prefix` | string |

**Returns:** *this*

___

###  toJSON

▸ **toJSON**(): *[RouteDefination](../modules/_poppinss_http_server.md#routedefination)‹*`Context`*›*

*Implementation of [RouteContract](../interfaces/_poppinss_http_server.routecontract.md)*

Returns [RouteDefination](../modules/_poppinss_http_server.md#routedefination) that can be passed to the [Store](_poppinss_http_server.store.md) for
registering the route

**Returns:** *[RouteDefination](../modules/_poppinss_http_server.md#routedefination)‹*`Context`*›*

___

###  where

▸ **where**(`param`: string, `matcher`: string | `RegExp`): *this*

*Implementation of [RouteContract](../interfaces/_poppinss_http_server.routecontract.md)*

Define Regex matcher for a given param

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*

___

### `Static` getGetter

▸ **getGetter**(`name`: string): *`MacroableFn` | undefined*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *`MacroableFn` | undefined*

___

### `Static` getMacro

▸ **getMacro**(`name`: string): *`MacroableFn` | undefined*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *`MacroableFn` | undefined*

___

### `Static` getter

▸ **getter**(`name`: string, `callback`: `MacroableFn`, `singleton?`: undefined | false | true): *void*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | `MacroableFn` |
`singleton?` | undefined \| false \| true |

**Returns:** *void*

___

### `Static` hasGetter

▸ **hasGetter**(`name`: string): *boolean*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hasMacro

▸ **hasMacro**(`name`: string): *boolean*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hydrate

▸ **hydrate**(): *void*

*Inherited from void*

**Returns:** *void*

___

### `Static` macro

▸ **macro**(`name`: string, `callback`: `MacroableFn`): *void*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | `MacroableFn` |

**Returns:** *void*