[@adonisjs/http-server](../README.md) › ["src/Cookie/Serializer/index"](../modules/_src_cookie_serializer_index_.md) › [CookieSerializer](_src_cookie_serializer_index_.cookieserializer.md)

# Class: CookieSerializer

## Hierarchy

* **CookieSerializer**

## Index

### Constructors

* [constructor](_src_cookie_serializer_index_.cookieserializer.md#constructor)

### Methods

* [encode](_src_cookie_serializer_index_.cookieserializer.md#encode)
* [encrypt](_src_cookie_serializer_index_.cookieserializer.md#encrypt)
* [sign](_src_cookie_serializer_index_.cookieserializer.md#sign)

## Constructors

###  constructor

\+ **new CookieSerializer**(`encryption`: EncryptionContract): *[CookieSerializer](_src_cookie_serializer_index_.cookieserializer.md)*

**Parameters:**

Name | Type |
------ | ------ |
`encryption` | EncryptionContract |

**Returns:** *[CookieSerializer](_src_cookie_serializer_index_.cookieserializer.md)*

## Methods

###  encode

▸ **encode**(`key`: string, `value`: any, `options?`: Partial‹CookieOptions›): *string | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`options?` | Partial‹CookieOptions› |

**Returns:** *string | null*

___

###  encrypt

▸ **encrypt**(`key`: string, `value`: any, `options?`: Partial‹CookieOptions›): *string | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`options?` | Partial‹CookieOptions› |

**Returns:** *string | null*

___

###  sign

▸ **sign**(`key`: string, `value`: any, `options?`: Partial‹CookieOptions›): *string | null*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`options?` | Partial‹CookieOptions› |

**Returns:** *string | null*
