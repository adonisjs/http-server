**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["src/Server/Hooks/index"](../modules/_src_server_hooks_index_.md) › [Hooks](_src_server_hooks_index_.hooks.md)

# Class: Hooks

Exposes to API to register and execute before and after hooks

## Hierarchy

* **Hooks**

## Index

### Methods

* [after](_src_server_hooks_index_.hooks.md#after)
* [before](_src_server_hooks_index_.hooks.md#before)
* [commit](_src_server_hooks_index_.hooks.md#commit)
* [executeAfter](_src_server_hooks_index_.hooks.md#executeafter)
* [executeBefore](_src_server_hooks_index_.hooks.md#executebefore)

## Methods

###  after

▸ **after**(`cb`: HookNode): *this*

Register after hook

**Parameters:**

Name | Type |
------ | ------ |
`cb` | HookNode |

**Returns:** *this*

___

###  before

▸ **before**(`cb`: HookNode): *this*

Register before hook

**Parameters:**

Name | Type |
------ | ------ |
`cb` | HookNode |

**Returns:** *this*

___

###  commit

▸ **commit**(): *void*

The commit action enables us to optimize the hook handlers
for runtime peformance

**Returns:** *void*

___

###  executeAfter

▸ **executeAfter**(`ctx`: HttpContextContract): *Promise‹void›*

Executes after hooks in series.

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | HttpContextContract |

**Returns:** *Promise‹void›*

___

###  executeBefore

▸ **executeBefore**(`ctx`: HttpContextContract): *Promise‹boolean›*

Executing before hooks in series. If this method returns `true`,
it means that one of the before hooks wants to end the request
without further processing it.

**Parameters:**

Name | Type |
------ | ------ |
`ctx` | HttpContextContract |

**Returns:** *Promise‹boolean›*