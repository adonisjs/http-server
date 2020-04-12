[@adonisjs/http-server](../README.md) › ["src/Cookie/Parser/index"](../modules/_src_cookie_parser_index_.md) › [CookieParser](_src_cookie_parser_index_.cookieparser.md)

# Class: CookieParser

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

▸ **decode**(`key`: string): *any*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any*

___

###  decrypt

▸ **decrypt**(`key`: string): *any*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any*

___

###  list

▸ **list**(): *object*

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  unsign

▸ **unsign**(`key`: string): *any*

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any*
