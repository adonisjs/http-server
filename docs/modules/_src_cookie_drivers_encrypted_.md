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

**Parameters:**

Name | Type |
------ | ------ |
`encryptedValue` | string |

**Returns:** *boolean*

___

###  pack

▸ **pack**(`key`: string, `value`: any, `encryption`: EncryptionContract): *null | string*

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

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`encryptedValue` | string |
`encryption` | EncryptionContract |

**Returns:** *null | any*
