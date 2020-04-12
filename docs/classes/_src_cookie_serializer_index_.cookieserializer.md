[@adonisjs/http-server](../README.md) › ["src/Cookie/Serializer/index"](../modules/_src_cookie_serializer_index_.md) › [CookieSerializer](_src_cookie_serializer_index_.cookieserializer.md)

# Class: CookieSerializer

Cookies serializer is used to serialize a value to be set on the `Set-Cookie`
header. You can `encode`, `sign` on `encrypt` cookies using the serializer
and then set them individually using the `set-cookie` header.

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

Encodes value as a plain cookie. Do note, the value is still JSON.stringified
and converted to base64 encoded string to avoid encoding issues.

**`example`** 
```ts
 serializer.encode('name', 'virk')
```

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

Encrypts the value and returns it back as a url safe string.

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

Signs the value and returns it back as a url safe string. The signed value
has a verification hash attached to it to detect data tampering.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`options?` | Partial‹CookieOptions› |

**Returns:** *string | null*
