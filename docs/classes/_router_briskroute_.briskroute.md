**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["Router/BriskRoute"](../modules/_router_briskroute_.md) › [BriskRoute](_router_briskroute_.briskroute.md)

# Class: BriskRoute <**Context**>

Brisk route enables you to expose expressive API for
defining route handler.

For example: AdonisJs uses [BriskRoute](_router_briskroute_.briskroute.md) `Route.on().render()`
to render a view without defining a controller method or
closure.

## Type parameters

▪ **Context**

## Hierarchy

* Macroable

  * **BriskRoute**

## Implements

* [BriskRouteContract](../interfaces/_contracts_.briskroutecontract.md)‹Context›

## Index

### Constructors

* [constructor](_router_briskroute_.briskroute.md#constructor)

### Properties

* [route](_router_briskroute_.briskroute.md#route)
* [_getters](_router_briskroute_.briskroute.md#static-protected-_getters)
* [_macros](_router_briskroute_.briskroute.md#static-protected-_macros)

### Methods

* [setHandler](_router_briskroute_.briskroute.md#sethandler)
* [getGetter](_router_briskroute_.briskroute.md#static-getgetter)
* [getMacro](_router_briskroute_.briskroute.md#static-getmacro)
* [getter](_router_briskroute_.briskroute.md#static-getter)
* [hasGetter](_router_briskroute_.briskroute.md#static-hasgetter)
* [hasMacro](_router_briskroute_.briskroute.md#static-hasmacro)
* [hydrate](_router_briskroute_.briskroute.md#static-hydrate)
* [macro](_router_briskroute_.briskroute.md#static-macro)

## Constructors

###  constructor

\+ **new BriskRoute**(`_pattern`: string, `_namespace`: string, `_globalMatchers`: [RouteMatchers](../modules/_contracts_.md#routematchers)): *[BriskRoute](_router_briskroute_.briskroute.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_pattern` | string |
`_namespace` | string |
`_globalMatchers` | [RouteMatchers](../modules/_contracts_.md#routematchers) |

**Returns:** *[BriskRoute](_router_briskroute_.briskroute.md)*

## Properties

###  route

• **route**: *null | [Route](_router_route_.route.md)‹Context›* =  null

*Implementation of [BriskRouteContract](../interfaces/_contracts_.briskroutecontract.md).[route](../interfaces/_contracts_.briskroutecontract.md#route)*

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

▸ **setHandler**(`handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹Context›, `invokedBy`: string, `methods?`: string[]): *[Route](_router_route_.route.md)‹Context›*

Set handler for the brisk route. The `invokedBy` string is the reference
to the method that calls this method. It is required to create human
readable error message when `setHandler` is called for multiple
times.

**Parameters:**

Name | Type |
------ | ------ |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹Context› |
`invokedBy` | string |
`methods?` | string[] |

**Returns:** *[Route](_router_route_.route.md)‹Context›*

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