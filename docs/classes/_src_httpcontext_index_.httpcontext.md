[@adonisjs/http-server](../README.md) › ["src/HttpContext/index"](../modules/_src_httpcontext_index_.md) › [HttpContext](_src_httpcontext_index_.httpcontext.md)

# Class: HttpContext

Http context is passed to all route handlers, middleware,
error handler and server hooks.

## Hierarchy

* Macroable

  ↳ **HttpContext**

## Implements

* HttpContextContract

## Index

### Constructors

* [constructor](_src_httpcontext_index_.httpcontext.md#constructor)

### Properties

* [logger](_src_httpcontext_index_.httpcontext.md#logger)
* [params](_src_httpcontext_index_.httpcontext.md#params)
* [profiler](_src_httpcontext_index_.httpcontext.md#profiler)
* [request](_src_httpcontext_index_.httpcontext.md#request)
* [response](_src_httpcontext_index_.httpcontext.md#response)
* [route](_src_httpcontext_index_.httpcontext.md#optional-route)
* [subdomains](_src_httpcontext_index_.httpcontext.md#subdomains)
* [getters](_src_httpcontext_index_.httpcontext.md#static-protected-getters)
* [macros](_src_httpcontext_index_.httpcontext.md#static-protected-macros)

### Methods

* [create](_src_httpcontext_index_.httpcontext.md#static-create)
* [getGetter](_src_httpcontext_index_.httpcontext.md#static-getgetter)
* [getMacro](_src_httpcontext_index_.httpcontext.md#static-getmacro)
* [getter](_src_httpcontext_index_.httpcontext.md#static-getter)
* [hasGetter](_src_httpcontext_index_.httpcontext.md#static-hasgetter)
* [hasMacro](_src_httpcontext_index_.httpcontext.md#static-hasmacro)
* [hydrate](_src_httpcontext_index_.httpcontext.md#static-hydrate)
* [macro](_src_httpcontext_index_.httpcontext.md#static-macro)

## Constructors

###  constructor

\+ **new HttpContext**(`request`: RequestContract, `response`: ResponseContract, `logger`: LoggerContract, `profiler`: ProfilerRowContract): *[HttpContext](_src_httpcontext_index_.httpcontext.md)*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`request` | RequestContract |
`response` | ResponseContract |
`logger` | LoggerContract |
`profiler` | ProfilerRowContract |

**Returns:** *[HttpContext](_src_httpcontext_index_.httpcontext.md)*

## Properties

###  logger

• **logger**: *LoggerContract*

___

###  params

• **params**: *any*

___

###  profiler

• **profiler**: *ProfilerRowContract*

___

###  request

• **request**: *RequestContract*

___

###  response

• **response**: *ResponseContract*

___

### `Optional` route

• **route**? : *RouteNode*

___

###  subdomains

• **subdomains**: *any*

___

### `Static` `Protected` getters

▪ **getters**: *object*

*Overrides void*

#### Type declaration:

___

### `Static` `Protected` macros

▪ **macros**: *object*

*Overrides void*

Required by macroable

#### Type declaration:

## Methods

### `Static` create

▸ **create**(`routePattern`: string, `routeParams`: any, `logger`: LoggerContract, `profiler`: ProfilerRowContract, `encryption`: EncryptionContract, `req?`: IncomingMessage, `res?`: ServerResponse, `serverConfig?`: ServerConfigContract): *[HttpContext](_src_httpcontext_index_.httpcontext.md)‹›*

Creates a new fake context instance for a given route.

**Parameters:**

Name | Type |
------ | ------ |
`routePattern` | string |
`routeParams` | any |
`logger` | LoggerContract |
`profiler` | ProfilerRowContract |
`encryption` | EncryptionContract |
`req?` | IncomingMessage |
`res?` | ServerResponse |
`serverConfig?` | ServerConfigContract |

**Returns:** *[HttpContext](_src_httpcontext_index_.httpcontext.md)‹›*

___

### `Static` getGetter

▸ **getGetter**(`name`: string): *MacroableFn‹any› | undefined*

*Inherited from void*

Return the existing getter or null if it doesn't exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn‹any› | undefined*

___

### `Static` getMacro

▸ **getMacro**(`name`: string): *MacroableFn‹any› | undefined*

*Inherited from void*

Return the existing macro or null if it doesn't exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn‹any› | undefined*

___

### `Static` getter

▸ **getter**<**T**>(`name`: string, `callback`: MacroableFn‹T›, `singleton?`: undefined | false | true): *void*

*Inherited from void*

Define a getter, which is invoked everytime the value is accessed. This method
also allows adding single getters, whose value is cached after first time

**`example`** 
```js
Macroable.getter('time', function () {
  return new Date().getTime()
})

console.log(new Macroable().time)

// Singletons
Macroable.getter('time', function () {
  return new Date().getTime()
}, true)

console.log(new Macroable().time)
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn‹T› |
`singleton?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

### `Static` hasGetter

▸ **hasGetter**(`name`: string): *boolean*

*Inherited from void*

Returns a boolean telling if a getter exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hasMacro

▸ **hasMacro**(`name`: string): *boolean*

*Inherited from void*

Returns a boolean telling if a macro exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hydrate

▸ **hydrate**(): *void*

*Inherited from void*

Cleanup getters and macros from the class

**Returns:** *void*

___

### `Static` macro

▸ **macro**<**T**>(`name`: string, `callback`: MacroableFn‹T›): *void*

*Inherited from void*

Add a macro to the class. This method is a better to manually adding
to `class.prototype.method`.

Also macros added using `Macroable.macro` can be cleared anytime

**`example`** 
```js
Macroable.macro('getUsername', function () {
  return 'virk'
})
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn‹T› |

**Returns:** *void*
