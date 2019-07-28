> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["contracts"](../modules/_contracts_.md) / [RouterContract](_contracts_.routercontract.md) /

# Interface: RouterContract <**Context, Route, Group, Resource, Brisk**>

Shape of router exposed for creating routes

## Type parameters

▪ **Context**

▪ **Route**

▪ **Group**

▪ **Resource**

▪ **Brisk**

## Hierarchy

* **RouterContract**

## Implemented by

* [Router](../classes/_router_index_.router.md)

## Index

### Properties

* [BriskRoute](_contracts_.routercontract.md#briskroute)
* [Route](_contracts_.routercontract.md#route)
* [RouteGroup](_contracts_.routercontract.md#routegroup)
* [RouteResource](_contracts_.routercontract.md#routeresource)
* [routes](_contracts_.routercontract.md#routes)

### Methods

* [any](_contracts_.routercontract.md#any)
* [commit](_contracts_.routercontract.md#commit)
* [destroy](_contracts_.routercontract.md#destroy)
* [forTesting](_contracts_.routercontract.md#fortesting)
* [get](_contracts_.routercontract.md#get)
* [group](_contracts_.routercontract.md#group)
* [lookup](_contracts_.routercontract.md#lookup)
* [match](_contracts_.routercontract.md#match)
* [namespace](_contracts_.routercontract.md#namespace)
* [on](_contracts_.routercontract.md#on)
* [patch](_contracts_.routercontract.md#patch)
* [post](_contracts_.routercontract.md#post)
* [put](_contracts_.routercontract.md#put)
* [resource](_contracts_.routercontract.md#resource)
* [route](_contracts_.routercontract.md#route)
* [shallowResource](_contracts_.routercontract.md#shallowresource)
* [toJSON](_contracts_.routercontract.md#tojson)
* [where](_contracts_.routercontract.md#where)

## Properties

###  BriskRoute

• **BriskRoute**: *`MacroableConstructorContract`*

___

###  Route

• **Route**: *`MacroableConstructorContract`*

___

###  RouteGroup

• **RouteGroup**: *`MacroableConstructorContract`*

___

###  RouteResource

• **RouteResource**: *`MacroableConstructorContract`*

___

###  routes

• **routes**: *[RouteContract](_contracts_.routecontract.md)‹*`Context`*› | [RouteResourceContract](_contracts_.routeresourcecontract.md)‹*`Context`*› | [RouteGroupContract](_contracts_.routegroupcontract.md)‹*`Context`*› | [BriskRouteContract](_contracts_.briskroutecontract.md)‹*`Context`*›[]*

## Methods

###  any

▸ **any**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  commit

▸ **commit**(): *void*

**Returns:** *void*

___

###  destroy

▸ **destroy**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  forTesting

▸ **forTesting**(`pattern?`: undefined | string, `methods?`: string[], `handler?`: any): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern?` | undefined \| string |
`methods?` | string[] |
`handler?` | any |

**Returns:** *`Route`*

___

###  get

▸ **get**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  group

▸ **group**(`callback`: function): *`Group`*

**Parameters:**

▪ **callback**: *function*

▸ (): *void*

**Returns:** *`Group`*

___

###  lookup

▸ **lookup**(`routeIdentifier`: string, `domain?`: undefined | string): *null | [RouteLookupNode](../modules/_contracts_.md#routelookupnode)‹*`Context`*›*

**Parameters:**

Name | Type |
------ | ------ |
`routeIdentifier` | string |
`domain?` | undefined \| string |

**Returns:** *null | [RouteLookupNode](../modules/_contracts_.md#routelookupnode)‹*`Context`*›*

___

###  match

▸ **match**(`url`: string, `method`: string, `domain?`: undefined | string): *null | [MatchedRoute](../modules/_contracts_.md#matchedroute)‹*`Context`*›*

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`method` | string |
`domain?` | undefined \| string |

**Returns:** *null | [MatchedRoute](../modules/_contracts_.md#matchedroute)‹*`Context`*›*

___

###  namespace

▸ **namespace**(`namespace`: string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  on

▸ **on**(`pattern`: string): *`Brisk`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |

**Returns:** *`Brisk`*

___

###  patch

▸ **patch**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  post

▸ **post**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  put

▸ **put**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  resource

▸ **resource**(`resource`: string, `controller`: string): *`Resource`*

**Parameters:**

Name | Type |
------ | ------ |
`resource` | string |
`controller` | string |

**Returns:** *`Resource`*

___

###  route

▸ **route**(`pattern`: string, `methods`: string[], `handler`: [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`methods` | string[] |
`handler` | [RouteHandlerNode](../modules/_contracts_.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  shallowResource

▸ **shallowResource**(`resource`: string, `controller`: string): *`Resource`*

**Parameters:**

Name | Type |
------ | ------ |
`resource` | string |
`controller` | string |

**Returns:** *`Resource`*

___

###  toJSON

▸ **toJSON**(): *[RouteNode](../modules/_contracts_.md#routenode)‹*`Context`*›[]*

**Returns:** *[RouteNode](../modules/_contracts_.md#routenode)‹*`Context`*›[]*

___

###  where

▸ **where**(`key`: string, `matcher`: string | `RegExp`): *this*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*