**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["Router/Resource"](../modules/_router_resource_.md) › [RouteResource](_router_resource_.routeresource.md)

# Class: RouteResource <**Context**>

Resource route helps in defining multiple conventional routes. The support
for shallow routes makes it super easy to avoid deeply nested routes.
Learn more http://weblog.jamisbuck.org/2007/2/5/nesting-resources.

**`example`** 
```ts
const resource = new RouteResource('articles', 'ArticlesController')
```

## Type parameters

▪ **Context**

## Hierarchy

* Macroable

  * **RouteResource**

## Implements

* [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)‹Context›

## Index

### Constructors

* [constructor](_router_resource_.routeresource.md#constructor)

### Properties

* [routes](_router_resource_.routeresource.md#routes)
* [_getters](_router_resource_.routeresource.md#static-protected-_getters)
* [_macros](_router_resource_.routeresource.md#static-protected-_macros)

### Methods

* [apiOnly](_router_resource_.routeresource.md#apionly)
* [except](_router_resource_.routeresource.md#except)
* [middleware](_router_resource_.routeresource.md#middleware)
* [namespace](_router_resource_.routeresource.md#namespace)
* [only](_router_resource_.routeresource.md#only)
* [where](_router_resource_.routeresource.md#where)
* [getGetter](_router_resource_.routeresource.md#static-getgetter)
* [getMacro](_router_resource_.routeresource.md#static-getmacro)
* [getter](_router_resource_.routeresource.md#static-getter)
* [hasGetter](_router_resource_.routeresource.md#static-hasgetter)
* [hasMacro](_router_resource_.routeresource.md#static-hasmacro)
* [hydrate](_router_resource_.routeresource.md#static-hydrate)
* [macro](_router_resource_.routeresource.md#static-macro)

## Constructors

###  constructor

\+ **new RouteResource**(`_resource`: string, `_controller`: string, `_namespace`: string, `_globalMatchers`: [RouteMatchers](../modules/_contracts_.md#routematchers), `_shallow`: boolean): *[RouteResource](_router_resource_.routeresource.md)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`_resource` | string | - |
`_controller` | string | - |
`_namespace` | string | - |
`_globalMatchers` | [RouteMatchers](../modules/_contracts_.md#routematchers) | - |
`_shallow` | boolean | false |

**Returns:** *[RouteResource](_router_resource_.routeresource.md)*

## Properties

###  routes

• **routes**: *[Route](_router_route_.route.md)‹Context›[]* =  []

*Implementation of [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md).[routes](../interfaces/_contracts_.routeresourcecontract.md#routes)*

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

###  apiOnly

▸ **apiOnly**(): *this*

*Implementation of [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)*

Register api only routes. The `create` and `edit` routes, which
are meant to show forms will not be registered

**Returns:** *this*

___

###  except

▸ **except**(`names`: string[]): *this*

*Implementation of [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)*

Register all routes, except the one's defined

**Parameters:**

Name | Type |
------ | ------ |
`names` | string[] |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: object): *this*

Add middleware to routes inside the resource

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | object |

**Returns:** *this*

___

###  namespace

▸ **namespace**(`namespace`: string): *this*

*Implementation of [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)*

Define namespace for all the routes inside a given resource

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  only

▸ **only**(`names`: string[]): *this*

*Implementation of [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)*

Register only given routes and remove others

**Parameters:**

Name | Type |
------ | ------ |
`names` | string[] |

**Returns:** *this*

___

###  where

▸ **where**(`key`: string, `matcher`: string | RegExp): *this*

*Implementation of [RouteResourceContract](../interfaces/_contracts_.routeresourcecontract.md)*

Define matcher for params inside the resource

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
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