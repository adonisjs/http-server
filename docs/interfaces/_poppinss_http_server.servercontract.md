[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [ServerContract](../interfaces/_poppinss_http_server.servercontract.md)

# Interface: ServerContract

HTTP server

## Type parameters
#### Context :  [HttpContextContract](_poppinss_http_server.httpcontextcontract.md)
## Hierarchy

**ServerContract**

## Implemented by

* [Server](../classes/_poppinss_http_server.server.md)

## Index

### Properties

* [instance](_poppinss_http_server.servercontract.md#instance)

### Methods

* [after](_poppinss_http_server.servercontract.md#after)
* [before](_poppinss_http_server.servercontract.md#before)
* [handle](_poppinss_http_server.servercontract.md#handle)
* [onError](_poppinss_http_server.servercontract.md#onerror)
* [optimize](_poppinss_http_server.servercontract.md#optimize)

---

## Properties

<a id="instance"></a>

### `<Optional>` instance

**● instance**: *`HttpServer` \| `HttpsServer`*

___

## Methods

<a id="after"></a>

###  after

▸ **after**(cb: *[HookNode](../modules/_poppinss_http_server.md#hooknode)<`Context`>*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| cb | [HookNode](../modules/_poppinss_http_server.md#hooknode)<`Context`> |

**Returns:** `this`

___
<a id="before"></a>

###  before

▸ **before**(cb: *[HookNode](../modules/_poppinss_http_server.md#hooknode)<`Context`>*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| cb | [HookNode](../modules/_poppinss_http_server.md#hooknode)<`Context`> |

**Returns:** `this`

___
<a id="handle"></a>

###  handle

▸ **handle**(req: *`IncomingMessage`*, res: *`ServerResponse`*): `Promise`<`void`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| req | `IncomingMessage` |
| res | `ServerResponse` |

**Returns:** `Promise`<`void`>

___
<a id="onerror"></a>

###  onError

▸ **onError**(cb: *[ErrorHandlerNode](../modules/_poppinss_http_server.md#errorhandlernode)<`Context`>*): `this`

**Parameters:**

| Name | Type |
| ------ | ------ |
| cb | [ErrorHandlerNode](../modules/_poppinss_http_server.md#errorhandlernode)<`Context`> |

**Returns:** `this`

___
<a id="optimize"></a>

###  optimize

▸ **optimize**(): `void`

**Returns:** `void`

___

