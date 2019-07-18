> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [RouteGroupContract](_poppinss_http_server.routegroupcontract.md) /

# Interface: RouteGroupContract <**Context**>

Shape of route group class

## Type parameters

▪ **Context**

## Hierarchy

* **RouteGroupContract**

## Implemented by

* [RouteGroup](../classes/_poppinss_http_server.routegroup.md)

## Index

### Properties

* [routes](_poppinss_http_server.routegroupcontract.md#routes)

### Methods

* [as](_poppinss_http_server.routegroupcontract.md#as)
* [domain](_poppinss_http_server.routegroupcontract.md#domain)
* [middleware](_poppinss_http_server.routegroupcontract.md#middleware)
* [namespace](_poppinss_http_server.routegroupcontract.md#namespace)
* [prefix](_poppinss_http_server.routegroupcontract.md#prefix)
* [where](_poppinss_http_server.routegroupcontract.md#where)

## Properties

###  routes

• **routes**: *[RouteContract](_poppinss_http_server.routecontract.md)‹*`Context`*› | [RouteResourceContract](_poppinss_http_server.routeresourcecontract.md)‹*`Context`*› | [BriskRouteContract](_poppinss_http_server.briskroutecontract.md)‹*`Context`*› | [RouteGroupContract](_poppinss_http_server.routegroupcontract.md)‹*`Context`*›[]*

## Methods

###  as

▸ **as**(`name`: string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *this*

___

###  domain

▸ **domain**(`domain`: string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`domain` | string |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: any | any[]): *this*

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | any \| any[] |

**Returns:** *this*

___

###  namespace

▸ **namespace**(`namespace`: string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`namespace` | string |

**Returns:** *this*

___

###  prefix

▸ **prefix**(`prefix`: string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`prefix` | string |

**Returns:** *this*

___

###  where

▸ **where**(`param`: string, `matcher`: `RegExp` | string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | `RegExp` \| string |

**Returns:** *this*