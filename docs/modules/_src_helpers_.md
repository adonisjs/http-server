**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["src/helpers"](_src_helpers_.md)

# External module: "src/helpers"

## Index

### Functions

* [dropSlash](_src_helpers_.md#dropslash)
* [makeUrl](_src_helpers_.md#makeurl)
* [toRoutesJSON](_src_helpers_.md#toroutesjson)
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

###  toRoutesJSON

▸ **toRoutesJSON**(`routes`: [Route](../classes/_src_router_route_.route.md) | [BriskRoute](../classes/_src_router_briskroute_.briskroute.md) | [RouteResource](../classes/_src_router_resource_.routeresource.md) | [RouteGroup](../classes/_src_router_group_.routegroup.md)[]): *RouteDefinition[]*

Converts and array of routes or route groups or route resource to a flat
list of route defination.

**Parameters:**

Name | Type |
------ | ------ |
`routes` | [Route](../classes/_src_router_route_.route.md) \| [BriskRoute](../classes/_src_router_briskroute_.briskroute.md) \| [RouteResource](../classes/_src_router_resource_.routeresource.md) \| [RouteGroup](../classes/_src_router_group_.routegroup.md)[] |

**Returns:** *RouteDefinition[]*

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