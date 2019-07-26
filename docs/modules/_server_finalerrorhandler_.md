> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["Server/finalErrorHandler"](_server_finalerrorhandler_.md) /

# External module: "Server/finalErrorHandler"

## Index

### Functions

* [finalErrorHandler](_server_finalerrorhandler_.md#finalerrorhandler)

## Functions

###  finalErrorHandler

▸ **finalErrorHandler**<**Context**>(`errorHandler`: [ErrorHandlerNode](_contracts_.md#errorhandlernode)‹*`Context`*›, `error`: any, `ctx`: `Context`): *`Promise<void>`*

Final handler executes the route handler based on it's resolved
type and the response body on various conditions (check method body)
for same.

**Type parameters:**

▪ **Context**: *[HttpContextContract](../interfaces/_contracts_.httpcontextcontract.md)*

**Parameters:**

Name | Type |
------ | ------ |
`errorHandler` | [ErrorHandlerNode](_contracts_.md#errorhandlernode)‹*`Context`*› |
`error` | any |
`ctx` | `Context` |

**Returns:** *`Promise<void>`*