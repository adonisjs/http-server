> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [RouteGroup](_poppinss_http_server.routegroup.md) /

# Class: RouteGroup <**Context**>

Group class exposes the API to take action on a group
of routes. The group routes must be pre-defined using
the constructor.

## Type parameters

▪ **Context**

## Hierarchy

* `Macroable`

  * **RouteGroup**

## Implements

* [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)‹*`Context`*›

## Index

### Constructors

* [constructor](_poppinss_http_server.routegroup.md#constructor)

### Properties

* [routes](_poppinss_http_server.routegroup.md#routes)
* [_getters](_poppinss_http_server.routegroup.md#static-protected-_getters)
* [_macros](_poppinss_http_server.routegroup.md#static-protected-_macros)

### Methods

* [as](_poppinss_http_server.routegroup.md#as)
* [domain](_poppinss_http_server.routegroup.md#domain)
* [middleware](_poppinss_http_server.routegroup.md#middleware)
* [namespace](_poppinss_http_server.routegroup.md#namespace)
* [prefix](_poppinss_http_server.routegroup.md#prefix)
* [where](_poppinss_http_server.routegroup.md#where)
* [getGetter](_poppinss_http_server.routegroup.md#static-getgetter)
* [getMacro](_poppinss_http_server.routegroup.md#static-getmacro)
* [getter](_poppinss_http_server.routegroup.md#static-getter)
* [hasGetter](_poppinss_http_server.routegroup.md#static-hasgetter)
* [hasMacro](_poppinss_http_server.routegroup.md#static-hasmacro)
* [hydrate](_poppinss_http_server.routegroup.md#static-hydrate)
* [macro](_poppinss_http_server.routegroup.md#static-macro)

## Constructors

###  constructor

\+ **new RouteGroup**(`routes`: [Route](_poppinss_http_server.route.md)‹*`Context`*› | [RouteResource](_poppinss_http_server.routeresource.md)‹*`Context`*› | [BriskRoute](_poppinss_http_server.briskroute.md)‹*`Context`*› | [RouteGroup](_poppinss_http_server.routegroup.md)‹*`Context`*›[]): *[RouteGroup](_poppinss_http_server.routegroup.md)*

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [Route](_poppinss_http_server.route.md)‹*`Context`*› \| [RouteResource](_poppinss_http_server.routeresource.md)‹*`Context`*› \| [BriskRoute](_poppinss_http_server.briskroute.md)‹*`Context`*› \| [RouteGroup](_poppinss_http_server.routegroup.md)‹*`Context`*›[] |

**Returns:** *[RouteGroup](_poppinss_http_server.routegroup.md)*

## Properties

###  routes

• **routes**: *[Route](_poppinss_http_server.route.md)‹*`Context`*› | [RouteResource](_poppinss_http_server.routeresource.md)‹*`Context`*› | [BriskRoute](_poppinss_http_server.briskroute.md)‹*`Context`*› | [RouteGroup](_poppinss_http_server.routegroup.md)‹*`Context`*›[]*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md).[routes](../interfaces/_poppinss_http_server.routegroupcontract.md#routes)*

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

▸ **as**(`name`: string): *this*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)*

Prepend name to the routes name.

**`example`** 
```ts
Route.group(() => {
}).as('version1')
```

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *this*

___

###  domain

▸ **domain**(`domain`: string): *this*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)*

Define domain for all the routes.

**`example`** 
```ts
Route.group(() => {
}).domain(':name.adonisjs.com')
```

**Parameters:**

Name | Type |
------ | ------ |
`domain` | string |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: any | any[]): *this*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)*

Prepend an array of middleware to all routes middleware.

**`example`** 
```ts
Route.group(() => {
}).middleware(['auth'])
```

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | any \| any[] |

**Returns:** *this*

___

###  namespace

▸ **namespace**(`namespace`: string): *this*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)*

Define namespace for all the routes inside the group.

**`example`** 
```ts
Route.group(() => {
}).namespace('App/Admin/Controllers')
```

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  prefix

▸ **prefix**(`prefix`: string): *this*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)*

Define prefix all the routes in the group.

**`example`** 
```ts
Route.group(() => {
}).prefix('v1')
```

**Parameters:**

Name | Type |
------ | ------ |
`prefix` | string |

**Returns:** *this*

___

###  where

▸ **where**(`param`: string, `matcher`: `RegExp` | string): *this*

*Implementation of [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)*

Define Regex matchers for a given param for all the routes.

**`example`** 
```ts
Route.group(() => {
}).where('id', /^[0-9]+/)
```

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | `RegExp` \| string |

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