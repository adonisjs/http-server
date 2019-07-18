> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / [@poppinss/http-server](_poppinss_http_server.md) /

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

* [exceptionCodes](_poppinss_http_server.md#const-exceptioncodes)
* [iocMethods](_poppinss_http_server.md#const-iocmethods)

## Type aliases

###  DomainNode

Ƭ **DomainNode**: *object*

Each domain node will have an object of methods and then
a nested object of routes

#### Type declaration:

● \[▪ **method**: *string*\]: [MethodNode](_poppinss_http_server.md#methodnode)‹*`Context`*›

___

###  ErrorHandlerNode

Ƭ **ErrorHandlerNode**: *function*

Error handler node

#### Type declaration:

▸ (`error`: any, `ctx`: `Context`): *`Promise<any>`*

**Parameters:**

Name | Type |
------ | ------ |
`error` | any |
`ctx` | `Context` |

___

###  HookNode

Ƭ **HookNode**: *function*

Before hooks are executed before finding the route or finding
middleware

#### Type declaration:

▸ (`ctx`: `Context`): *`Promise<void>`*

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | `Context` |

___

###  MatchedRoute

Ƭ **MatchedRoute**: *object*

Shape of the matched route for a pattern, method and domain. We set
them as spread options to the context.

#### Type declaration:

___

###  MethodNode

Ƭ **MethodNode**: *object*

An object of routes for a given HTTP method

#### Type declaration:

___

###  MiddlewareNode

Ƭ **MiddlewareNode**: *string | function*

Input middleware node must be function or a string pointing
to the IoC container

___

###  ResolvedControllerNode

Ƭ **ResolvedControllerNode**: *object | object*

Node after resolving controller.method binding
from the route

___

###  ResolvedMiddlewareNode

Ƭ **ResolvedMiddlewareNode**: *object | object*

Shape of resolved middleware. This information is
enough to execute the middleware

___

###  RouteDefination

Ƭ **RouteDefination**: *[RouteNode](_poppinss_http_server.md#routenode)‹*`Context`*› & object*

Route defination returned as a result of `route.toJSON` method

___

###  RouteHandlerNode

Ƭ **RouteHandlerNode**: *function | string*

The shape of the route handler

___

###  RouteLookupNode

Ƭ **RouteLookupNode**: *object*

Route look node is used to find the routes using
handler, pattern or name.

#### Type declaration:

___

###  RouteMatchers

Ƭ **RouteMatchers**: *object*

Shape of route param matchers

#### Type declaration:

● \[▪ **param**: *string*\]: `RegExp`

___

###  RouteNode

Ƭ **RouteNode**: *object*

Route node persisted within the store

#### Type declaration:

___

###  RoutesTree

Ƭ **RoutesTree**: *object*

Routes tree is a domain of DomainNodes

#### Type declaration:

___

###  ServerConfigContract

Ƭ **ServerConfigContract**: *`RequestConfigContract` & `ResponseConfigContract`*

Config requried by request and response

## Functions

###  dropSlash

▸ **dropSlash**(`input`: string): *string*

Makes input string consistent by having only the starting
slash

**Parameters:**

Name | Type |
------ | ------ |
`input` | string |

**Returns:** *string*

___

###  finalMiddlewareHandler

▸ **finalMiddlewareHandler**<**Context**>(`middleware`: [ResolvedMiddlewareNode](_poppinss_http_server.md#resolvedmiddlewarenode)‹*`Context`*›, `params`: [`Context`, function]): *`Promise<void>`*

Final middleware handler executes a middleware

**Type parameters:**

▪ **Context**

**Parameters:**

Name | Type |
------ | ------ |
`middleware` | [ResolvedMiddlewareNode](_poppinss_http_server.md#resolvedmiddlewarenode)‹*`Context`*› |
`params` | [`Context`, function] |

**Returns:** *`Promise<void>`*

___

###  finalRouteHandler

▸ **finalRouteHandler**<**Context**>(`ctx`: `Context`): *`Promise<void>`*

Final handler executes the route handler based on it's resolved
type and the response body on various conditions (check method body)
for same.

**Type parameters:**

▪ **Context**: *[HttpContextContract](../interfaces/_poppinss_http_server.httpcontextcontract.md)*

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | `Context` |

**Returns:** *`Promise<void>`*

___

###  getServerConfig

▸ **getServerConfig**(`serverConfig`: `Partial<ServerConfigContract>`): *[ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)*

Returns server config by merging the user options with the default
options.

**Parameters:**

Name | Type |
------ | ------ |
`serverConfig` | `Partial<ServerConfigContract>` |

**Returns:** *[ServerConfigContract](_poppinss_http_server.md#serverconfigcontract)*

___

###  makeUrl

▸ **makeUrl**(`pattern`: string, `options`: object): *string*

Makes url for a route pattern and params and querystring.

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`options` | object |

**Returns:** *string*

___

###  routePreProcessor

▸ **routePreProcessor**<**Context**>(`route`: [RouteNode](_poppinss_http_server.md#routenode)‹*`Context`*›, `middlewareStore`: [MiddlewareStoreContract](../interfaces/_poppinss_http_server.middlewarestorecontract.md)‹*`Context`*›): *void*

Hooks into route registration lifecycle and attaches finalHandler to
execute the route middleware and final handler.

We pre-compile routes and final handler to a single function, which improves
the performance by reducing the overhead of processing middleware on each
request

**Type parameters:**

▪ **Context**

**Parameters:**

Name | Type |
------ | ------ |
`route` | [RouteNode](_poppinss_http_server.md#routenode)‹*`Context`*› |
`middlewareStore` | [MiddlewareStoreContract](../interfaces/_poppinss_http_server.middlewarestorecontract.md)‹*`Context`*› |

**Returns:** *void*

___

###  toRoutesJSON

▸ **toRoutesJSON**<**Context**>(`routes`: [RouteGroup](../classes/_poppinss_http_server.routegroup.md)‹*`Context`*› | [RouteResource](../classes/_poppinss_http_server.routeresource.md)‹*`Context`*› | [Route](../classes/_poppinss_http_server.route.md)‹*`Context`*› | [BriskRoute](../classes/_poppinss_http_server.briskroute.md)‹*`Context`*›[]): *[RouteDefination](_poppinss_http_server.md#routedefination)‹*`Context`*›[]*

Converts and array of routes or route groups or route resource to a flat
list of route defination.

**Type parameters:**

▪ **Context**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [RouteGroup](../classes/_poppinss_http_server.routegroup.md)‹*`Context`*› \| [RouteResource](../classes/_poppinss_http_server.routeresource.md)‹*`Context`*› \| [Route](../classes/_poppinss_http_server.route.md)‹*`Context`*› \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md)‹*`Context`*›[] |

**Returns:** *[RouteDefination](_poppinss_http_server.md#routedefination)‹*`Context`*›[]*

___

###  useReturnValue

▸ **useReturnValue**(`returnValue`: any, `ctx`: any): *boolean*

Returns a boolean telling if return value of route handler
or error handler should be used or not

**Parameters:**

Name | Type |
------ | ------ |
`returnValue` | any |
`ctx` | any |

**Returns:** *boolean*

## Object literals

### `Const` exceptionCodes

### ▪ **exceptionCodes**: *object*

Module wide exception codes

###  E_DUPLICATE_ROUTE

• **E_DUPLICATE_ROUTE**: *string* = "E_DUPLICATE_ROUTE"

###  E_DUPLICATE_ROUTE_NAME

• **E_DUPLICATE_ROUTE_NAME**: *string* = "E_DUPLICATE_ROUTE_NAME"

###  E_MISSING_NAMED_MIDDLEWARE

• **E_MISSING_NAMED_MIDDLEWARE**: *string* = "E_MISSING_NAMED_MIDDLEWARE"

###  E_MISSING_ROUTE_NAME

• **E_MISSING_ROUTE_NAME**: *string* = "E_MISSING_ROUTE_NAME"

###  E_MISSING_ROUTE_PARAM_VALUE

• **E_MISSING_ROUTE_PARAM_VALUE**: *string* = "E_MISSING_ROUTE_PARAM_VALUE"

###  E_MULTIPLE_BRISK_HANDLERS

• **E_MULTIPLE_BRISK_HANDLERS**: *string* = "E_MULTIPLE_BRISK_HANDLERS"

###  E_NESTED_ROUTE_GROUPS

• **E_NESTED_ROUTE_GROUPS**: *string* = "E_NESTED_ROUTE_GROUPS"

###  E_ROUTE_NOT_FOUND

• **E_ROUTE_NOT_FOUND**: *string* = "E_ROUTE_NOT_FOUND"

___

### `Const` iocMethods

### ▪ **iocMethods**: *object*

Symbols to use IoC container global methods.

###  call

• **call**: *symbol* =  Symbol.for('ioc.call')

###  make

• **make**: *symbol* =  Symbol.for('ioc.make')

###  use

• **use**: *symbol* =  Symbol.for('ioc.use')