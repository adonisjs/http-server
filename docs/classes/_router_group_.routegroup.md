> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["Router/Group"](../modules/_router_group_.md) / [RouteGroup](_router_group_.routegroup.md) /

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

* [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)‹*`Context`*›

## Index

### Constructors

* [constructor](_router_group_.routegroup.md#constructor)

### Properties

* [routes](_router_group_.routegroup.md#routes)
* [_getters](_router_group_.routegroup.md#static-protected-_getters)
* [_macros](_router_group_.routegroup.md#static-protected-_macros)

### Methods

* [as](_router_group_.routegroup.md#as)
* [domain](_router_group_.routegroup.md#domain)
* [middleware](_router_group_.routegroup.md#middleware)
* [namespace](_router_group_.routegroup.md#namespace)
* [prefix](_router_group_.routegroup.md#prefix)
* [where](_router_group_.routegroup.md#where)
* [getGetter](_router_group_.routegroup.md#static-getgetter)
* [getMacro](_router_group_.routegroup.md#static-getmacro)
* [getter](_router_group_.routegroup.md#static-getter)
* [hasGetter](_router_group_.routegroup.md#static-hasgetter)
* [hasMacro](_router_group_.routegroup.md#static-hasmacro)
* [hydrate](_router_group_.routegroup.md#static-hydrate)
* [macro](_router_group_.routegroup.md#static-macro)

## Constructors

###  constructor

\+ **new RouteGroup**(`routes`: [Route](_router_route_.route.md)‹*`Context`*› | [RouteResource](_router_resource_.routeresource.md)‹*`Context`*› | [BriskRoute](_router_briskroute_.briskroute.md)‹*`Context`*› | [RouteGroup](_router_group_.routegroup.md)‹*`Context`*›[]): *[RouteGroup](_router_group_.routegroup.md)*

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [Route](_router_route_.route.md)‹*`Context`*› \| [RouteResource](_router_resource_.routeresource.md)‹*`Context`*› \| [BriskRoute](_router_briskroute_.briskroute.md)‹*`Context`*› \| [RouteGroup](_router_group_.routegroup.md)‹*`Context`*›[] |

**Returns:** *[RouteGroup](_router_group_.routegroup.md)*

## Properties

###  routes

• **routes**: *[Route](_router_route_.route.md)‹*`Context`*› | [RouteResource](_router_resource_.routeresource.md)‹*`Context`*› | [BriskRoute](_router_briskroute_.briskroute.md)‹*`Context`*› | [RouteGroup](_router_group_.routegroup.md)‹*`Context`*›[]*

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md).[routes](../interfaces/_contracts_.routegroupcontract.md#routes)*

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

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)*

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

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)*

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

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)*

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

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)*

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

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)*

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

*Implementation of [RouteGroupContract](../interfaces/_contracts_.routegroupcontract.md)*

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