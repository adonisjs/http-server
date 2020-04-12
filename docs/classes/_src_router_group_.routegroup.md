[@adonisjs/http-server](../README.md) › ["src/Router/Group"](../modules/_src_router_group_.md) › [RouteGroup](_src_router_group_.routegroup.md)

# Class: RouteGroup

Group class exposes the API to take action on a group of routes.
The group routes must be pre-defined using the constructor.

## Hierarchy

* Macroable

  ↳ **RouteGroup**

## Implements

* RouteGroupContract

## Index

### Constructors

* [constructor](_src_router_group_.routegroup.md#constructor)

### Properties

* [routes](_src_router_group_.routegroup.md#routes)
* [getters](_src_router_group_.routegroup.md#static-protected-getters)
* [macros](_src_router_group_.routegroup.md#static-protected-macros)

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

\+ **new RouteGroup**(`routes`: [Route](_src_router_route_.route.md)‹› | [BriskRoute](_src_router_briskroute_.briskroute.md)‹› | [RouteResource](_src_router_resource_.routeresource.md)‹› | [RouteGroup](_src_router_group_.routegroup.md)‹›[]): *[RouteGroup](_src_router_group_.routegroup.md)*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [Route](_src_router_route_.route.md)‹› &#124; [BriskRoute](_src_router_briskroute_.briskroute.md)‹› &#124; [RouteResource](_src_router_resource_.routeresource.md)‹› &#124; [RouteGroup](_src_router_group_.routegroup.md)‹›[] |

**Returns:** *[RouteGroup](_src_router_group_.routegroup.md)*

## Properties

###  routes

• **routes**: *[Route](_src_router_route_.route.md)‹› | [BriskRoute](_src_router_briskroute_.briskroute.md)‹› | [RouteResource](_src_router_resource_.routeresource.md)‹› | [RouteGroup](_src_router_group_.routegroup.md)‹›[]*

___

### `Static` `Protected` getters

▪ **getters**: *object*

*Overrides void*

#### Type declaration:

___

### `Static` `Protected` macros

▪ **macros**: *object*

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

▸ **middleware**(`middleware`: MiddlewareHandler | MiddlewareHandler[]): *this*

Prepend an array of middleware to all routes middleware.

**`example`** 
```ts
Route.group(() => {
}).middleware(['auth'])
```

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | MiddlewareHandler &#124; MiddlewareHandler[] |

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
`matcher` | RegExp &#124; string |

**Returns:** *this*

___

### `Static` getGetter

▸ **getGetter**(`name`: string): *MacroableFn‹any› | undefined*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[getGetter](_src_router_briskroute_.briskroute.md#static-getgetter)*

Return the existing getter or null if it doesn't exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn‹any› | undefined*

___

### `Static` getMacro

▸ **getMacro**(`name`: string): *MacroableFn‹any› | undefined*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[getMacro](_src_router_briskroute_.briskroute.md#static-getmacro)*

Return the existing macro or null if it doesn't exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn‹any› | undefined*

___

### `Static` getter

▸ **getter**<**T**>(`name`: string, `callback`: MacroableFn‹T›, `singleton?`: undefined | false | true): *void*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[getter](_src_router_briskroute_.briskroute.md#static-getter)*

Define a getter, which is invoked everytime the value is accessed. This method
also allows adding single getters, whose value is cached after first time

**`example`** 
```js
Macroable.getter('time', function () {
  return new Date().getTime()
})

console.log(new Macroable().time)

// Singletons
Macroable.getter('time', function () {
  return new Date().getTime()
}, true)

console.log(new Macroable().time)
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn‹T› |
`singleton?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

### `Static` hasGetter

▸ **hasGetter**(`name`: string): *boolean*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[hasGetter](_src_router_briskroute_.briskroute.md#static-hasgetter)*

Returns a boolean telling if a getter exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hasMacro

▸ **hasMacro**(`name`: string): *boolean*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[hasMacro](_src_router_briskroute_.briskroute.md#static-hasmacro)*

Returns a boolean telling if a macro exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hydrate

▸ **hydrate**(): *void*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[hydrate](_src_router_briskroute_.briskroute.md#static-hydrate)*

Cleanup getters and macros from the class

**Returns:** *void*

___

### `Static` macro

▸ **macro**<**T**>(`name`: string, `callback`: MacroableFn‹T›): *void*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[macro](_src_router_briskroute_.briskroute.md#static-macro)*

Add a macro to the class. This method is a better to manually adding
to `class.prototype.method`.

Also macros added using `Macroable.macro` can be cleared anytime

**`example`** 
```js
Macroable.macro('getUsername', function () {
  return 'virk'
})
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn‹T› |

**Returns:** *void*
