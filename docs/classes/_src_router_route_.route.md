[@adonisjs/http-server](../README.md) › ["src/Router/Route"](../modules/_src_router_route_.md) › [Route](_src_router_route_.route.md)

# Class: Route

Route class is used to construct consistent [[RouteDefinition]] using
fluent API. An instance of route is usually obtained using the
[Router](_src_router_index_.router.md) class helper methods.

**`example`** 
```ts
const route = new Route('posts/:id', ['GET'], async function () {
})

route
  .where('id', /^[0-9]+$/)
  .middleware(async function () {
  })
```

## Hierarchy

* Macroable

  ↳ **Route**

## Implements

* RouteContract

## Index

### Constructors

* [constructor](_src_router_route_.route.md#constructor)

### Properties

* [deleted](_src_router_route_.route.md#deleted)
* [name](_src_router_route_.route.md#name)
* [getters](_src_router_route_.route.md#static-protected-getters)
* [macros](_src_router_route_.route.md#static-protected-macros)

### Methods

* [as](_src_router_route_.route.md#as)
* [domain](_src_router_route_.route.md#domain)
* [middleware](_src_router_route_.route.md#middleware)
* [namespace](_src_router_route_.route.md#namespace)
* [prefix](_src_router_route_.route.md#prefix)
* [toJSON](_src_router_route_.route.md#tojson)
* [where](_src_router_route_.route.md#where)
* [getGetter](_src_router_route_.route.md#static-getgetter)
* [getMacro](_src_router_route_.route.md#static-getmacro)
* [getter](_src_router_route_.route.md#static-getter)
* [hasGetter](_src_router_route_.route.md#static-hasgetter)
* [hasMacro](_src_router_route_.route.md#static-hasmacro)
* [hydrate](_src_router_route_.route.md#static-hydrate)
* [macro](_src_router_route_.route.md#static-macro)

## Constructors

###  constructor

\+ **new Route**(`pattern`: string, `methods`: string[], `handler`: RouteHandler, `globalMatchers`: RouteMatchers): *[Route](_src_router_route_.route.md)*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`methods` | string[] |
`handler` | RouteHandler |
`globalMatchers` | RouteMatchers |

**Returns:** *[Route](_src_router_route_.route.md)*

## Properties

###  deleted

• **deleted**: *boolean* = false

A boolean to prevent route from getting registered within
the [Store](_src_router_store_.store.md).

This flag must be set before [Router.commit](_src_router_index_.router.md#commit) method

___

###  name

• **name**: *string*

A unique name to lookup the route

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

▸ **as**(`name`: string, `prepend`: boolean): *this*

Give memorizable name to the route. This is helpful, when you
want to lookup route defination by it's name.

If `prepend` is true, then it will keep on prepending to the existing
name. This option is exposed for [RouteGroup](_src_router_group_.routegroup.md)

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`name` | string | - |
`prepend` | boolean | false |

**Returns:** *this*

___

###  domain

▸ **domain**(`domain`: string, `overwrite`: boolean): *this*

Define a custom domain for the route. Again we do not overwrite the domain
unless `overwrite` flag is set to true.

This is again done to make route.domain win over route.group.domain

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`domain` | string | - |
`overwrite` | boolean | false |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: MiddlewareHandler | MiddlewareHandler[], `prepend`: boolean): *this*

Define an array of middleware to be executed on the route. If `prepend`
is true, then middleware will be added to start of the existing
middleware. The option is exposed for [RouteGroup](_src_router_group_.routegroup.md)

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`middleware` | MiddlewareHandler &#124; MiddlewareHandler[] | - |
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

Define prefix for the route. Prefixes will be concated
This method is mainly exposed for the [RouteGroup](_src_router_group_.routegroup.md)

**Parameters:**

Name | Type |
------ | ------ |
`prefix` | string |

**Returns:** *this*

___

###  toJSON

▸ **toJSON**(): *RouteJSON*

Returns [[RouteDefinition]] that can be passed to the [Store](_src_router_store_.store.md) for
registering the route

**Returns:** *RouteJSON*

___

###  where

▸ **where**(`param`: string, `matcher`: string | RegExp): *this*

Define Regex matcher for a given param. If a matcher exists, then we do not
override that, since the routes inside a group will set matchers before
the group, so they should have priority over the route matchers.

```
Route.group(() => {
  Route.get('/:id', 'handler').where('id', /^[0-9]$/)
}).where('id', /[^a-z$]/)
```

The `/^[0-9]$/` should win over the matcher defined by the group

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
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
