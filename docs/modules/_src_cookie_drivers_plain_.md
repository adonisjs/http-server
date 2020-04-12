[@adonisjs/http-server](../README.md) › ["src/Cookie/Drivers/Plain"](_src_cookie_drivers_plain_.md)

# Module: "src/Cookie/Drivers/Plain"

## Index

### Functions

* [canUnpack](_src_cookie_drivers_plain_.md#canunpack)
* [pack](_src_cookie_drivers_plain_.md#pack)
* [unpack](_src_cookie_drivers_plain_.md#unpack)

## Functions

###  canUnpack

▸ **canUnpack**(`encodedValue`: string): *boolean*

Returns true when this `unpack` method of this module can attempt
to unpack the encode value.

**Parameters:**

Name | Type |
------ | ------ |
`encodedValue` | string |

**Returns:** *boolean*

___

###  pack

▸ **pack**(`value`: any): *null | string*

Encodes a value into a base64 url encoded string to
be set as cookie

**Parameters:**

Name | Type |
------ | ------ |
`value` | any |

**Returns:** *null | string*

___

###  unpack

▸ **unpack**(`encodedValue`: string): *null | any*

Attempts to unpack the value by decoding it. Make sure to call, `canUnpack`
before calling this method

**Parameters:**

Name | Type |
------ | ------ |
`encodedValue` | string |

**Returns:** *null | any*
