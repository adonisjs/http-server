[@poppinss/http-server](../README.md) > [@poppinss/http-server](../modules/_poppinss_http_server.md) > [Store](../classes/_poppinss_http_server.store.md)

# Class: Store

Store class is used to store a list of routes, along side with their tokens to match the URL's. The used data structures to store information is tailored for quick lookups.

*__example__*:
 ```js
const store = new Store()

store.add({
 pattern: 'posts/:id',
 handler: function onRoute () {},
 middleware: [],
 matchers: {
   id: '^[0-9]$+'
 },
 meta: {},
 methods: ['GET']
})

store.match('posts/1', 'GET')
```

## Type parameters
#### Context 
## Hierarchy

**Store**

## Index

### Methods

* [add](_poppinss_http_server.store.md#add)
* [match](_poppinss_http_server.store.md#match)

### Object literals

* [tree](_poppinss_http_server.store.md#tree)

---

## Methods

<a id="add"></a>

###  add

▸ **add**(route: *[RouteDefination](../modules/_poppinss_http_server.md#routedefination)<`Context`>*): `this`

Adds a route to the store for all the given HTTP methods. Also an array of tokens is generated for the route pattern. The tokens are then matched against the URL to find the appropriate route.

*__example__*:
 ```js
store.add({
  pattern: 'post/:id',
  methods: ['GET'],
  matchers: {},
  meta: {},
  handler: function handler () {
  }
})
```

**Parameters:**

| Name | Type |
| ------ | ------ |
| route | [RouteDefination](../modules/_poppinss_http_server.md#routedefination)<`Context`> |

**Returns:** `this`

___
<a id="match"></a>

###  match

▸ **match**(url: *`string`*, method: *`string`*, domain?: *`undefined` \| `string`*): `null` \| [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)<`Context`>

Matches the url, method and optionally domain to pull the matching route. `null` is returned when unable to match the URL against registered routes.

**Parameters:**

| Name | Type |
| ------ | ------ |
| url | `string` |
| method | `string` |
| `Optional` domain | `undefined` \| `string` |

**Returns:** `null` \| [MatchedRoute](../modules/_poppinss_http_server.md#matchedroute)<`Context`>

___

## Object literals

<a id="tree"></a>

###  tree

**tree**: *`object`*

<a id="tree.domains"></a>

####  domains

**● domains**: *`object`*

#### Type declaration

___
<a id="tree.tokens"></a>

####  tokens

**● tokens**: *`never`[]* =  []

___

___

