[@adonisjs/http-server](../README.md) › ["src/helpers"](_src_helpers_.md)

# External module: "src/helpers"

## Index

### Functions

* [dropSlash](_src_helpers_.md#dropslash)
* [pick](_src_helpers_.md#pick)
* [processPattern](_src_helpers_.md#processpattern)
* [toRoutesJSON](_src_helpers_.md#toroutesjson)
* [trustProxy](_src_helpers_.md#trustproxy)
* [useReturnValue](_src_helpers_.md#usereturnvalue)

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

###  pick

▸ **pick**<**T**, **U**>(`collection`: object, `keys`: T[]): *U*

Pick a subset of values for a plain object

**Type parameters:**

▪ **T**: *string*

▪ **U**

**Parameters:**

Name | Type |
------ | ------ |
`collection` | object |
`keys` | T[] |

**Returns:** *U*

___

###  processPattern

▸ **processPattern**(`pattern`: string, `data`: any): *string*

Makes url for a route pattern and params and querystring.

**Parameters:**

Name | Type |
------ | ------ |
`pattern` | string |
`data` | any |

**Returns:** *string*

___

###  toRoutesJSON

▸ **toRoutesJSON**(`routes`: [Route](../classes/_src_router_route_.route.md)‹› | [BriskRoute](../classes/_src_router_briskroute_.briskroute.md)‹› | [RouteResource](../classes/_src_router_resource_.routeresource.md)‹› | [RouteGroup](../classes/_src_router_group_.routegroup.md)‹›[]): *RouteDefinition[]*

Converts and array of routes or route groups or route resource to a flat
list of route defination.

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [Route](../classes/_src_router_route_.route.md)‹› &#124; [BriskRoute](../classes/_src_router_briskroute_.briskroute.md)‹› &#124; [RouteResource](../classes/_src_router_resource_.routeresource.md)‹› &#124; [RouteGroup](../classes/_src_router_group_.routegroup.md)‹›[] |

**Returns:** *RouteDefinition[]*

___

###  trustProxy

▸ **trustProxy**(`remoteAddress`: string, `proxyFn`: function): *boolean*

Since finding the trusted proxy based upon the remote address
is an expensive function, we cache its result

**Parameters:**

▪ **remoteAddress**: *string*

▪ **proxyFn**: *function*

▸ (`addr`: string, `distance`: number): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`addr` | string |
`distance` | number |

**Returns:** *boolean*

___

###  useReturnValue

▸ **useReturnValue**(`returnValue`: any, `ctx`: HttpContextContract): *boolean*

Returns a boolean telling if the return value must be used as
the response body or not

**Parameters:**

Name | Type |
------ | ------ |
`returnValue` | any |
`ctx` | HttpContextContract |

**Returns:** *boolean*
