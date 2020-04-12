[@adonisjs/http-server](../README.md) › ["src/Cookie/Drivers/Signed"](_src_cookie_drivers_signed_.md)

# Module: "src/Cookie/Drivers/Signed"

## Index

### Functions

* [canUnpack](_src_cookie_drivers_signed_.md#canunpack)
* [pack](_src_cookie_drivers_signed_.md#pack)
* [unpack](_src_cookie_drivers_signed_.md#unpack)

## Functions

###  canUnpack

▸ **canUnpack**(`signedValue`: string): *boolean*

**Parameters:**

Name | Type |
------ | ------ |
`signedValue` | string |

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

▸ **unpack**(`key`: string, `signedValue`: string, `encryption`: EncryptionContract): *null | any*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`signedValue` | string |
`encryption` | EncryptionContract |

**Returns:** *null | any*
