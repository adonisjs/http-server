**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["Router/Route"](../modules/_router_route_.md) › [Route](_router_route_.route.md)

# Class: Route <**Context**>

Route class is used to construct consistent [RouteDefinition](../modules/_contracts_.md#routedefinition) using
fluent API. An instance of route is usually obtained using the
[Router](_router_index_.router.md) class helper methods.

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

* Macroable

  * **Route**

## Implements

* [RouteContract](../interfaces/_contracts_.routecontract.md)‹Context›

## Index

### Constructors

* [constructor](_router_route_.route.md#constructor)

### Properties

* [deleted](_router_route_.route.md#deleted)
* [name](_router_route_.route.md#name)
* [_getters](_router_route_.route.md#static-protected-_getters)
* [_macros](_router_route_.route.md#static-protected-_macros)

### Methods

* [as](_router_route_.route.md#as)
* [domain](_router_route_.route.md#domain)
* [middleware](_router_route_.route.md#middleware)
* [namespace](_router_route_.route.md#namespace)
* [prefix](_router_route_.route.md#prefix)
* [toJSON](_router_route_.route.md#tojson)
* [where](_router_route_.route.md#where)
* [getGetter](_router_route_.route.md#static-getgetter)
* [getMacro](_router_route_.route.md#static-getmacro)
* [getter](_router_route_.route.md#static-getter)
* [hasGetter](_router_route_.route.md#static-hasgetter)
* [hasMacro](_router_route_.route.md#static-hasmacro)
* [hydrate](_router_route_.route.md#static-hydrate)
* [macro](_router_route_.route.md#static-macro)

## Constructors

###  constructor

\+ **new Route**(`_pattern`: string, `_methods`: string[], `_handler`: any, `_namespace`: string, `_globalMatchers`: [RouteMatchers](../modules/_contracts_.md#routematchers)): *[Route](_router_route_.route.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_pattern` | string |
`_methods` | string[] |
`_handler` | any |
`_namespace` | string |
`_globalMatchers` | [RouteMatchers](../modules/_contracts_.md#routematchers) |

**Returns:** *[Route](_router_route_.route.md)*

## Properties

###  deleted

• **deleted**: *boolean* = false

*Implementation of [RouteContract](../interfaces/_contracts_.routecontract.md).[deleted](../interfaces/_contracts_.routecontract.md#deleted)*

A boolean to prevent route from getting registered within
the [Store](_router_store_.store.md).

This flag must be set before [Router.commit](_router_index_.router.md#commit) method

___

###  name

• **name**: *string*

*Implementation of [RouteContract](../interfaces/_contracts_.routecontract.md).[name](../interfaces/_contracts_.routecontract.md#name)*

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
name. This option is exposed for [RouteGroup](../interfaces/_contracts_.routercontract.md#routegroup)

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
middleware. The option is exposed for [RouteGroup](../interfaces/_contracts_.routercontract.md#routegroup)

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

*Implementation of [RouteContract](../interfaces/_contracts_.routecontract.md)*

Define prefix for the route. Calling this method for multiple times will
override the existing prefix.

This method is mainly exposed for the [RouteGroup](../interfaces/_contracts_.routercontract.md#routegroup)

**Parameters:**

Name | Type |
------ | ------ |
`prefix` | string |

**Returns:** *this*

___

###  toJSON

▸ **toJSON**(): *[RouteDefinition](../modules/_contracts_.md#routedefinition)‹Context›*

*Implementation of [RouteContract](../interfaces/_contracts_.routecontract.md)*

Returns [RouteDefinition](../modules/_contracts_.md#routedefinition) that can be passed to the [Store](_router_store_.store.md) for
registering the route

**Returns:** *[RouteDefinition](../modules/_contracts_.md#routedefinition)‹Context›*

___

###  where

▸ **where**(`param`: string, `matcher`: string | RegExp): *this*

*Implementation of [RouteContract](../interfaces/_contracts_.routecontract.md)*

Define Regex matcher for a given param

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| RegExp |

**Returns:** *this*

___

### `Static` getGetter

▸ **getGetter**(`name`: string): *MacroableFn | undefined*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn | undefined*

___

### `Static` getMacro

▸ **getMacro**(`name`: string): *MacroableFn | undefined*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn | undefined*

___

### `Static` getter

▸ **getter**(`name`: string, `callback`: MacroableFn, `singleton?`: undefined | false | true): *void*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn |
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

▸ **macro**(`name`: string, `callback`: MacroableFn): *void*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn |

**Returns:** *void*