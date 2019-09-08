**[@adonisjs/http-server](../README.md)**

[Globals](../README.md) › ["src/Router/Group"](../modules/_src_router_group_.md) › [RouteGroup](_src_router_group_.routegroup.md)

# Class: RouteGroup

Group class exposes the API to take action on a group of routes.
The group routes must be pre-defined using the constructor.

## Hierarchy

* Macroable

  * **RouteGroup**

## Implements

* RouteGroupContract

## Index

### Constructors

* [constructor](_src_router_group_.routegroup.md#constructor)

### Properties

* [routes](_src_router_group_.routegroup.md#routes)
* [_getters](_src_router_group_.routegroup.md#static-protected-_getters)
* [_macros](_src_router_group_.routegroup.md#static-protected-_macros)

### Methods

* [as](_src_router_group_.routegroup.md#as)
* [domain](_src_router_group_.routegroup.md#domain)
* [middleware](_src_router_group_.routegroup.md#middleware)
* [namespace](_src_router_group_.routegroup.md#namespace)
* [prefix](_src_router_group_.routegroup.md#prefix)
* [where](_src_router_group_.routegroup.md#where)
* [getGetter](_src_router_group_.routegroup.md#static-getgetter)
* [getMacro](_src_router_group_.routegroup.md#static-getmacro)
* [getter](_src_router_group_.routegroup.md#static-getter)
* [hasGetter](_src_router_group_.routegroup.md#static-hasgetter)
* [hasMacro](_src_router_group_.routegroup.md#static-hasmacro)
* [hydrate](_src_router_group_.routegroup.md#static-hydrate)
* [macro](_src_router_group_.routegroup.md#static-macro)

## Constructors

###  constructor

\+ **new RouteGroup**(`routes`: [Route](_src_router_route_.route.md) | [BriskRoute](_src_router_briskroute_.briskroute.md) | [RouteResource](_src_router_resource_.routeresource.md) | [RouteGroup](_src_router_group_.routegroup.md)[]): *[RouteGroup](_src_router_group_.routegroup.md)*

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [Route](_src_router_route_.route.md) \| [BriskRoute](_src_router_briskroute_.briskroute.md) \| [RouteResource](_src_router_resource_.routeresource.md) \| [RouteGroup](_src_router_group_.routegroup.md)[] |

**Returns:** *[RouteGroup](_src_router_group_.routegroup.md)*

## Properties

###  routes

• **routes**: *[Route](_src_router_route_.route.md) | [BriskRoute](_src_router_briskroute_.briskroute.md) | [RouteResource](_src_router_resource_.routeresource.md) | [RouteGroup](_src_router_group_.routegroup.md)[]*

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

▸ **middleware**(`middleware`: MiddlewareNode | MiddlewareNode[]): *this*

Prepend an array of middleware to all routes middleware.

**`example`** 
```ts
Route.group(() => {
}).middleware(['auth'])
```

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | MiddlewareNode \| MiddlewareNode[] |

**Returns:** *this*

___

###  namespace

▸ **namespace**(`namespace`: string): *this*

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

▸ **where**(`param`: string, `matcher`: RegExp | string): *this*

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
`matcher` | RegExp \| string |

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