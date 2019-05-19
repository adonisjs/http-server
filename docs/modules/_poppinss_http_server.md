[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md)

# External module: @poppinss/http-server

## Index

### Classes

* [BriskRoute](../classes/_poppinss_http_server.briskroute.md)
* [Route](../classes/_poppinss_http_server.route.md)
* [RouteGroup](../classes/_poppinss_http_server.routegroup.md)
* [RouteResource](../classes/_poppinss_http_server.routeresource.md)
* [Router](../classes/_poppinss_http_server.router.md)
* [Store](../classes/_poppinss_http_server.store.md)

### Functions

* [dropSlash](_poppinss_http_server.md#dropslash)
* [toRoutesJSON](_poppinss_http_server.md#toroutesjson)

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
<a id="toroutesjson"></a>

###  toRoutesJSON

▸ **toRoutesJSON**(routes: *([Route](../classes/_poppinss_http_server.route.md) \| [RouteResource](../classes/_poppinss_http_server.routeresource.md) \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md) \| [RouteGroup](../classes/_poppinss_http_server.routegroup.md))[]*): `RouteDefination`[]

Converts and array of routes or route groups or route resource to a flat list of \[\[RouteDefination\]\]

**Parameters:**

| Name | Type |
| ------ | ------ |
| routes | ([Route](../classes/_poppinss_http_server.route.md) \| [RouteResource](../classes/_poppinss_http_server.routeresource.md) \| [BriskRoute](../classes/_poppinss_http_server.briskroute.md) \| [RouteGroup](../classes/_poppinss_http_server.routegroup.md))[] |

**Returns:** `RouteDefination`[]

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

___

