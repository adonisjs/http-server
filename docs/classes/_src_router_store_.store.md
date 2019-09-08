**[@poppinss/http-server](../README.md)**

[Globals](../README.md) › ["src/Router/Store"](../modules/_src_router_store_.md) › [Store](_src_router_store_.store.md)

# Class: Store

Store class is used to store a list of routes, along side with their tokens
to match the URL's. The used data structures to store information is tailored
for quick lookups.

**`example`** 
```ts
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

## Hierarchy

* **Store**

## Index

### Methods

* [add](_src_router_store_.store.md#add)
* [match](_src_router_store_.store.md#match)

### Object literals

* [tree](_src_router_store_.store.md#tree)

## Methods

###  add

▸ **add**(`route`: RouteDefinition): *this*

Adds a route to the store for all the given HTTP methods. Also an array
of tokens is generated for the route pattern. The tokens are then
matched against the URL to find the appropriate route.

**`example`** 
```ts
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

Name | Type |
------ | ------ |
`route` | RouteDefinition |

**Returns:** *this*

___

###  match

▸ **match**(`url`: string, `method`: string, `domain?`: undefined | string): *null | MatchedRoute*

Matches the url, method and optionally domain to pull the matching
route. `null` is returned when unable to match the URL against
registered routes.

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`method` | string |
`domain?` | undefined \| string |

**Returns:** *null | MatchedRoute*

## Object literals

###  tree

### ▪ **tree**: *object*

###  domains

• **domains**: *object*

#### Type declaration:

###  tokens

• **tokens**: *never[]* =  []