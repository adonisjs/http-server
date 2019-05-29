[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)

# Interface: RouteResourceContract

Shape of route resource class

## Type parameters
#### Context 
## Hierarchy

**RouteResourceContract**

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

---

## Properties

<a id="routes"></a>

###  routes

**● routes**: *[RouteContract](_poppinss_http_server.routecontract.md)<`Context`>[]*

___

## Methods

<a id="apionly"></a>

###  apiOnly

▸ **apiOnly**(): `this`

**Returns:** `this`

___
<a id="except"></a>

###  except

▸ **except**(names: *`string`[]*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| names | `string`[] |

**Returns:** `this`

___
<a id="middleware"></a>

###  middleware

▸ **middleware**(middleware: *`object`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | `object` |

**Returns:** `this`

___
<a id="namespace"></a>

###  namespace

▸ **namespace**(namespace: *`string`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| namespace | `string` |

**Returns:** `this`

___
<a id="only"></a>

###  only

▸ **only**(names: *`string`[]*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| names | `string`[] |

**Returns:** `this`

___
<a id="where"></a>

###  where

▸ **where**(key: *`string`*, matcher: *`string` \| `RegExp`*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| key | `string` |
| matcher | `string` \| `RegExp` |

**Returns:** `this`

___

