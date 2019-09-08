**[@adonisjs/http-server](../README.md)**

[Globals](../README.md) › ["src/Router/Route"](../modules/_src_router_route_.md) › [Route](_src_router_route_.route.md)

# Class: Route

Route class is used to construct consistent [[RouteDefinition]] using
fluent API. An instance of route is usually obtained using the
[Router](_src_router_index_.router.md) class helper methods.

**`example`** 
```ts
const route = new Route('posts/:id', ['GET'], async function () {
})

route
  .where('id', /^[0-9]+$/)
  .middleware(async function () {
  })
```

## Hierarchy

* Macroable

  * **Route**

## Implements

* RouteContract

## Index

### Constructors

* [constructor](_src_router_route_.route.md#constructor)

### Properties

* [deleted](_src_router_route_.route.md#deleted)
* [name](_src_router_route_.route.md#name)
* [_getters](_src_router_route_.route.md#static-protected-_getters)
* [_macros](_src_router_route_.route.md#static-protected-_macros)

### Methods

* [as](_src_router_route_.route.md#as)
* [domain](_src_router_route_.route.md#domain)
* [middleware](_src_router_route_.route.md#middleware)
* [namespace](_src_router_route_.route.md#namespace)
* [prefix](_src_router_route_.route.md#prefix)
* [toJSON](_src_router_route_.route.md#tojson)
* [where](_src_router_route_.route.md#where)
* [getGetter](_src_router_route_.route.md#static-getgetter)
* [getMacro](_src_router_route_.route.md#static-getmacro)
* [getter](_src_router_route_.route.md#static-getter)
* [hasGetter](_src_router_route_.route.md#static-hasgetter)
* [hasMacro](_src_router_route_.route.md#static-hasmacro)
* [hydrate](_src_router_route_.route.md#static-hydrate)
* [macro](_src_router_route_.route.md#static-macro)

## Constructors

###  constructor

\+ **new Route**(`_pattern`: string, `_methods`: string[], `_handler`: RouteHandlerNode, `_globalMatchers`: RouteMatchers): *[Route](_src_router_route_.route.md)*

**Parameters:**

Name | Type |
------ | ------ |
`_pattern` | string |
`_methods` | string[] |
`_handler` | RouteHandlerNode |
`_globalMatchers` | RouteMatchers |

**Returns:** *[Route](_src_router_route_.route.md)*

## Properties

###  deleted

• **deleted**: *boolean* = false

A boolean to prevent route from getting registered within
the [Store](_src_router_store_.store.md).

This flag must be set before [Router.commit](_src_router_index_.router.md#commit) method

___

###  name

• **name**: *string*

A unique name to lookup the route

___

### `Static` `Protected` _getters

▪ **_getters**: *object*

*Overrides void*

#### Type declaration:

___

### `Static` `Protected` _macros

▪ **_macros**: *object*

*Overrides void*

#### Type declaration:

## Methods

###  as

▸ **as**(`name`: string, `append`: boolean): *this*

Give memorizable name to the route. This is helpful, when you
want to lookup route defination by it's name.

If `append` is true, then it will keep on appending to the existing
name. This option is exposed for [RouteGroup](_src_router_group_.routegroup.md)

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`name` | string | - |
`append` | boolean | false |

**Returns:** *this*

___

###  domain

▸ **domain**(`domain`: string, `overwrite`: boolean): *this*

Define a custom domain for the route. Again we do not overwrite the domain
unless `overwrite` flag is set to true.

This is again done to make route.domain win over route.group.domain

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`domain` | string | - |
`overwrite` | boolean | false |

**Returns:** *this*

___

###  middleware

▸ **middleware**(`middleware`: MiddlewareNode | MiddlewareNode[], `prepend`: boolean): *this*

Define an array of middleware to be executed on the route. If `prepend`
is true, then middleware will be added to start of the existing
middleware. The option is exposed for [RouteGroup](_src_router_group_.routegroup.md)

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`middleware` | MiddlewareNode \| MiddlewareNode[] | - |
`prepend` | boolean | false |

**Returns:** *this*

___

###  namespace

▸ **namespace**(`namespace`: string, `overwrite`: boolean): *this*

Define controller namespace for a given route

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`namespace` | string | - |
`overwrite` | boolean | false |

**Returns:** *this*

___

###  prefix

▸ **prefix**(`prefix`: string): *this*

Define prefix for the route. Prefixes will be concated
This method is mainly exposed for the [RouteGroup](_src_router_group_.routegroup.md)

**Parameters:**

Name | Type |
------ | ------ |
`prefix` | string |

**Returns:** *this*

___

###  toJSON

▸ **toJSON**(): *RouteDefinition*

Returns [[RouteDefinition]] that can be passed to the [Store](_src_router_store_.store.md) for
registering the route

**Returns:** *RouteDefinition*

___

###  where

▸ **where**(`param`: string, `matcher`: string | RegExp): *this*

Define Regex matcher for a given param. If a matcher exists, then we do not
override that, since the routes inside a group will set matchers before
the group, so they should have priority over the route matchers.

```
Route.group(() => {
  Route.get('/:id', 'handler').where('id', /^[0-9]$/)
}).where('id', /[^a-z$]/)
```

The `/^[0-9]$/` should win over the matcher defined by the group

**Parameters:**

Name | Type |
------ | ------ |
`param` | string |
`matcher` | string \| RegExp |

**Returns:** *this*

___

### `Static` getGetter

▸ **getGetter**(`name`: string): *MacroableFn | undefined*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn | undefined*

___

### `Static` getMacro

▸ **getMacro**(`name`: string): *MacroableFn | undefined*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn | undefined*

___

### `Static` getter

▸ **getter**(`name`: string, `callback`: MacroableFn, `singleton?`: undefined | false | true): *void*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn |
`singleton?` | undefined \| false \| true |

**Returns:** *void*

___

### `Static` hasGetter

▸ **hasGetter**(`name`: string): *boolean*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hasMacro

▸ **hasMacro**(`name`: string): *boolean*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hydrate

▸ **hydrate**(): *void*

*Inherited from void*

**Returns:** *void*

___

### `Static` macro

▸ **macro**(`name`: string, `callback`: MacroableFn): *void*

*Inherited from void*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn |

**Returns:** *void*