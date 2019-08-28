**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["contracts"](../modules/_contracts_.md) › [RouteGroupContract](_contracts_.routegroupcontract.md)

# Interface: RouteGroupContract <**Context**>

Shape of route group class

## Type parameters

▪ **Context**

## Hierarchy

* **RouteGroupContract**

## Implemented by

* [RouteGroup](../classes/_router_group_.routegroup.md)

## Index

### Properties

* [routes](_contracts_.routegroupcontract.md#routes)

### Methods

* [as](_contracts_.routegroupcontract.md#as)
* [domain](_contracts_.routegroupcontract.md#domain)
* [middleware](_contracts_.routegroupcontract.md#middleware)
* [namespace](_contracts_.routegroupcontract.md#namespace)
* [prefix](_contracts_.routegroupcontract.md#prefix)
* [where](_contracts_.routegroupcontract.md#where)

## Properties

###  routes

• **routes**: *[RouteContract](_contracts_.routecontract.md)‹Context› | [RouteResourceContract](_contracts_.routeresourcecontract.md)‹Context› | [BriskRouteContract](_contracts_.briskroutecontract.md)‹Context› | [RouteGroupContract](_contracts_.routegroupcontract.md)‹Context›[]*

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

▸ **where**(`param`: string, `matcher`: RegExp | string): *this*

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | RegExp \| string |

**Returns:** *this*