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

### Interfaces

* [BriskRouteContract](../interfaces/_poppinss_http_server.briskroutecontract.md)
* [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md)
* [MiddlewareStoreContract](../interfaces/_poppinss_http_server.middlewarestorecontract.md)
* [RouteContract](../interfaces/_poppinss_http_server.routecontract.md)
* [RouteGroupContract](../interfaces/_poppinss_http_server.routegroupcontract.md)
* [RouteResourceContract](../interfaces/_poppinss_http_server.routeresourcecontract.md)
* [RouterContract](../interfaces/_poppinss_http_server.routercontract.md)
* [ServerContract](../interfaces/_poppinss_http_server.servercontract.md)

### Type aliases

* [DomainNode](_poppinss_http_server.md#domainnode)
* [ErrorHandlerNode](_poppinss_http_server.md#errorhandlernode)
* [HookNode](_poppinss_http_server.md#hooknode)
* [MatchedRoute](_poppinss_http_server.md#matchedroute)
* [MethodNode](_poppinss_http_server.md#methodnode)
* [MiddlewareNode](_poppinss_http_server.md#middlewarenode)
* [ResolvedControllerNode](_poppinss_http_server.md#resolvedcontrollernode)
* [ResolvedMiddlewareNode](_poppinss_http_server.md#resolvedmiddlewarenode)
* [RouteDefination](_poppinss_http_server.md#routedefination)
* [RouteHandlerNode](_poppinss_http_server.md#routehandlernode)
* [RouteLookupNode](_poppinss_http_server.md#routelookupnode)
* [RouteMatchers](_poppinss_http_server.md#routematchers)
* [RouteNode](_poppinss_http_server.md#routenode)
* [RoutesTree](_poppinss_http_server.md#routestree)
* [ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)

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
* [iocMethods](_poppinss_http_server.md#iocmethods)

---

## Type aliases

<a id="domainnode"></a>

###  DomainNode

**Ƭ DomainNode**: *`object`*

Each domain node will have an object of methods and then a nested object of routes

#### Type declaration

[method: `string`]: [MethodNode](_poppinss_http_server.md#methodnode)<`Context`>

___
<a id="errorhandlernode"></a>

###  ErrorHandlerNode

**Ƭ ErrorHandlerNode**: *`function`*

Error handler node

#### Type declaration
▸(error: *`any`*, ctx: *`Context`*): `Promise`<`any`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| error | `any` |
| ctx | `Context` |

**Returns:** `Promise`<`any`>

___
<a id="hooknode"></a>

###  HookNode

**Ƭ HookNode**: *`function`*

Before hooks are executed before finding the route or finding middleware

#### Type declaration
▸(ctx: *`Context`*): `Promise`<`void`>

**Parameters:**

| Name | Type |
| ------ | ------ |
| ctx | `Context` |

**Returns:** `Promise`<`void`>

___
<a id="matchedroute"></a>

###  MatchedRoute

**Ƭ MatchedRoute**: *`object`*

Shape of the matched route for a pattern, method and domain. We set them as spread options to the context.

#### Type declaration

___
<a id="methodnode"></a>

###  MethodNode

**Ƭ MethodNode**: *`object`*

An object of routes for a given HTTP method

#### Type declaration

___
<a id="middlewarenode"></a>

###  MiddlewareNode

**Ƭ MiddlewareNode**: *`string` \| `function`*

Input middleware node must be function or a string pointing to the IoC container

___
<a id="resolvedcontrollernode"></a>

###  ResolvedControllerNode

**Ƭ ResolvedControllerNode**: *`object` \| `object`*

Node after resolving controller.method binding from the route

___
<a id="resolvedmiddlewarenode"></a>

###  ResolvedMiddlewareNode

**Ƭ ResolvedMiddlewareNode**: *`object` \| `object`*

Shape of resolved middleware. This information is enough to execute the middleware

___
<a id="routedefination"></a>

###  RouteDefination

**Ƭ RouteDefination**: *[RouteNode](_poppinss_http_server.md#routenode)<`Context`> & `object`*

Route defination returned as a result of `route.toJSON` method

___
<a id="routehandlernode"></a>

###  RouteHandlerNode

**Ƭ RouteHandlerNode**: *`function` \| `string`*

The shape of the route handler

___
<a id="routelookupnode"></a>

###  RouteLookupNode

**Ƭ RouteLookupNode**: *`object`*

Route look node is used to find the routes using handler, pattern or name.

#### Type declaration

___
<a id="routematchers"></a>

###  RouteMatchers

**Ƭ RouteMatchers**: *`object`*

Shape of route param matchers

#### Type declaration

[param: `string`]: `RegExp`

___
<a id="routenode"></a>

###  RouteNode

**Ƭ RouteNode**: *`object`*

Route node persisted within the store

#### Type declaration

___
<a id="routestree"></a>

###  RoutesTree

**Ƭ RoutesTree**: *`object`*

Routes tree is a domain of DomainNodes

#### Type declaration

___
<a id="serverconfigcontract"></a>

###  ServerConfigContract

**Ƭ ServerConfigContract**: *`RequestConfigContract` & `ResponseConfigContract`*

Config requried by request and response

___

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

▸ **finalMiddlewareHandler**<`Context`>(middleware: *[ResolvedMiddlewareNode](_poppinss_http_server.md#resolvedmiddlewarenode)<`Context`>*, params: *[`Context`, `function`]*): `Promise`<`void`>

Final middleware handler executes a middleware

**Type parameters:**

#### Context 
**Parameters:**

| Name | Type |
| ------ | ------ |
| middleware | [ResolvedMiddlewareNode](_poppinss_http_server.md#resolvedmiddlewarenode)<`Context`> |
| params | [`Context`, `function`] |

**Returns:** `Promise`<`void`>

___
<a id="finalroutehandler"></a>

###  finalRouteHandler

▸ **finalRouteHandler**<`Context`>(ctx: *`Context`*): `Promise`<`void`>

Final handler executes the route handler based on it's resolved type and the response body on various conditions (check method body) for same.

**Type parameters:**

#### Context :  [HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md)
**Parameters:**

| Name | Type |
| ------ | ------ |
| ctx | `Context` |

**Returns:** `Promise`<`void`>

___
<a id="getserverconfig"></a>

###  getServerConfig

▸ **getServerConfig**(serverConfig: *`Partial`<[ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)>*): [ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)

Returns server config by merging the user options with the default options.

**Parameters:**

| Name | Type |
| ------ | ------ |
| serverConfig | `Partial`<[ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)> |

**Returns:** [ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)

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

▸ **routePreProcessor**<`Context`>(route: *[RouteNode](_poppinss_http_server.md#routenode)<`Context`>*, middlewareStore: *[MiddlewareStoreContract](../interfaces/_poppinss_http_server.middlewarestorecontract.md)<`Context`>*): `void`

Hooks into route registration lifecycle and attaches finalHandler to execute the route middleware and final handler.

We pre-compile routes and final handler to a single function, which improves the performance by reducing the overhead of processing middleware on each request

**Type parameters:**

#### Context 
**Parameters:**

| Name | Type |
| ------ | ------ |
| route | [RouteNode](_poppinss_http_server.md#routenode)<`Context`> |
| middlewareStore | [MiddlewareStoreContract](../interfaces/_poppinss_http_server.middlewarestorecontract.md)<`Context`> |

**Returns:** `void`

___
<a id="toroutesjson"></a>

###  toRoutesJSON

▸ **toRoutesJSON**<`Context`>(routes: *([RouteGroup](../classes/_poppinss_http_server.routegroup.md)<`Context`> \| [RouteResource](../classes/_poppinss_http_server.routeresource.md)<`Context`> \| [Route](../classes/_poppinss_http_server.route.md)<`Context`> \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md)<`Context`>)[]*): [RouteDefination](_poppinss_http_server.md#routedefination)<`Context`>[]

Converts and array of routes or route groups or route resource to a flat list of route defination.

**Type parameters:**

#### Context :  `any`
**Parameters:**

| Name | Type |
| ------ | ------ |
| routes | ([RouteGroup](../classes/_poppinss_http_server.routegroup.md)<`Context`> \| [RouteResource](../classes/_poppinss_http_server.routeresource.md)<`Context`> \| [Route](../classes/_poppinss_http_server.route.md)<`Context`> \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md)<`Context`>)[] |

**Returns:** [RouteDefination](_poppinss_http_server.md#routedefination)<`Context`>[]

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
<a id="iocmethods"></a>

### `<Const>` iocMethods

**iocMethods**: *`object`*

Symbols to use IoC container global methods.

<a id="iocmethods.call"></a>

####  call

**● call**: *`symbol`* =  Symbol.for('ioc.call')

___
<a id="iocmethods.make"></a>

####  make

**● make**: *`symbol`* =  Symbol.for('ioc.make')

___
<a id="iocmethods.use"></a>

####  use

**● use**: *`symbol`* =  Symbol.for('ioc.use')

___

___

