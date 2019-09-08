**[@adonisjs/http-server](../README.md)**

[Globals](../README.md) › ["src/HttpContext/index"](../modules/_src_httpcontext_index_.md) › [HttpContext](_src_httpcontext_index_.httpcontext.md)

# Class: HttpContext

Http context is passed to all route handlers, middleware,
error handler and server hooks.

## Hierarchy

* **HttpContext**

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

### Methods

* [create](_src_httpcontext_index_.httpcontext.md#static-create)

## Constructors

###  constructor

\+ **new HttpContext**(`request`: RequestContract, `response`: ResponseContract, `logger`: LoggerContract, `profiler`: ProfilerRowContract): *[HttpContext](_src_httpcontext_index_.httpcontext.md)*

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

## Methods

### `Static` create

▸ **create**(`routePattern`: string, `routeParams`: any, `logger`: LoggerContract, `profiler`: ProfilerRowContract, `req?`: IncomingMessage, `res?`: ServerResponse, `serverConfig?`: ServerConfigContract): *[HttpContext](_src_httpcontext_index_.httpcontext.md)*

Creates a new fake context instance for a given route.

**Parameters:**

Name | Type |
------ | ------ |
`routePattern` | string |
`routeParams` | any |
`logger` | LoggerContract |
`profiler` | ProfilerRowContract |
`req?` | IncomingMessage |
`res?` | ServerResponse |
`serverConfig?` | ServerConfigContract |

**Returns:** *[HttpContext](_src_httpcontext_index_.httpcontext.md)*