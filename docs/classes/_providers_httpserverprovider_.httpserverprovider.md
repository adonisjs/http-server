[@adonisjs/http-server](../README.md) › ["providers/HttpServerProvider"](../modules/_providers_httpserverprovider_.md) › [HttpServerProvider](_providers_httpserverprovider_.httpserverprovider.md)

# Class: HttpServerProvider

## Hierarchy

* **HttpServerProvider**

## Index

### Constructors

* [constructor](_providers_httpserverprovider_.httpserverprovider.md#constructor)

### Properties

* [$container](_providers_httpserverprovider_.httpserverprovider.md#protected-container)

### Methods

* [$registerHTTPContext](_providers_httpserverprovider_.httpserverprovider.md#protected-registerhttpcontext)
* [$registerHttpServer](_providers_httpserverprovider_.httpserverprovider.md#protected-registerhttpserver)
* [$registerMiddlewareStore](_providers_httpserverprovider_.httpserverprovider.md#protected-registermiddlewarestore)
* [$registerRequestResponse](_providers_httpserverprovider_.httpserverprovider.md#protected-registerrequestresponse)
* [$registerRouter](_providers_httpserverprovider_.httpserverprovider.md#protected-registerrouter)
* [register](_providers_httpserverprovider_.httpserverprovider.md#register)

## Constructors

###  constructor

\+ **new HttpServerProvider**(`$container`: IocContract): *[HttpServerProvider](_providers_httpserverprovider_.httpserverprovider.md)*

**Parameters:**

Name | Type |
------ | ------ |
`$container` | IocContract |

**Returns:** *[HttpServerProvider](_providers_httpserverprovider_.httpserverprovider.md)*

## Properties

### `Protected` $container

• **$container**: *IocContract*

## Methods

### `Protected` $registerHTTPContext

▸ **$registerHTTPContext**(): *void*

Registering the HTTP context

**Returns:** *void*

___

### `Protected` $registerHttpServer

▸ **$registerHttpServer**(): *void*

Register the HTTP server

**Returns:** *void*

___

### `Protected` $registerMiddlewareStore

▸ **$registerMiddlewareStore**(): *void*

Registering middleware store to the container

**Returns:** *void*

___

### `Protected` $registerRequestResponse

▸ **$registerRequestResponse**(): *void*

Register request and response bindings to the container

**Returns:** *void*

___

### `Protected` $registerRouter

▸ **$registerRouter**(): *void*

Register the router. The router points to the instance of router used
by the middleware

**Returns:** *void*

___

###  register

▸ **register**(): *void*

Registering all bindings

**Returns:** *void*
