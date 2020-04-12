[@adonisjs/http-server](../README.md) › ["src/Cookie/Parser/index"](../modules/_src_cookie_parser_index_.md) › [CookieParser](_src_cookie_parser_index_.cookieparser.md)

# Class: CookieParser

Cookie parser parses the HTTP `cookie` method and collects all cookies
inside an object of `key-value` pair, but doesn't attempt to decrypt
or unsign or decode the individual values.

The cookie values are lazily decrypted, or unsigned to avoid unncessary
processing, which infact can be used as a means to burden the server
by sending too many cookies which even doesn't belongs to the
server.

## Hierarchy

* **CookieParser**

## Index

### Constructors

* [constructor](_src_cookie_parser_index_.cookieparser.md#constructor)

### Methods

* [decode](_src_cookie_parser_index_.cookieparser.md#decode)
* [decrypt](_src_cookie_parser_index_.cookieparser.md#decrypt)
* [list](_src_cookie_parser_index_.cookieparser.md#list)
* [unsign](_src_cookie_parser_index_.cookieparser.md#unsign)

## Constructors

###  constructor

\+ **new CookieParser**(`cookieHeader`: string, `encryption`: EncryptionContract): *[CookieParser](_src_cookie_parser_index_.cookieparser.md)*

**Parameters:**

Name | Type |
------ | ------ |
`cookieHeader` | string |
`encryption` | EncryptionContract |

**Returns:** *[CookieParser](_src_cookie_parser_index_.cookieparser.md)*

## Methods

###  decode

▸ **decode**(`key`: string): *any | null*

Attempts to decode a cookie by the name. When calling this method,
you are assuming that the cookie was just encoded at the first
place and not signed or encrypted.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any | null*

___

###  decrypt

▸ **decrypt**(`key`: string): *null | any*

Attempts to decrypt a cookie by the name. When calling this method,
you are assuming that the cookie was encrypted at the first place.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *null | any*

___

###  list

▸ **list**(): *object*

Returns an object of cookies key-value pair. Do note, the
cookies are not decoded, unsigned or decrypted inside this
list.

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  unsign

▸ **unsign**(`key`: string): *null | any*

Attempts to unsign a cookie by the name. When calling this method,
you are assuming that the cookie was signed at the first place.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *null | any*
