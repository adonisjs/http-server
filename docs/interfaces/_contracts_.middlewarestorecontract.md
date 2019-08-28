**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["contracts"](../modules/_contracts_.md) › [MiddlewareStoreContract](_contracts_.middlewarestorecontract.md)

# Interface: MiddlewareStoreContract <**Context**>

Shape of middleware store to store and fetch middleware
at runtime

## Type parameters

▪ **Context**

## Hierarchy

* **MiddlewareStoreContract**

## Implemented by

* [MiddlewareStore](../classes/_server_middlewarestore_.middlewarestore.md)

## Index

### Methods

* [get](_contracts_.middlewarestorecontract.md#get)
* [getNamed](_contracts_.middlewarestorecontract.md#getnamed)
* [preCompileMiddleware](_contracts_.middlewarestorecontract.md#precompilemiddleware)
* [register](_contracts_.middlewarestorecontract.md#register)
* [registerNamed](_contracts_.middlewarestorecontract.md#registernamed)

## Methods

###  get

▸ **get**(): *[ResolvedMiddlewareNode](../modules/_contracts_.md#resolvedmiddlewarenode)‹Context›[]*

**Returns:** *[ResolvedMiddlewareNode](../modules/_contracts_.md#resolvedmiddlewarenode)‹Context›[]*

___

###  getNamed

▸ **getNamed**(`name`: string): *null | [ResolvedMiddlewareNode](../modules/_contracts_.md#resolvedmiddlewarenode)‹Context›*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *null | [ResolvedMiddlewareNode](../modules/_contracts_.md#resolvedmiddlewarenode)‹Context›*

___

###  preCompileMiddleware

▸ **preCompileMiddleware**(`route`: [RouteNode](../modules/_contracts_.md#routenode)‹Context›): *void*

**Parameters:**

Name | Type |
------ | ------ |
`route` | [RouteNode](../modules/_contracts_.md#routenode)‹Context› |

**Returns:** *void*

___

###  register

▸ **register**(`middleware`: [MiddlewareNode](../modules/_contracts_.md#middlewarenode)‹Context›[]): *this*

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | [MiddlewareNode](../modules/_contracts_.md#middlewarenode)‹Context›[] |

**Returns:** *this*

___

###  registerNamed

▸ **registerNamed**(`middleware`: object): *this*

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | object |

**Returns:** *this*