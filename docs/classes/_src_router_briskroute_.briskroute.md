[@adonisjs/http-server](../README.md) › ["src/Router/BriskRoute"](../modules/_src_router_briskroute_.md) › [BriskRoute](_src_router_briskroute_.briskroute.md)

# Class: BriskRoute

Brisk route enables you to expose expressive API for
defining route handler.

For example: AdonisJs uses [BriskRoute](_src_router_briskroute_.briskroute.md) `Route.on().render()`
to render a view without defining a controller method or
closure.

## Hierarchy

* Macroable

  ↳ **BriskRoute**

## Implements

* BriskRouteContract

## Index

### Constructors

* [constructor](_src_router_briskroute_.briskroute.md#constructor)

### Properties

* [route](_src_router_briskroute_.briskroute.md#route)
* [getters](_src_router_briskroute_.briskroute.md#static-protected-getters)
* [macros](_src_router_briskroute_.briskroute.md#static-protected-macros)

### Methods

* [setHandler](_src_router_briskroute_.briskroute.md#sethandler)
* [getGetter](_src_router_briskroute_.briskroute.md#static-getgetter)
* [getMacro](_src_router_briskroute_.briskroute.md#static-getmacro)
* [getter](_src_router_briskroute_.briskroute.md#static-getter)
* [hasGetter](_src_router_briskroute_.briskroute.md#static-hasgetter)
* [hasMacro](_src_router_briskroute_.briskroute.md#static-hasmacro)
* [hydrate](_src_router_briskroute_.briskroute.md#static-hydrate)
* [macro](_src_router_briskroute_.briskroute.md#static-macro)

## Constructors

###  constructor

\+ **new BriskRoute**(`pattern`: string, `globalMatchers`: RouteMatchers): *[BriskRoute](_src_router_briskroute_.briskroute.md)*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`globalMatchers` | RouteMatchers |

**Returns:** *[BriskRoute](_src_router_briskroute_.briskroute.md)*

## Properties

###  route

• **route**: *null | [Route](_src_router_route_.route.md)* = null

Reference to route instance. Set after `setHandler` is called

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

###  setHandler

▸ **setHandler**(`handler`: RouteHandler, `invokedBy`: string, `methods?`: string[]): *[Route](_src_router_route_.route.md)*

Set handler for the brisk route. The `invokedBy` string is the reference
to the method that calls this method. It is required to create human
readable error message when `setHandler` is called for multiple
times.

**Parameters:**

Name | Type |
------ | ------ |
`handler` | RouteHandler |
`invokedBy` | string |
`methods?` | string[] |

**Returns:** *[Route](_src_router_route_.route.md)*

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
