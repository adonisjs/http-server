[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [MiddlewareStoreContract](../interfaces/_poppinss_http_server.middlewarestorecontract.md)

# Interface: MiddlewareStoreContract

Shape of middleware store to store and fetch middleware at runtime

## Type parameters
#### Context 
## Hierarchy

**MiddlewareStoreContract**

## Implemented by

* [MiddlewareStore](../classes/_poppinss_http_server.middlewarestore.md)

## Index

### Methods

* [get](_poppinss_http_server.middlewarestorecontract.md#get)
* [getNamed](_poppinss_http_server.middlewarestorecontract.md#getnamed)
* [preCompileMiddleware](_poppinss_http_server.middlewarestorecontract.md#precompilemiddleware)
* [register](_poppinss_http_server.middlewarestorecontract.md#register)
* [registerNamed](_poppinss_http_server.middlewarestorecontract.md#registernamed)

---

## Methods

<a id="get"></a>

###  get

▸ **get**(): [ResolvedMiddlewareNode](../modules/_poppinss_http_server.md#resolvedmiddlewarenode)<`Context`>[]

**Returns:** [ResolvedMiddlewareNode](../modules/_poppinss_http_server.md#resolvedmiddlewarenode)<`Context`>[]

___
<a id="getnamed"></a>

###  getNamed

▸ **getNamed**(name: *`string`*): `null` \| [ResolvedMiddlewareNode](../modules/_poppinss_http_server.md#resolvedmiddlewarenode)<`Context`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| name | `string` |

**Returns:** `null` \| [ResolvedMiddlewareNode](../modules/_poppinss_http_server.md#resolvedmiddlewarenode)<`Context`>

___
<a id="precompilemiddleware"></a>

###  preCompileMiddleware

▸ **preCompileMiddleware**(route: *[RouteNode](../modules/_poppinss_http_server.md#routenode)<`Context`>*): `void`

**Parameters:**

| Name | Type |
| ------ | ------ |
| route | [RouteNode](../modules/_poppinss_http_server.md#routenode)<`Context`> |

**Returns:** `void`

___
<a id="register"></a>

###  register

▸ **register**(middleware: *[MiddlewareNode](../modules/_poppinss_http_server.md#middlewarenode)<`Context`>[]*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | [MiddlewareNode](../modules/_poppinss_http_server.md#middlewarenode)<`Context`>[] |

**Returns:** `this`

___
<a id="registernamed"></a>

###  registerNamed

▸ **registerNamed**(middleware: *`object`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | `object` |

**Returns:** `this`

___

