> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [RouteResourceContract](_poppinss_http_server.routeresourcecontract.md) /

# Interface: RouteResourceContract <**Context**>

Shape of route resource class

## Type parameters

▪ **Context**

## Hierarchy

* **RouteResourceContract**

## Implemented by

* [RouteResource](../classes/_poppinss_http_server.routeresource.md)

## Index

### Properties

* [routes](_poppinss_http_server.routeresourcecontract.md#routes)

### Methods

* [apiOnly](_poppinss_http_server.routeresourcecontract.md#apionly)
* [except](_poppinss_http_server.routeresourcecontract.md#except)
* [middleware](_poppinss_http_server.routeresourcecontract.md#middleware)
* [namespace](_poppinss_http_server.routeresourcecontract.md#namespace)
* [only](_poppinss_http_server.routeresourcecontract.md#only)
* [where](_poppinss_http_server.routeresourcecontract.md#where)

## Properties

###  routes

• **routes**: *[RouteContract](_poppinss_http_server.routecontract.md)‹*`Context`*›[]*

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

▸ **where**(`key`: string, `matcher`: string | `RegExp`): *this*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*