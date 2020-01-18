[@adonisjs/http-server](../README.md) › ["src/Router/Resource"](../modules/_src_router_resource_.md) › [RouteResource](_src_router_resource_.routeresource.md)

# Class: RouteResource

Resource route helps in defining multiple conventional routes. The support
for shallow routes makes it super easy to avoid deeply nested routes.
Learn more http://weblog.jamisbuck.org/2007/2/5/nesting-resources.

**`example`** 
```ts
const resource = new RouteResource('articles', 'ArticlesController')
```

## Hierarchy

* Macroable

  ↳ **RouteResource**

## Implements

* RouteResourceContract

## Index

### Constructors

* [constructor](_src_router_resource_.routeresource.md#constructor)

### Properties

* [routes](_src_router_resource_.routeresource.md#routes)
* [getters](_src_router_resource_.routeresource.md#static-protected-getters)
* [macros](_src_router_resource_.routeresource.md#static-protected-macros)

### Methods

* [apiOnly](_src_router_resource_.routeresource.md#apionly)
* [as](_src_router_resource_.routeresource.md#as)
* [except](_src_router_resource_.routeresource.md#except)
* [middleware](_src_router_resource_.routeresource.md#middleware)
* [namespace](_src_router_resource_.routeresource.md#namespace)
* [only](_src_router_resource_.routeresource.md#only)
* [where](_src_router_resource_.routeresource.md#where)
* [getGetter](_src_router_resource_.routeresource.md#static-getgetter)
* [getMacro](_src_router_resource_.routeresource.md#static-getmacro)
* [getter](_src_router_resource_.routeresource.md#static-getter)
* [hasGetter](_src_router_resource_.routeresource.md#static-hasgetter)
* [hasMacro](_src_router_resource_.routeresource.md#static-hasmacro)
* [hydrate](_src_router_resource_.routeresource.md#static-hydrate)
* [macro](_src_router_resource_.routeresource.md#static-macro)

## Constructors

###  constructor

\+ **new RouteResource**(`resource`: string, `controller`: string, `globalMatchers`: RouteMatchers, `shallow`: boolean): *[RouteResource](_src_router_resource_.routeresource.md)*

*Overrides void*

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`resource` | string | - |
`controller` | string | - |
`globalMatchers` | RouteMatchers | - |
`shallow` | boolean | false |

**Returns:** *[RouteResource](_src_router_resource_.routeresource.md)*

## Properties

###  routes

• **routes**: *[Route](_src_router_route_.route.md)[]* = []

A copy of routes that belongs to this resource

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

###  apiOnly

▸ **apiOnly**(): *this*

Register api only routes. The `create` and `edit` routes, which
are meant to show forms will not be registered

**Returns:** *this*

___

###  as

▸ **as**(`name`: string): *this*

Prepend name to the routes names

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *this*

___

###  except

▸ **except**(`names`: string[]): *this*

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

Define namespace for all the routes inside a given resource

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  only

▸ **only**(`names`: string[]): *this*

Register only given routes and remove others

**Parameters:**

Name | Type |
------ | ------ |
`names` | string[] |

**Returns:** *this*

___

###  where

▸ **where**(`key`: string, `matcher`: string | RegExp): *this*

Define matcher for params inside the resource

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`matcher` | string &#124; RegExp |

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
