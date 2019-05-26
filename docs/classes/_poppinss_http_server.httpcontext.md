[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [HttpContext](../classes/_poppinss_http_server.httpcontext.md)

# Class: HttpContext

Http context is passed to all route handlers, middleware, error handler and server hooks.

## Hierarchy

**HttpContext**

## Implements

* `HttpContextContract`

## Index

### Constructors

* [constructor](_poppinss_http_server.httpcontext.md#constructor)

### Properties

* [logger](_poppinss_http_server.httpcontext.md#logger)
* [params](_poppinss_http_server.httpcontext.md#params)
* [request](_poppinss_http_server.httpcontext.md#request)
* [response](_poppinss_http_server.httpcontext.md#response)
* [route](_poppinss_http_server.httpcontext.md#route)
* [subdomains](_poppinss_http_server.httpcontext.md#subdomains)

### Methods

* [create](_poppinss_http_server.httpcontext.md#create)

---

## Constructors

<a id="constructor"></a>

###  constructor

⊕ **new HttpContext**(request: *`RequestContract`*, response: *`ResponseContract`*, logger: *`LoggerContract`*): [HttpContext](_poppinss_http_server.httpcontext.md)

**Parameters:**

| Name | Type |
| ------ | ------ |
| request | `RequestContract` |
| response | `ResponseContract` |
| logger | `LoggerContract` |

**Returns:** [HttpContext](_poppinss_http_server.httpcontext.md)

___

## Properties

<a id="logger"></a>

###  logger

**● logger**: *`LoggerContract`*

___
<a id="params"></a>

### `<Optional>` params

**● params**: *`any`*

___
<a id="request"></a>

###  request

**● request**: *`RequestContract`*

___
<a id="response"></a>

###  response

**● response**: *`ResponseContract`*

___
<a id="route"></a>

### `<Optional>` route

**● route**: *`RouteNode`<`this`>*

___
<a id="subdomains"></a>

### `<Optional>` subdomains

**● subdomains**: *`any`*

___

## Methods

<a id="create"></a>

### `<Static>` create

▸ **create**(routePattern: *`string`*, routeParams: *`any`*, req?: *`IncomingMessage`*, res?: *`ServerResponse`*, serverConfig?: *`ServerConfigContract`*): [HttpContext](_poppinss_http_server.httpcontext.md)

Creates a new fake context instance for a given route.

**Parameters:**

| Name | Type |
| ------ | ------ |
| routePattern | `string` |
| routeParams | `any` |
| `Optional` req | `IncomingMessage` |
| `Optional` res | `ServerResponse` |
| `Optional` serverConfig | `ServerConfigContract` |

**Returns:** [HttpContext](_poppinss_http_server.httpcontext.md)

___

