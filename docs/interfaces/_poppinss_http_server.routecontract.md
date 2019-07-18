> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](../modules/_poppinss_http_server.md) / [RouteContract](_poppinss_http_server.routecontract.md) /

# Interface: RouteContract <**Context**>

Shape of route class

## Type parameters

▪ **Context**

## Hierarchy

* **RouteContract**

## Implemented by

* [Route](../classes/_poppinss_http_server.route.md)

## Index

### Properties

* [deleted](_poppinss_http_server.routecontract.md#deleted)
* [name](_poppinss_http_server.routecontract.md#name)

### Methods

* [as](_poppinss_http_server.routecontract.md#as)
* [domain](_poppinss_http_server.routecontract.md#domain)
* [middleware](_poppinss_http_server.routecontract.md#middleware)
* [namespace](_poppinss_http_server.routecontract.md#namespace)
* [prefix](_poppinss_http_server.routecontract.md#prefix)
* [toJSON](_poppinss_http_server.routecontract.md#tojson)
* [where](_poppinss_http_server.routecontract.md#where)

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

▸ **toJSON**(): *[RouteDefination](../modules/_poppinss_http_server.md#routedefination)‹*`Context`*›*

**Returns:** *[RouteDefination](../modules/_poppinss_http_server.md#routedefination)‹*`Context`*›*

___

###  where

▸ **where**(`param`: string, `matcher`: string | `RegExp`): *this*

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| `RegExp` |

**Returns:** *this*