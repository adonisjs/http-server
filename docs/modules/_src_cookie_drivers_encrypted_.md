[@adonisjs/http-server](../README.md) › ["src/Cookie/Drivers/Encrypted"](_src_cookie_drivers_encrypted_.md)

# Module: "src/Cookie/Drivers/Encrypted"

## Index

### Functions

* [canUnpack](_src_cookie_drivers_encrypted_.md#canunpack)
* [pack](_src_cookie_drivers_encrypted_.md#pack)
* [unpack](_src_cookie_drivers_encrypted_.md#unpack)

## Functions

###  canUnpack

▸ **canUnpack**(`encryptedValue`: string): *boolean*

Returns a boolean, if the unpack method from this module can attempt
to unpack encrypted value.

**Parameters:**

Name | Type |
------ | ------ |
`encryptedValue` | string |

**Returns:** *boolean*

___

###  pack

▸ **pack**(`key`: string, `value`: any, `encryption`: EncryptionContract): *null | string*

Encrypt a value to be set as cookie

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`encryption` | EncryptionContract |

**Returns:** *null | string*

___

###  unpack

▸ **unpack**(`key`: string, `encryptedValue`: string, `encryption`: EncryptionContract): *null | any*

Attempts to unpack the encrypted cookie value. Returns null, when fails to do so.
Only call this method, when `canUnpack` returns true, otherwise runtime
exceptions can be raised.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`encryptedValue` | string |
`encryption` | EncryptionContract |

**Returns:** *null | any*
