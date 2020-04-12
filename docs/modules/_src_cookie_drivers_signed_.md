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

Returns a boolean, if the unpack method from this module can attempt
to unpack the signed value.

**Parameters:**

Name | Type |
------ | ------ |
`signedValue` | string |

**Returns:** *boolean*

___

###  pack

▸ **pack**(`key`: string, `value`: any, `encryption`: EncryptionContract): *null | string*

Signs a value to be shared as a cookie. The signed output has a
hash to verify tampering with the original value

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

Attempts to unpack the signed value. Make sure to call `canUnpack` before
calling this method.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`signedValue` | string |
`encryption` | EncryptionContract |

**Returns:** *null | any*
