> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [RouterContract](_poppinss_http_server.routercontract.md) /

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

* [Router](../classes/_poppinss_http_server.router.md)

## Index

### Properties

* [BriskRoute](_poppinss_http_server.routercontract.md#briskroute)
* [Route](_poppinss_http_server.routercontract.md#route)
* [RouteGroup](_poppinss_http_server.routercontract.md#routegroup)
* [RouteResource](_poppinss_http_server.routercontract.md#routeresource)
* [routes](_poppinss_http_server.routercontract.md#routes)

### Methods

* [any](_poppinss_http_server.routercontract.md#any)
* [commit](_poppinss_http_server.routercontract.md#commit)
* [destroy](_poppinss_http_server.routercontract.md#destroy)
* [find](_poppinss_http_server.routercontract.md#find)
* [forTesting](_poppinss_http_server.routercontract.md#fortesting)
* [get](_poppinss_http_server.routercontract.md#get)
* [group](_poppinss_http_server.routercontract.md#group)
* [namespace](_poppinss_http_server.routercontract.md#namespace)
* [on](_poppinss_http_server.routercontract.md#on)
* [patch](_poppinss_http_server.routercontract.md#patch)
* [post](_poppinss_http_server.routercontract.md#post)
* [put](_poppinss_http_server.routercontract.md#put)
* [resource](_poppinss_http_server.routercontract.md#resource)
* [route](_poppinss_http_server.routercontract.md#route)
* [shallowResource](_poppinss_http_server.routercontract.md#shallowresource)
* [toJSON](_poppinss_http_server.routercontract.md#tojson)
* [urlFor](_poppinss_http_server.routercontract.md#urlfor)
* [where](_poppinss_http_server.routercontract.md#where)

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

• **routes**: *[RouteContract](_poppinss_http_server.routecontract.md)‹*`Context`*› | [RouteResourceContract](_poppinss_http_server.routeresourcecontract.md)‹*`Context`*› | [RouteGroupContract](_poppinss_http_server.routegroupcontract.md)‹*`Context`*› | [BriskRouteContract](_poppinss_http_server.briskroutecontract.md)‹*`Context`*›[]*

## Methods

###  any

▸ **any**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  commit

▸ **commit**(): *void*

**Returns:** *void*

___

###  destroy

▸ **destroy**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  find

▸ **find**(`url`: string, `method`: string, `domain?`: undefined | string): *null | [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)‹*`Context`*›*

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`method` | string |
`domain?` | undefined \| string |

**Returns:** *null | [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)‹*`Context`*›*

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

▸ **get**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  group

▸ **group**(`callback`: function): *`Group`*

**Parameters:**

▪ **callback**: *function*

▸ (): *void*

**Returns:** *`Group`*

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

▸ **patch**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  post

▸ **post**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

**Returns:** *`Route`*

___

###  put

▸ **put**(`pattern`: string, `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

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

▸ **route**(`pattern`: string, `methods`: string[], `handler`: [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*›): *`Route`*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`methods` | string[] |
`handler` | [RouteHandlerNode](../modules/_poppinss_http_server.md#routehandlernode)‹*`Context`*› |

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

▸ **toJSON**(): *[RouteNode](../modules/_poppinss_http_server.md#routenode)‹*`Context`*›[]*

**Returns:** *[RouteNode](../modules/_poppinss_http_server.md#routenode)‹*`Context`*›[]*

___

###  urlFor

▸ **urlFor**(`pattern`: string, `options`: object, `domain?`: undefined | string): *null | string*

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`options` | object |
`domain?` | undefined \| string |

**Returns:** *null | string*

___

###  where

▸ **where**(`key`: string, `matcher`: string | `RegExp`): *this*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*