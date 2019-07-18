> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [RouteResource](_poppinss_http_server.routeresource.md) /

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

* `Macroable`

  * **RouteResource**

## Implements

* [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)‹*`Context`*›

## Index

### Constructors

* [constructor](_poppinss_http_server.routeresource.md#constructor)

### Properties

* [routes](_poppinss_http_server.routeresource.md#routes)
* [_getters](_poppinss_http_server.routeresource.md#static-protected-_getters)
* [_macros](_poppinss_http_server.routeresource.md#static-protected-_macros)

### Methods

* [apiOnly](_poppinss_http_server.routeresource.md#apionly)
* [except](_poppinss_http_server.routeresource.md#except)
* [middleware](_poppinss_http_server.routeresource.md#middleware)
* [namespace](_poppinss_http_server.routeresource.md#namespace)
* [only](_poppinss_http_server.routeresource.md#only)
* [where](_poppinss_http_server.routeresource.md#where)
* [getGetter](_poppinss_http_server.routeresource.md#static-getgetter)
* [getMacro](_poppinss_http_server.routeresource.md#static-getmacro)
* [getter](_poppinss_http_server.routeresource.md#static-getter)
* [hasGetter](_poppinss_http_server.routeresource.md#static-hasgetter)
* [hasMacro](_poppinss_http_server.routeresource.md#static-hasmacro)
* [hydrate](_poppinss_http_server.routeresource.md#static-hydrate)
* [macro](_poppinss_http_server.routeresource.md#static-macro)

## Constructors

###  constructor

\+ **new RouteResource**(`_resource`: string, `_controller`: string, `_namespace`: string, `_globalMatchers`: [RouteMatchers](../modules/_poppinss_http_server.md#routematchers), `_shallow`: boolean): *[RouteResource](_poppinss_http_server.routeresource.md)*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`_resource` | string | - |
`_controller` | string | - |
`_namespace` | string | - |
`_globalMatchers` | [RouteMatchers](../modules/_poppinss_http_server.md#routematchers) | - |
`_shallow` | boolean | false |

**Returns:** *[RouteResource](_poppinss_http_server.routeresource.md)*

## Properties

###  routes

• **routes**: *[Route](_poppinss_http_server.route.md)‹*`Context`*›[]* =  []

*Implementation of [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md).[routes](../interfaces/_poppinss_http_server.routeresourcecontract.md#routes)*

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

*Implementation of [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)*

Register api only routes. The `create` and `edit` routes, which
are meant to show forms will not be registered

**Returns:** *this*

___

###  except

▸ **except**(`names`: string[]): *this*

*Implementation of [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)*

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

*Implementation of [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)*

Define namespace for all the routes inside a given resource

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  only

▸ **only**(`names`: string[]): *this*

*Implementation of [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)*

Register only given routes and remove others

**Parameters:**

Name | Type |
------ | ------ |
`names` | string[] |

**Returns:** *this*

___

###  where

▸ **where**(`key`: string, `matcher`: string | `RegExp`): *this*

*Implementation of [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)*

Define matcher for params inside the resource

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
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