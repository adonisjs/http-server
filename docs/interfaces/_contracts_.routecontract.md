> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["contracts"](../modules/_contracts_.md) / [RouteContract](_contracts_.routecontract.md) /

# Interface: RouteContract <**Context**>

Shape of route class

## Type parameters

▪ **Context**

## Hierarchy

* **RouteContract**

## Implemented by

* [Route](../classes/_router_route_.route.md)

## Index

### Properties

* [deleted](_contracts_.routecontract.md#deleted)
* [name](_contracts_.routecontract.md#name)

### Methods

* [as](_contracts_.routecontract.md#as)
* [domain](_contracts_.routecontract.md#domain)
* [middleware](_contracts_.routecontract.md#middleware)
* [namespace](_contracts_.routecontract.md#namespace)
* [prefix](_contracts_.routecontract.md#prefix)
* [toJSON](_contracts_.routecontract.md#tojson)
* [where](_contracts_.routecontract.md#where)

## Properties

###  deleted

• **deleted**: *boolean*

___

###  name

• **name**: *string*

## Methods

###  as

▸ **as**(`name`: string, `append?`: undefined | false | true): *this*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`append?` | undefined \| false \| true |

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

▸ **middleware**(`middleware`: any | any[], `prepend?`: undefined | false | true): *this*

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | any \| any[] |
`prepend?` | undefined \| false \| true |

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

###  toJSON

▸ **toJSON**(): *[RouteDefinition](../modules/_contracts_.md#routedefinition)‹*`Context`*›*

**Returns:** *[RouteDefinition](../modules/_contracts_.md#routedefinition)‹*`Context`*›*

___

###  where

▸ **where**(`param`: string, `matcher`: string | `RegExp`): *this*

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*