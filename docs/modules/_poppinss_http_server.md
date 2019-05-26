[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md)

# External module: @poppinss/http-server

## Index

### Classes

* [BriskRoute](../classes/_poppinss_http_server.briskroute.md)
* [HttpContext](../classes/_poppinss_http_server.httpcontext.md)
* [MiddlewareStore](../classes/_poppinss_http_server.middlewarestore.md)
* [Route](../classes/_poppinss_http_server.route.md)
* [RouteGroup](../classes/_poppinss_http_server.routegroup.md)
* [RouteResource](../classes/_poppinss_http_server.routeresource.md)
* [Router](../classes/_poppinss_http_server.router.md)
* [Server](../classes/_poppinss_http_server.server.md)
* [Store](../classes/_poppinss_http_server.store.md)

### Functions

* [dropSlash](_poppinss_http_server.md#dropslash)
* [finalMiddlewareHandler](_poppinss_http_server.md#finalmiddlewarehandler)
* [finalRouteHandler](_poppinss_http_server.md#finalroutehandler)
* [getServerConfig](_poppinss_http_server.md#getserverconfig)
* [makeUrl](_poppinss_http_server.md#makeurl)
* [routePreProcessor](_poppinss_http_server.md#routepreprocessor)
* [toRoutesJSON](_poppinss_http_server.md#toroutesjson)
* [useReturnValue](_poppinss_http_server.md#usereturnvalue)

### Object literals

* [exceptionCodes](_poppinss_http_server.md#exceptioncodes)

---

## Functions

<a id="dropslash"></a>

###  dropSlash

▸ **dropSlash**(input: *`string`*): `string`

Makes input string consistent by having only the starting slash

**Parameters:**

| Name | Type |
| ------ | ------ |
| input | `string` |

**Returns:** `string`

___
<a id="finalmiddlewarehandler"></a>

###  finalMiddlewareHandler

▸ **finalMiddlewareHandler**<`Context`>(middleware: *`ResolvedMiddlewareNode`<`Context`>*, params: *[`Context`, `function`]*): `Promise`<`void`>

Final middleware handler executes a middleware

**Type parameters:**

#### Context 
**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | `ResolvedMiddlewareNode`<`Context`> |
| params | [`Context`, `function`] |

**Returns:** `Promise`<`void`>

___
<a id="finalroutehandler"></a>

###  finalRouteHandler

▸ **finalRouteHandler**<`Context`>(ctx: *`Context`*): `Promise`<`void`>

Final handler executes the route handler based on it's resolved type and the response body on various conditions (check method body) for same.

**Type parameters:**

#### Context :  `HttpContextContract`
**Parameters:**

| Name | Type |
| ------ | ------ |
| ctx | `Context` |

**Returns:** `Promise`<`void`>

___
<a id="getserverconfig"></a>

###  getServerConfig

▸ **getServerConfig**(serverConfig: *`Partial`<`ServerConfigContract`>*): `ServerConfigContract`

Returns server config by merging the user options with the default options.

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverConfig | `Partial`<`ServerConfigContract`> |

**Returns:** `ServerConfigContract`

___
<a id="makeurl"></a>

###  makeUrl

▸ **makeUrl**(pattern: *`string`*, options: *`object`*): `string`

Makes url for a route pattern and params and querystring.

**Parameters:**

| Name | Type |
| ------ | ------ |
| pattern | `string` |
| options | `object` |

**Returns:** `string`

___
<a id="routepreprocessor"></a>

###  routePreProcessor

▸ **routePreProcessor**<`Context`>(route: *`RouteNode`<`Context`>*, middlewareStore: *`MiddlewareStoreContract`<`Context`>*): `void`

Hooks into route registration lifecycle and attaches finalHandler to execute the route middleware and final handler.

We pre-compile routes and final handler to a single function, which improves the performance by reducing the overhead of processing middleware on each request

**Type parameters:**

#### Context 
**Parameters:**

| Name | Type |
| ------ | ------ |
| route | `RouteNode`<`Context`> |
| middlewareStore | `MiddlewareStoreContract`<`Context`> |

**Returns:** `void`

___
<a id="toroutesjson"></a>

###  toRoutesJSON

▸ **toRoutesJSON**<`Context`>(routes: *([RouteGroup](../classes/_poppinss_http_server.routegroup.md)<`Context`> \| [RouteResource](../classes/_poppinss_http_server.routeresource.md)<`Context`> \| [Route](../classes/_poppinss_http_server.route.md)<`Context`> \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md)<`Context`>)[]*): `RouteDefination`<`Context`>[]

Converts and array of routes or route groups or route resource to a flat list of route defination.

**Type parameters:**

#### Context :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| routes | ([RouteGroup](../classes/_poppinss_http_server.routegroup.md)<`Context`> \| [RouteResource](../classes/_poppinss_http_server.routeresource.md)<`Context`> \| [Route](../classes/_poppinss_http_server.route.md)<`Context`> \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md)<`Context`>)[] |

**Returns:** `RouteDefination`<`Context`>[]

___
<a id="usereturnvalue"></a>

###  useReturnValue

▸ **useReturnValue**(returnValue: *`any`*, ctx: *`any`*): `boolean`

Returns a boolean telling if return value of route handler or error handler should be used or not

**Parameters:**

| Name | Type |
| ------ | ------ |
| returnValue | `any` |
| ctx | `any` |

**Returns:** `boolean`

___

## Object literals

<a id="exceptioncodes"></a>

### `<Const>` exceptionCodes

**exceptionCodes**: *`object`*

Module wide exception codes

<a id="exceptioncodes.e_duplicate_route"></a>

####  E_DUPLICATE_ROUTE

**● E_DUPLICATE_ROUTE**: *`string`* = "E_DUPLICATE_ROUTE"

___
<a id="exceptioncodes.e_duplicate_route_name"></a>

####  E_DUPLICATE_ROUTE_NAME

**● E_DUPLICATE_ROUTE_NAME**: *`string`* = "E_DUPLICATE_ROUTE_NAME"

___
<a id="exceptioncodes.e_invalid_middleware_type"></a>

####  E_INVALID_MIDDLEWARE_TYPE

**● E_INVALID_MIDDLEWARE_TYPE**: *`string`* = "E_INVALID_MIDDLEWARE_TYPE"

___
<a id="exceptioncodes.e_invalid_route_namespace"></a>

####  E_INVALID_ROUTE_NAMESPACE

**● E_INVALID_ROUTE_NAMESPACE**: *`string`* = "E_INVALID_ROUTE_NAMESPACE"

___
<a id="exceptioncodes.e_missing_controller_method"></a>

####  E_MISSING_CONTROLLER_METHOD

**● E_MISSING_CONTROLLER_METHOD**: *`string`* = "E_MISSING_CONTROLLER_METHOD"

___
<a id="exceptioncodes.e_missing_named_middleware"></a>

####  E_MISSING_NAMED_MIDDLEWARE

**● E_MISSING_NAMED_MIDDLEWARE**: *`string`* = "E_MISSING_NAMED_MIDDLEWARE"

___
<a id="exceptioncodes.e_missing_route_name"></a>

####  E_MISSING_ROUTE_NAME

**● E_MISSING_ROUTE_NAME**: *`string`* = "E_MISSING_ROUTE_NAME"

___
<a id="exceptioncodes.e_missing_route_param_value"></a>

####  E_MISSING_ROUTE_PARAM_VALUE

**● E_MISSING_ROUTE_PARAM_VALUE**: *`string`* = "E_MISSING_ROUTE_PARAM_VALUE"

___
<a id="exceptioncodes.e_multiple_brisk_handlers"></a>

####  E_MULTIPLE_BRISK_HANDLERS

**● E_MULTIPLE_BRISK_HANDLERS**: *`string`* = "E_MULTIPLE_BRISK_HANDLERS"

___
<a id="exceptioncodes.e_nested_route_groups"></a>

####  E_NESTED_ROUTE_GROUPS

**● E_NESTED_ROUTE_GROUPS**: *`string`* = "E_NESTED_ROUTE_GROUPS"

___
<a id="exceptioncodes.e_route_not_found"></a>

####  E_ROUTE_NOT_FOUND

**● E_ROUTE_NOT_FOUND**: *`string`* = "E_ROUTE_NOT_FOUND"

___

___

