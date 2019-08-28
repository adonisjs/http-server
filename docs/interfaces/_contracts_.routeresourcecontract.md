**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["contracts"](../modules/_contracts_.md) › [RouteResourceContract](_contracts_.routeresourcecontract.md)

# Interface: RouteResourceContract <**Context**>

Shape of route resource class

## Type parameters

▪ **Context**

## Hierarchy

* **RouteResourceContract**

## Implemented by

* [RouteResource](../classes/_router_resource_.routeresource.md)

## Index

### Properties

* [routes](_contracts_.routeresourcecontract.md#routes)

### Methods

* [apiOnly](_contracts_.routeresourcecontract.md#apionly)
* [except](_contracts_.routeresourcecontract.md#except)
* [middleware](_contracts_.routeresourcecontract.md#middleware)
* [namespace](_contracts_.routeresourcecontract.md#namespace)
* [only](_contracts_.routeresourcecontract.md#only)
* [where](_contracts_.routeresourcecontract.md#where)

## Properties

###  routes

• **routes**: *[RouteContract](_contracts_.routecontract.md)‹Context›[]*

## Methods

###  apiOnly

▸ **apiOnly**(): *this*

**Returns:** *this*

___

###  except

▸ **except**(`names`: string[]): *this*

**Parameters:**

Name | Type |
------ | ------ |
`names` | string[] |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: object): *this*

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | object |

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

###  only

▸ **only**(`names`: string[]): *this*

**Parameters:**

Name | Type |
------ | ------ |
`names` | string[] |

**Returns:** *this*

___

###  where

▸ **where**(`key`: string, `matcher`: string | RegExp): *this*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`matcher` | string \| RegExp |

**Returns:** *this*