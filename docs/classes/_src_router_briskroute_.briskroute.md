**[@adonisjs/http-server](../README.md)**

[Globals](../README.md) › [&quot;src/Router/BriskRoute&quot;](../modules/_src_router_briskroute_.md) › [BriskRoute](_src_router_briskroute_.briskroute.md)

# Class: BriskRoute

Brisk route enables you to expose expressive API for
defining route handler.

For example: AdonisJs uses [BriskRoute](_src_router_briskroute_.briskroute.md) `Route.on().render()`
to render a view without defining a controller method or
closure.

## Hierarchy

* Macroable

  * **BriskRoute**

## Implements

* BriskRouteContract

## Index

### Constructors

* [constructor](_src_router_briskroute_.briskroute.md#constructor)

### Properties

* [route](_src_router_briskroute_.briskroute.md#route)
* [_getters](_src_router_briskroute_.briskroute.md#static-protected-_getters)
* [_macros](_src_router_briskroute_.briskroute.md#static-protected-_macros)

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

\+ **new BriskRoute**(`_pattern`: string, `_globalMatchers`: RouteMatchers): *[BriskRoute](_src_router_briskroute_.briskroute.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_pattern` | string |
`_globalMatchers` | RouteMatchers |

**Returns:** *[BriskRoute](_src_router_briskroute_.briskroute.md)*

## Properties

###  route

• **route**: *null | [Route](_src_router_route_.route.md)* =  null

Reference to route instance. Set after `setHandler` is called

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

###  setHandler

▸ **setHandler**(`handler`: RouteHandlerNode, `invokedBy`: string, `methods?`: string[]): *[Route](_src_router_route_.route.md)*

Set handler for the brisk route. The `invokedBy` string is the reference
to the method that calls this method. It is required to create human
readable error message when `setHandler` is called for multiple
times.

**Parameters:**

Name | Type |
------ | ------ |
`handler` | RouteHandlerNode |
`invokedBy` | string |
`methods?` | string[] |

**Returns:** *[Route](_src_router_route_.route.md)*

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
`singleton?` | undefined &#124; false &#124; true |

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