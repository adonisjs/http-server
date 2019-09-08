**[@adonisjs/http-server](../README.md)**

[Globals](../README.md) › ["src/ExceptionManager/index"](../modules/_src_exceptionmanager_index_.md) › [ExceptionManager](_src_exceptionmanager_index_.exceptionmanager.md)

# Class: ExceptionManager

Exception manager exposes the API to register custom error handler
and invoke it on exceptions raised during the HTTP lifecycle

## Hierarchy

* **ExceptionManager**

## Index

### Constructors

* [constructor](_src_exceptionmanager_index_.exceptionmanager.md#constructor)

### Methods

* [handle](_src_exceptionmanager_index_.exceptionmanager.md#handle)
* [registerHandler](_src_exceptionmanager_index_.exceptionmanager.md#registerhandler)

## Constructors

###  constructor

\+ **new ExceptionManager**(`container`: IocContract): *[ExceptionManager](_src_exceptionmanager_index_.exceptionmanager.md)*

**Parameters:**

Name | Type |
------ | ------ |
`container` | IocContract |

**Returns:** *[ExceptionManager](_src_exceptionmanager_index_.exceptionmanager.md)*

## Methods

###  handle

▸ **handle**(`error`: any, `ctx`: HttpContextContract): *Promise‹void›*

Handle the error

**Parameters:**

Name | Type |
------ | ------ |
`error` | any |
`ctx` | HttpContextContract |

**Returns:** *Promise‹void›*

___

###  registerHandler

▸ **registerHandler**(`handler`: ErrorHandlerNode): *void*

Register a custom error handler

**Parameters:**

Name | Type |
------ | ------ |
`handler` | ErrorHandlerNode |

**Returns:** *void*