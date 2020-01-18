[@adonisjs/http-server](../README.md) › [@poppinss/request](../modules/_poppinss_request.md) › [Request](_poppinss_request.request.md)

# Class: Request

HTTP Request class exposes the interface to consistently read values
related to a given HTTP request. The class is wrapper over
[IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
and has extended API.

You can access the original [IncomingMessage](https://nodejs.org/api/http.html#http_class_http_incomingmessage)
using `request.request` property.

## Hierarchy

* Macroable

  ↳ **Request**

## Implements

* RequestContract

## Index

### Constructors

* [constructor](_poppinss_request.request.md#constructor)

### Properties

* [parsedUrl](_poppinss_request.request.md#parsedurl)
* [request](_poppinss_request.request.md#request)
* [response](_poppinss_request.request.md#response)
* [getters](_poppinss_request.request.md#static-protected-getters)
* [macros](_poppinss_request.request.md#static-protected-macros)

### Methods

* [accepts](_poppinss_request.request.md#accepts)
* [ajax](_poppinss_request.request.md#ajax)
* [all](_poppinss_request.request.md#all)
* [charset](_poppinss_request.request.md#charset)
* [charsets](_poppinss_request.request.md#charsets)
* [completeUrl](_poppinss_request.request.md#completeurl)
* [cookie](_poppinss_request.request.md#cookie)
* [cookies](_poppinss_request.request.md#cookies)
* [encoding](_poppinss_request.request.md#encoding)
* [encodings](_poppinss_request.request.md#encodings)
* [except](_poppinss_request.request.md#except)
* [fresh](_poppinss_request.request.md#fresh)
* [get](_poppinss_request.request.md#get)
* [hasBody](_poppinss_request.request.md#hasbody)
* [hasValidSignature](_poppinss_request.request.md#hasvalidsignature)
* [header](_poppinss_request.request.md#header)
* [headers](_poppinss_request.request.md#headers)
* [hostname](_poppinss_request.request.md#hostname)
* [id](_poppinss_request.request.md#id)
* [input](_poppinss_request.request.md#input)
* [intended](_poppinss_request.request.md#intended)
* [ip](_poppinss_request.request.md#ip)
* [ips](_poppinss_request.request.md#ips)
* [is](_poppinss_request.request.md#is)
* [language](_poppinss_request.request.md#language)
* [languages](_poppinss_request.request.md#languages)
* [method](_poppinss_request.request.md#method)
* [only](_poppinss_request.request.md#only)
* [original](_poppinss_request.request.md#original)
* [pjax](_poppinss_request.request.md#pjax)
* [plainCookie](_poppinss_request.request.md#plaincookie)
* [plainCookies](_poppinss_request.request.md#plaincookies)
* [post](_poppinss_request.request.md#post)
* [protocol](_poppinss_request.request.md#protocol)
* [raw](_poppinss_request.request.md#raw)
* [secure](_poppinss_request.request.md#secure)
* [setInitialBody](_poppinss_request.request.md#setinitialbody)
* [stale](_poppinss_request.request.md#stale)
* [subdomains](_poppinss_request.request.md#subdomains)
* [toJSON](_poppinss_request.request.md#tojson)
* [types](_poppinss_request.request.md#types)
* [updateBody](_poppinss_request.request.md#updatebody)
* [updateQs](_poppinss_request.request.md#updateqs)
* [updateRawBody](_poppinss_request.request.md#updaterawbody)
* [url](_poppinss_request.request.md#url)
* [getGetter](_poppinss_request.request.md#static-getgetter)
* [getMacro](_poppinss_request.request.md#static-getmacro)
* [getter](_poppinss_request.request.md#static-getter)
* [hasGetter](_poppinss_request.request.md#static-hasgetter)
* [hasMacro](_poppinss_request.request.md#static-hasmacro)
* [hydrate](_poppinss_request.request.md#static-hydrate)
* [macro](_poppinss_request.request.md#static-macro)

## Constructors

###  constructor

\+ **new Request**(`request`: IncomingMessage, `response`: ServerResponse, `encryption`: EncryptionContract, `config`: DeepReadonly‹RequestConfigContract›): *[Request](_poppinss_request.request.md)*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`request` | IncomingMessage |
`response` | ServerResponse |
`encryption` | EncryptionContract |
`config` | DeepReadonly‹RequestConfigContract› |

**Returns:** *[Request](_poppinss_request.request.md)*

## Properties

###  parsedUrl

• **parsedUrl**: *UrlWithStringQuery* = parse(this.request.url!, false)

Parses copy of the URL with query string as a string and not
object. This is done to build URL's with query string without
stringifying the object

___

###  request

• **request**: *IncomingMessage*

___

###  response

• **response**: *ServerResponse*

___

### `Static` `Protected` getters

▪ **getters**: *object*

*Overrides void*

#### Type declaration:

___

### `Static` `Protected` macros

▪ **macros**: *object*

*Overrides void*

Required by Macroable

#### Type declaration:

## Methods

###  accepts

▸ **accepts**(`types`: string[]): *string | null*

Returns the best type using `Accept` header and
by matching it against the given types.

If nothing is matched, then `null` will be returned

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**`example`** 
```js
switch (request.accepts(['json', 'html'])) {
  case 'json':
    return response.json(user)
  case 'html':
    return view.render('user', { user })
  default:
    // decide yourself
}
```

**Parameters:**

Name | Type |
------ | ------ |
`types` | string[] |

**Returns:** *string | null*

___

###  ajax

▸ **ajax**(): *boolean*

Returns a boolean telling, if request `X-Requested-With === 'xmlhttprequest'`
or not.

**Returns:** *boolean*

___

###  all

▸ **all**(): *object*

Returns reference to the merged copy of request body
and query string

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  charset

▸ **charset**(`charsets`: string[]): *string | null*

Returns the best charset using `Accept-charset` header
and by matching it against the given charsets.

If nothing is matched, then `null` will be returned

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**`example`** 
```js
switch (request.charset(['utf-8', 'ISO-8859-1'])) {
  case 'utf-8':
    // make utf-8 friendly response
  case 'ISO-8859-1':
    // make ISO-8859-1 friendly response
}
```

**Parameters:**

Name | Type |
------ | ------ |
`charsets` | string[] |

**Returns:** *string | null*

___

###  charsets

▸ **charsets**(): *string[]*

Return the charsets that the request accepts, in the order of the
client's preference (most preferred first).

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**Returns:** *string[]*

___

###  completeUrl

▸ **completeUrl**(`includeQueryString?`: undefined | false | true): *string*

Returns the complete HTTP url by combining
[protocol](_poppinss_request.request.md#protocol)://[hostname](_poppinss_request.request.md#hostname)/[url](_poppinss_request.request.md#url)

**`example`** 
```js
request.completeUrl()

// include query string
request.completeUrl(true)
```

**Parameters:**

Name | Type |
------ | ------ |
`includeQueryString?` | undefined &#124; false &#124; true |

**Returns:** *string*

___

###  cookie

▸ **cookie**(`key`: string, `defaultValue?`: undefined | string): *any*

Returns value for a given key from signed cookies. Optional
defaultValue is returned when actual value is undefined.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | undefined &#124; string |

**Returns:** *any*

___

###  cookies

▸ **cookies**(): *object*

Returns all parsed and signed cookies. Signed cookies ensures
that their value isn't tampered.

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  encoding

▸ **encoding**(`encodings`: string[]): *string | null*

Returns the best encoding using `Accept-encoding` header
and by matching it against the given encodings.

If nothing is matched, then `null` will be returned

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**Parameters:**

Name | Type |
------ | ------ |
`encodings` | string[] |

**Returns:** *string | null*

___

###  encodings

▸ **encodings**(): *string[]*

Return the charsets that the request accepts, in the order of the
client's preference (most preferred first).

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**Returns:** *string[]*

___

###  except

▸ **except**(`keys`: string[]): *object*

Get everything from the request body except the given keys.

**`example`** 
```js
request.except(['_csrf'])
```

**Parameters:**

Name | Type |
------ | ------ |
`keys` | string[] |

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  fresh

▸ **fresh**(): *boolean*

Returns a boolean telling if the new response etag evaluates same
as the request header `if-none-match`. In case of `true`, the
server must return `304` response, telling the browser to
use the client cache.

You won't have to deal with this method directly, since AdonisJs will
handle this for you when `http.etag = true` inside `config/app.js` file.

However, this is how you can use it manually.

**`example`** 
```js
const responseBody = view.render('some-view')

// sets the HTTP etag header for response
response.setEtag(responseBody)

if (request.fresh()) {
  response.sendStatus(304)
} else {
  response.send(responseBody)
}
```

**Returns:** *boolean*

___

###  get

▸ **get**(): *object*

Returns reference to the query string object

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  hasBody

▸ **hasBody**(): *boolean*

Returns a boolean telling if request has body

**Returns:** *boolean*

___

###  hasValidSignature

▸ **hasValidSignature**(): *boolean*

Returns a boolean telling if a signed url as a valid signature
or not.

**Returns:** *boolean*

___

###  header

▸ **header**(`key`: string, `defaultValue?`: any): *string | undefined*

Returns value for a given header key. The default value is
used when original value is `undefined`.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | any |

**Returns:** *string | undefined*

___

###  headers

▸ **headers**(): *IncomingHttpHeaders*

Returns a copy of headers as an object

**Returns:** *IncomingHttpHeaders*

___

###  hostname

▸ **hostname**(): *string | null*

Returns the request hostname. If proxy headers are trusted, then
`X-Forwarded-Host` is given priority over the `Host` header.

You can control the behavior of trusting the proxy values by defining it
inside the `config/app.js` file.

```js
{
  http: {
   trustProxy: '127.0.0.1'
  }
}
```

The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)

**Returns:** *string | null*

___

###  id

▸ **id**(): *string | undefined*

Returns the request id from the `x-request-id` header. The
header is untoched, if it already exists.

**Returns:** *string | undefined*

___

###  input

▸ **input**(`key`: string, `defaultValue?`: any): *any*

Returns value for a given key from the request body or query string.
The `defaultValue` is used when original value is `undefined`.

**`example`** 
```js
request.input('username')

// with default value
request.input('username', 'virk')
```

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | any |

**Returns:** *any*

___

###  intended

▸ **intended**(): *string*

Returns the HTTP request method. This is the original
request method. For spoofed request method, make
use of [method](_poppinss_request.request.md#method).

**`example`** 
```js
request.intended()
```

**Returns:** *string*

___

###  ip

▸ **ip**(): *string*

Returns the ip address of the user. This method is optimize to fetch
ip address even when running your AdonisJs app behind a proxy.

You can also define your own custom function to compute the ip address by
defining `app.http.getIp` as a function inside the config file.

```js
{
  http: {
    getIp (request) {
      // I am using nginx as a proxy server and want to trust 'x-real-ip'
      return request.header('x-real-ip')
    }
  }
}
```

You can control the behavior of trusting the proxy values by defining it
inside the `config/app.js` file.

```js
{
  http: {
   trustProxy: '127.0.0.1'
  }
}
```

The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)

**Returns:** *string*

___

###  ips

▸ **ips**(): *string[]*

Returns an array of ip addresses from most to least trusted one.
This method is optimize to fetch ip address even when running
your AdonisJs app behind a proxy.

You can control the behavior of trusting the proxy values by defining it
inside the `config/app.js` file.

```js
{
  http: {
   trustProxy: '127.0.0.1'
  }
}
```

The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)

**Returns:** *string[]*

___

###  is

▸ **is**(`types`: string[]): *string | null*

Returns the best matching content type of the request by
matching against the given types.

The content type is picked from the `content-type` header and request
must have body.

The method response highly depends upon the types array values. Described below:

| Type(s) | Return value |
|----------|---------------|
| ['json'] | json |
| ['application/*'] | application/json |
| ['vnd+json'] | application/json |

**`example`** 
```js
const bodyType = request.is(['json', 'xml'])

if (bodyType === 'json') {
 // process JSON
}

if (bodyType === 'xml') {
 // process XML
}
```

**Parameters:**

Name | Type |
------ | ------ |
`types` | string[] |

**Returns:** *string | null*

___

###  language

▸ **language**(`languages`: string[]): *string | null*

Returns the best language using `Accept-language` header
and by matching it against the given languages.

If nothing is matched, then `null` will be returned

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**`example`** 
```js
switch (request.language(['fr', 'de'])) {
  case 'fr':
    return view.render('about', { lang: 'fr' })
  case 'de':
    return view.render('about', { lang: 'de' })
  default:
    return view.render('about', { lang: 'en' })
}
```

**Parameters:**

Name | Type |
------ | ------ |
`languages` | string[] |

**Returns:** *string | null*

___

###  languages

▸ **languages**(): *string[]*

Return the languages that the request accepts, in the order of the
client's preference (most preferred first).

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**Returns:** *string[]*

___

###  method

▸ **method**(): *string*

Returns the request HTTP method by taking method spoofing into account.

Method spoofing works when all of the following are true.

1. `app.http.allowMethodSpoofing` config value is true.
2. request query string has `_method`.
3. The [intended](_poppinss_request.request.md#intended) request method is `POST`.

**`example`** 
```js
request.method()
```

**Returns:** *string*

___

###  only

▸ **only**<**T**, **U**>(`keys`: T[]): *U*

Get value for specified keys.

**`example`** 
```js
request.only(['username', 'age'])
```

**Type parameters:**

▪ **T**: *string*

▪ **U**

**Parameters:**

Name | Type |
------ | ------ |
`keys` | T[] |

**Returns:** *U*

___

###  original

▸ **original**(): *object*

Returns reference to the merged copy of original request
query string and body

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  pjax

▸ **pjax**(): *boolean*

Returns a boolean telling, if request has `X-Pjax` header
set or not

**Returns:** *boolean*

___

###  plainCookie

▸ **plainCookie**(`key`: string, `defaultValue?`: undefined | string): *any*

Returns value for a given key from unsigned cookies. Optional
defaultValue is returned when actual value is undefined.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`defaultValue?` | undefined &#124; string |

**Returns:** *any*

___

###  plainCookies

▸ **plainCookies**(): *object*

Returns all parsed and unsigned cookies. Unsigned cookies gives
no guarantee for cookie tampering. You only need `plainCookies`
when cookie is set by the client and not the server

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  post

▸ **post**(): *object*

Returns reference to the request body

**Returns:** *object*

* \[ **key**: *string*\]: any

___

###  protocol

▸ **protocol**(): *string*

Returns the request protocol by checking for the URL protocol or
`X-Forwarded-Proto` header.

If the `trust` is evaluated to `false`, then URL protocol is returned,
otherwise `X-Forwarded-Proto` header is used (if exists).

You can control the behavior of trusting the proxy values by defining it
inside the `config/app.js` file.

```js
{
  http: {
   trustProxy: '127.0.0.1'
  }
}
```

The value of trustProxy is passed directly to [proxy-addr](https://www.npmjs.com/package/proxy-addr)

**Returns:** *string*

___

###  raw

▸ **raw**(): *string | null*

Returns the request raw body (if exists), or returns `null`.

Ideally you must be dealing with the parsed body accessed using [input](_poppinss_request.request.md#input), [all](_poppinss_request.request.md#all) or
[post](_poppinss_request.request.md#post) methods. The `raw` body is always a string.

**Returns:** *string | null*

___

###  secure

▸ **secure**(): *boolean*

Returns a boolean telling if request is served over `https`
or not. Check [protocol](_poppinss_request.request.md#protocol) method to know how protocol is
fetched.

**Returns:** *boolean*

___

###  setInitialBody

▸ **setInitialBody**(`body`: object): *void*

Set initial request body. A copy of the input will be maintained as the original
request body. Since the request body and query string is subject to mutations, we
keep one original reference to flash old data (whenever required).

This method is supposed to be invoked by the body parser and must be called only
once. For further mutations make use of `updateBody` method.

**Parameters:**

Name | Type |
------ | ------ |
`body` | object |

**Returns:** *void*

___

###  stale

▸ **stale**(): *boolean*

Opposite of [fresh](_poppinss_request.request.md#fresh)

**Returns:** *boolean*

___

###  subdomains

▸ **subdomains**(): *string[]*

Returns an array of subdomains for the given host. An empty array is
returned if [hostname](_poppinss_request.request.md#hostname) is `null` or is an IP address.

Also `www` is not considered as a subdomain

**Returns:** *string[]*

___

###  toJSON

▸ **toJSON**(): *object*

toJSON copy of the request

**Returns:** *object*

* **headers**: *IncomingHttpHeaders* = this.headers()

* **id**: *undefined | string* = this.id()

* **method**: *string* = this.method()

* **protocol**: *string* = this.protocol()

* **query**: *null | string* = this.parsedUrl.query

* **url**: *string* = this.url()

___

###  types

▸ **types**(): *string[]*

Return the types that the request accepts, in the order of the
client's preference (most preferred first).

Make sure to check [accepts](https://www.npmjs.com/package/accepts) package
docs too.

**Returns:** *string[]*

___

###  updateBody

▸ **updateBody**(`body`: object): *void*

Update the request body with new data object. The `all` property
will be re-computed by merging the query string and request
body.

**Parameters:**

Name | Type |
------ | ------ |
`body` | object |

**Returns:** *void*

___

###  updateQs

▸ **updateQs**(`data`: object): *void*

Update the query string with the new data object. The `all` property
will be re-computed by merging the query and the request body.

**Parameters:**

Name | Type |
------ | ------ |
`data` | object |

**Returns:** *void*

___

###  updateRawBody

▸ **updateRawBody**(`rawBody`: string): *void*

Update the request raw body. Bodyparser sets this when unable to parse
the request body or when request is multipart/form-data.

**Parameters:**

Name | Type |
------ | ------ |
`rawBody` | string |

**Returns:** *void*

___

###  url

▸ **url**(`includeQueryString?`: undefined | false | true): *string*

Returns the request relative URL.

**`example`** 
```js
request.url()

// include query string
request.url(true)
```

**Parameters:**

Name | Type |
------ | ------ |
`includeQueryString?` | undefined &#124; false &#124; true |

**Returns:** *string*

___

### `Static` getGetter

▸ **getGetter**(`name`: string): *MacroableFn‹any› | undefined*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[getGetter](_src_router_briskroute_.briskroute.md#static-getgetter)*

Return the existing getter or null if it doesn't exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn‹any› | undefined*

___

### `Static` getMacro

▸ **getMacro**(`name`: string): *MacroableFn‹any› | undefined*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[getMacro](_src_router_briskroute_.briskroute.md#static-getmacro)*

Return the existing macro or null if it doesn't exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *MacroableFn‹any› | undefined*

___

### `Static` getter

▸ **getter**<**T**>(`name`: string, `callback`: MacroableFn‹T›, `singleton?`: undefined | false | true): *void*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[getter](_src_router_briskroute_.briskroute.md#static-getter)*

Define a getter, which is invoked everytime the value is accessed. This method
also allows adding single getters, whose value is cached after first time

**`example`** 
```js
Macroable.getter('time', function () {
  return new Date().getTime()
})

console.log(new Macroable().time)

// Singletons
Macroable.getter('time', function () {
  return new Date().getTime()
}, true)

console.log(new Macroable().time)
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn‹T› |
`singleton?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

### `Static` hasGetter

▸ **hasGetter**(`name`: string): *boolean*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[hasGetter](_src_router_briskroute_.briskroute.md#static-hasgetter)*

Returns a boolean telling if a getter exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hasMacro

▸ **hasMacro**(`name`: string): *boolean*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[hasMacro](_src_router_briskroute_.briskroute.md#static-hasmacro)*

Returns a boolean telling if a macro exists

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |

**Returns:** *boolean*

___

### `Static` hydrate

▸ **hydrate**(): *void*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[hydrate](_src_router_briskroute_.briskroute.md#static-hydrate)*

Cleanup getters and macros from the class

**Returns:** *void*

___

### `Static` macro

▸ **macro**<**T**>(`name`: string, `callback`: MacroableFn‹T›): *void*

*Inherited from [BriskRoute](_src_router_briskroute_.briskroute.md).[macro](_src_router_briskroute_.briskroute.md#static-macro)*

Add a macro to the class. This method is a better to manually adding
to `class.prototype.method`.

Also macros added using `Macroable.macro` can be cleared anytime

**`example`** 
```js
Macroable.macro('getUsername', function () {
  return 'virk'
})
```

**Type parameters:**

▪ **T**: *any*

**Parameters:**

Name | Type |
------ | ------ |
`name` | string |
`callback` | MacroableFn‹T› |

**Returns:** *void*
