[@adonisjs/http-server](../README.md) › ["src/Response/index"](../modules/_src_response_index_.md) › [Response](_src_response_index_.response.md)

# Class: Response

The response is a wrapper over [ServerResponse](https://nodejs.org/api/http.html#http_class_http_serverresponse)
streamlining the process of writing response body and automatically setting up appropriate headers.

The response class has support for `explicitEnd` mode, which is set to true by default.

When implicit end is set to true, the response class will not write content to the HTTP response
directly and instead waits for an explicit call to the `finish` method. This is done to
allow `return` statements from controllers.

This is how `explicitEnd` mode works in nutshell.

**When set to true**
1. Calls to `send`, `json` and `jsonp` will be buffered until `finish` is called.
2. `response.hasLazyBody` returns `true` after calling `send`, `json` or `jsonp`.
3. If `response.hasLazyBody` return `false`, then server will use the `return value` of the controller
   and set it as body before calling `finish`.

**When set to false**
1. Calls to `send`, `json` and `jsonp` will write the response writeaway.
2. The `return value` of the controller will be discarded.
3. The call to `finish` method is a noop.

## Hierarchy

* Macroable

  ↳ **Response**

## Implements

* ResponseContract

## Index

### Constructors

* [constructor](_src_response_index_.response.md#constructor)

### Properties

* [ctx](_src_response_index_.response.md#optional-ctx)
* [lazyBody](_src_response_index_.response.md#lazybody)
* [request](_src_response_index_.response.md#request)
* [response](_src_response_index_.response.md#response)
* [getters](_src_response_index_.response.md#static-protected-getters)
* [macros](_src_response_index_.response.md#static-protected-macros)

### Accessors

* [finished](_src_response_index_.response.md#finished)
* [hasLazyBody](_src_response_index_.response.md#haslazybody)
* [headersSent](_src_response_index_.response.md#headerssent)
* [isPending](_src_response_index_.response.md#ispending)

### Methods

* [abort](_src_response_index_.response.md#abort)
* [abortIf](_src_response_index_.response.md#abortif)
* [abortUnless](_src_response_index_.response.md#abortunless)
* [accepted](_src_response_index_.response.md#accepted)
* [append](_src_response_index_.response.md#append)
* [attachment](_src_response_index_.response.md#attachment)
* [badGateway](_src_response_index_.response.md#badgateway)
* [badRequest](_src_response_index_.response.md#badrequest)
* [buildResponseBody](_src_response_index_.response.md#buildresponsebody)
* [clearCookie](_src_response_index_.response.md#clearcookie)
* [conflict](_src_response_index_.response.md#conflict)
* [continue](_src_response_index_.response.md#continue)
* [cookie](_src_response_index_.response.md#cookie)
* [created](_src_response_index_.response.md#created)
* [download](_src_response_index_.response.md#download)
* [expectationFailed](_src_response_index_.response.md#expectationfailed)
* [finish](_src_response_index_.response.md#finish)
* [flushHeaders](_src_response_index_.response.md#flushheaders)
* [forbidden](_src_response_index_.response.md#forbidden)
* [fresh](_src_response_index_.response.md#fresh)
* [gatewayTimeout](_src_response_index_.response.md#gatewaytimeout)
* [getHeader](_src_response_index_.response.md#getheader)
* [gone](_src_response_index_.response.md#gone)
* [header](_src_response_index_.response.md#header)
* [httpVersionNotSupported](_src_response_index_.response.md#httpversionnotsupported)
* [internalServerError](_src_response_index_.response.md#internalservererror)
* [json](_src_response_index_.response.md#json)
* [jsonp](_src_response_index_.response.md#jsonp)
* [lengthRequired](_src_response_index_.response.md#lengthrequired)
* [location](_src_response_index_.response.md#location)
* [methodNotAllowed](_src_response_index_.response.md#methodnotallowed)
* [movedPermanently](_src_response_index_.response.md#movedpermanently)
* [movedTemporarily](_src_response_index_.response.md#movedtemporarily)
* [multipleChoices](_src_response_index_.response.md#multiplechoices)
* [noContent](_src_response_index_.response.md#nocontent)
* [nonAuthoritativeInformation](_src_response_index_.response.md#nonauthoritativeinformation)
* [notAcceptable](_src_response_index_.response.md#notacceptable)
* [notFound](_src_response_index_.response.md#notfound)
* [notImplemented](_src_response_index_.response.md#notimplemented)
* [notModified](_src_response_index_.response.md#notmodified)
* [ok](_src_response_index_.response.md#ok)
* [partialContent](_src_response_index_.response.md#partialcontent)
* [paymentRequired](_src_response_index_.response.md#paymentrequired)
* [plainCookie](_src_response_index_.response.md#plaincookie)
* [preconditionFailed](_src_response_index_.response.md#preconditionfailed)
* [proxyAuthenticationRequired](_src_response_index_.response.md#proxyauthenticationrequired)
* [redirect](_src_response_index_.response.md#redirect)
* [removeHeader](_src_response_index_.response.md#removeheader)
* [requestEntityTooLarge](_src_response_index_.response.md#requestentitytoolarge)
* [requestTimeout](_src_response_index_.response.md#requesttimeout)
* [requestUriTooLong](_src_response_index_.response.md#requesturitoolong)
* [requestedRangeNotSatisfiable](_src_response_index_.response.md#requestedrangenotsatisfiable)
* [resetContent](_src_response_index_.response.md#resetcontent)
* [safeHeader](_src_response_index_.response.md#safeheader)
* [safeStatus](_src_response_index_.response.md#safestatus)
* [seeOther](_src_response_index_.response.md#seeother)
* [send](_src_response_index_.response.md#send)
* [serviceUnavailable](_src_response_index_.response.md#serviceunavailable)
* [setEtag](_src_response_index_.response.md#setetag)
* [status](_src_response_index_.response.md#status)
* [stream](_src_response_index_.response.md#stream)
* [switchingProtocols](_src_response_index_.response.md#switchingprotocols)
* [temporaryRedirect](_src_response_index_.response.md#temporaryredirect)
* [tooManyRequests](_src_response_index_.response.md#toomanyrequests)
* [type](_src_response_index_.response.md#type)
* [unauthorized](_src_response_index_.response.md#unauthorized)
* [unprocessableEntity](_src_response_index_.response.md#unprocessableentity)
* [unsupportedMediaType](_src_response_index_.response.md#unsupportedmediatype)
* [useProxy](_src_response_index_.response.md#useproxy)
* [vary](_src_response_index_.response.md#vary)
* [getGetter](_src_response_index_.response.md#static-getgetter)
* [getMacro](_src_response_index_.response.md#static-getmacro)
* [getter](_src_response_index_.response.md#static-getter)
* [hasGetter](_src_response_index_.response.md#static-hasgetter)
* [hasMacro](_src_response_index_.response.md#static-hasmacro)
* [hydrate](_src_response_index_.response.md#static-hydrate)
* [macro](_src_response_index_.response.md#static-macro)

## Constructors

###  constructor

\+ **new Response**(`request`: IncomingMessage, `response`: ServerResponse, `config`: DeepReadonly‹ResponseConfigContract›): *[Response](_src_response_index_.response.md)*

*Overrides void*

**Parameters:**

Name | Type |
------ | ------ |
`request` | IncomingMessage |
`response` | ServerResponse |
`config` | DeepReadonly‹ResponseConfigContract› |

**Returns:** *[Response](_src_response_index_.response.md)*

## Properties

### `Optional` ctx

• **ctx**? : *HttpContextContract*

The ctx will be set by the context itself. It creates a circular
reference

___

###  lazyBody

• **lazyBody**: *LazyBody | null* = null

Lazy body is used to set the response body. However, do not
write it on the socket immediately unless `response.finish`
is called.

Only works with `explicitEnd=true`, which is set to `false` by default

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

#### Type declaration:

## Accessors

###  finished

• **get finished**(): *boolean*

Returns a boolean telling if response is finished or not.
Any more attempts to update headers or body will result
in raised exceptions.

**Returns:** *boolean*

___

###  hasLazyBody

• **get hasLazyBody**(): *boolean*

Returns a boolean telling if lazy body is already set or not

**Returns:** *boolean*

___

###  headersSent

• **get headersSent**(): *boolean*

Returns a boolean telling if response headers has been sent or not.
Any more attempts to update headers will result in raised
exceptions.

**Returns:** *boolean*

___

###  isPending

• **get isPending**(): *boolean*

Returns a boolean telling if response headers and body is written
or not. When value is `true`, you can feel free to write headers
and body.

**Returns:** *boolean*

## Methods

###  abort

▸ **abort**(`body`: any, `status?`: undefined | number): *never*

Abort the request with custom body and a status code. 400 is
used when status is not defined

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`status?` | undefined &#124; number |

**Returns:** *never*

___

###  abortIf

▸ **abortIf**(`condition`: any, `body`: any, `status?`: undefined | number): *void*

Abort the request with custom body and a status code when
passed condition returns `true`

**Parameters:**

Name | Type |
------ | ------ |
`condition` | any |
`body` | any |
`status?` | undefined &#124; number |

**Returns:** *void*

___

###  abortUnless

▸ **abortUnless**(`condition`: any, `body`: any, `status?`: undefined | number): *asserts condition*

Abort the request with custom body and a status code when
passed condition returns `false`

**Parameters:**

Name | Type |
------ | ------ |
`condition` | any |
`body` | any |
`status?` | undefined &#124; number |

**Returns:** *asserts condition*

___

###  accepted

▸ **accepted**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  append

▸ **append**(`key`: string, `value`: CastableHeader): *this*

Append value to an existing header. To replace the value, we suggest using
[header](_src_response_index_.response.md#header) method.

If `value` is not existy, then header won't be set.

**`example`** 
```js
response.append('set-cookie', 'username=virk')
```

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | CastableHeader |

**Returns:** *this*

___

###  attachment

▸ **attachment**(`filePath`: string, `name?`: undefined | string, `disposition?`: undefined | string, `generateEtag?`: undefined | false | true, `errorCallback?`: undefined | function): *void*

Download the file by forcing the user to save the file vs displaying it
within the browser.

Internally calls [download](_src_response_index_.response.md#download)

**Parameters:**

Name | Type |
------ | ------ |
`filePath` | string |
`name?` | undefined &#124; string |
`disposition?` | undefined &#124; string |
`generateEtag?` | undefined &#124; false &#124; true |
`errorCallback?` | undefined &#124; function |

**Returns:** *void*

___

###  badGateway

▸ **badGateway**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  badRequest

▸ **badRequest**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  buildResponseBody

▸ **buildResponseBody**(`body`: any): *object*

Builds the response body and returns it's appropriate type
to be set as the content-type header.

Ideally, you should use [send](_src_response_index_.response.md#send) vs using this method. This method will
not set any headers and must be used when you want more control over the
response sending process.

Make sure to appropriately handle the case of `unknown` type, which is returned
when unable to parse the body type.

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |

**Returns:** *object*

* **body**: *any*

* **originalType**? : *undefined | string*

* **type**: *ResponseContentType*

___

###  clearCookie

▸ **clearCookie**(`key`: string, `options?`: Partial‹CookieOptions›): *this*

Clear existing cookie.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`options?` | Partial‹CookieOptions› |

**Returns:** *this*

___

###  conflict

▸ **conflict**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  continue

▸ **continue**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  cookie

▸ **cookie**(`key`: string, `value`: any, `options?`: Partial‹CookieOptions›): *this*

Set signed cookie as the response header. The inline options overrides
all options from the config (means they are not merged).

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`options?` | Partial‹CookieOptions› |

**Returns:** *this*

___

###  created

▸ **created**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  download

▸ **download**(`filePath`: string, `generateEtag`: boolean, `errorCallback?`: undefined | function): *void*

Download file by streaming it from the file path. This method will setup
appropriate `Content-type`, `Content-type` and `Last-modified` headers.

Unexpected stream errors are handled gracefully to avoid memory leaks.

If `raiseErrors=false`, then this method will self handle all the exceptions by
writing a generic HTTP response. To have more control over the error, it is
recommended to set `raiseErrors=true` and wrap this function inside a
`try/catch` statement.

**`example`** 
```js
// Errors handled automatically with generic HTTP response
response.download('somefile.jpg')

// Manually handle (note the await call)
try {
  await response.download('somefile.jpg')
} catch (error) {
  response.status(error.code === 'ENOENT' ? 404 : 500)
  response.send('Cannot process file')
}
```

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`filePath` | string | - |
`generateEtag` | boolean | this.config.etag |
`errorCallback?` | undefined &#124; function | - |

**Returns:** *void*

___

###  expectationFailed

▸ **expectationFailed**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  finish

▸ **finish**(): *void*

Finishes the response by writing the lazy body, when `explicitEnd = true`
and response is already pending.

Calling this method twice or when `explicitEnd = false` is noop.

**Returns:** *void*

___

###  flushHeaders

▸ **flushHeaders**(`statusCode?`: undefined | number): *this*

Writes headers to the response.

**Parameters:**

Name | Type |
------ | ------ |
`statusCode?` | undefined &#124; number |

**Returns:** *this*

___

###  forbidden

▸ **forbidden**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

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

if (response.fresh()) {
  response.sendStatus(304)
} else {
  response.send(responseBody)
}
```

**Returns:** *boolean*

___

###  gatewayTimeout

▸ **gatewayTimeout**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  getHeader

▸ **getHeader**(`key`: string): *any*

Returns the existing value for a given HTTP response
header.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *any*

___

###  gone

▸ **gone**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  header

▸ **header**(`key`: string, `value`: CastableHeader): *this*

Set header on the response. To `append` values to the existing header, we suggest
using [append](_src_response_index_.response.md#append) method.

If `value` is non existy, then header won't be set.

**`example`** 
```js
response.header('content-type', 'application/json')
```

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | CastableHeader |

**Returns:** *this*

___

###  httpVersionNotSupported

▸ **httpVersionNotSupported**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  internalServerError

▸ **internalServerError**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  json

▸ **json**(`body`: any, `generateEtag?`: undefined | false | true): *void*

Alias of [send](_src_response_index_.response.md#send)

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  jsonp

▸ **jsonp**(`body`: any, `callbackName`: string, `generateEtag`: boolean): *void*

Writes response as JSONP. The callback name is resolved as follows, with priority
from top to bottom.

1. Explicitly defined as 2nd Param.
2. Fetch from request query string.
3. Use the config value `http.jsonpCallbackName` from `config/app.js`.
4. Fallback to `callback`.

This method buffers the body if `explicitEnd = true`, which is the default
behavior and do not change, unless you know what you are doing.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`body` | any | - |
`callbackName` | string | this.config.jsonpCallbackName |
`generateEtag` | boolean | this.config.etag |

**Returns:** *void*

___

###  lengthRequired

▸ **lengthRequired**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  location

▸ **location**(`url`: string): *this*

Set the location header.

**`example`** 
```js
response.location('/login')
```

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |

**Returns:** *this*

___

###  methodNotAllowed

▸ **methodNotAllowed**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  movedPermanently

▸ **movedPermanently**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  movedTemporarily

▸ **movedTemporarily**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  multipleChoices

▸ **multipleChoices**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  noContent

▸ **noContent**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  nonAuthoritativeInformation

▸ **nonAuthoritativeInformation**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  notAcceptable

▸ **notAcceptable**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  notFound

▸ **notFound**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  notImplemented

▸ **notImplemented**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  notModified

▸ **notModified**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  ok

▸ **ok**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  partialContent

▸ **partialContent**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  paymentRequired

▸ **paymentRequired**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  plainCookie

▸ **plainCookie**(`key`: string, `value`: any, `options?`: Partial‹CookieOptions›): *this*

Set unsigned cookie as the response header. The inline options overrides
all options from the config (means they are not merged)

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | any |
`options?` | Partial‹CookieOptions› |

**Returns:** *this*

___

###  preconditionFailed

▸ **preconditionFailed**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  proxyAuthenticationRequired

▸ **proxyAuthenticationRequired**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  redirect

▸ **redirect**(`url`: string, `sendQueryParams?`: undefined | false | true, `statusCode`: number): *void*

Redirect request to a different URL. Current request `query string` can be forwared
by setting 2nd param to `true`.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`url` | string | - |
`sendQueryParams?` | undefined &#124; false &#124; true | - |
`statusCode` | number | 302 |

**Returns:** *void*

___

###  removeHeader

▸ **removeHeader**(`key`: string): *this*

Removes the existing response header from being sent.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |

**Returns:** *this*

___

###  requestEntityTooLarge

▸ **requestEntityTooLarge**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  requestTimeout

▸ **requestTimeout**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  requestUriTooLong

▸ **requestUriTooLong**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  requestedRangeNotSatisfiable

▸ **requestedRangeNotSatisfiable**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  resetContent

▸ **resetContent**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  safeHeader

▸ **safeHeader**(`key`: string, `value`: CastableHeader): *this*

Adds HTTP response header, when it doesn't exists already.

**Parameters:**

Name | Type |
------ | ------ |
`key` | string |
`value` | CastableHeader |

**Returns:** *this*

___

###  safeStatus

▸ **safeStatus**(`code`: number): *this*

Set's status code only when it's not explictly
set

**Parameters:**

Name | Type |
------ | ------ |
`code` | number |

**Returns:** *this*

___

###  seeOther

▸ **seeOther**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  send

▸ **send**(`body`: any, `generateEtag`: boolean): *void*

Send the body as response and optionally generate etag. The default value
is read from `config/app.js` file, using `http.etag` property.

This method buffers the body if `explicitEnd = true`, which is the default
behavior and do not change, unless you know what you are doing.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`body` | any | - |
`generateEtag` | boolean | this.config.etag |

**Returns:** *void*

___

###  serviceUnavailable

▸ **serviceUnavailable**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  setEtag

▸ **setEtag**(`body`: any, `weak`: boolean): *this*

Set etag by computing hash from the body. This class will set the etag automatically
when `etag = true` in the defined config object.

Use this function, when you want to compute etag manually for some other resons.

**Parameters:**

Name | Type | Default |
------ | ------ | ------ |
`body` | any | - |
`weak` | boolean | false |

**Returns:** *this*

___

###  status

▸ **status**(`code`: number): *this*

Set HTTP status code

**Parameters:**

Name | Type |
------ | ------ |
`code` | number |

**Returns:** *this*

___

###  stream

▸ **stream**(`body`: ResponseStream, `errorCallback?`: undefined | function): *void*

Pipe stream to the response. This method will gracefully destroy
the stream, avoiding memory leaks.

If `raiseErrors=false`, then this method will self handle all the exceptions by
writing a generic HTTP response. To have more control over the error, it is
recommended to set `raiseErrors=true` and wrap this function inside a
`try/catch` statement.

Streaming a file from the disk and showing 404 when file is missing.

**`example`** 
```js
// Errors handled automatically with generic HTTP response
response.stream(fs.createReadStream('file.txt'))

// Manually handle (note the await call)
try {
  await response.stream(fs.createReadStream('file.txt'))
} catch () {
  response.status(404).send('File not found')
}
```

**Parameters:**

Name | Type |
------ | ------ |
`body` | ResponseStream |
`errorCallback?` | undefined &#124; function |

**Returns:** *void*

___

###  switchingProtocols

▸ **switchingProtocols**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  temporaryRedirect

▸ **temporaryRedirect**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  tooManyRequests

▸ **tooManyRequests**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  type

▸ **type**(`type`: string, `charset?`: undefined | string): *this*

Set response type by looking up for the mime-type using
partial types like file extensions.

Make sure to read [mime-types](https://www.npmjs.com/package/mime-types) docs
too.

**`example`** 
```js
response.type('.json') // Content-type: application/json
```

**Parameters:**

Name | Type |
------ | ------ |
`type` | string |
`charset?` | undefined &#124; string |

**Returns:** *this*

___

###  unauthorized

▸ **unauthorized**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  unprocessableEntity

▸ **unprocessableEntity**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  unsupportedMediaType

▸ **unsupportedMediaType**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  useProxy

▸ **useProxy**(`body`: any, `generateEtag?`: undefined | false | true): *void*

**Parameters:**

Name | Type |
------ | ------ |
`body` | any |
`generateEtag?` | undefined &#124; false &#124; true |

**Returns:** *void*

___

###  vary

▸ **vary**(`field`: string): *this*

Set the Vary HTTP header

**Parameters:**

Name | Type |
------ | ------ |
`field` | string |

**Returns:** *this*

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
