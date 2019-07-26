> **[@poppinss/http-server](../README.md)**

[Globals](../README.md) / ["Router/Store"](../modules/_router_store_.md) / [Store](_router_store_.store.md) /

# Class: Store <**Context**>

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

## Type parameters

▪ **Context**

## Hierarchy

* **Store**

## Index

### Methods

* [add](_router_store_.store.md#add)
* [match](_router_store_.store.md#match)

### Object literals

* [tree](_router_store_.store.md#tree)

## Methods

###  add

▸ **add**(`route`: [RouteDefinition](../modules/_contracts_.md#routedefinition)‹*`Context`*›): *this*

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
`route` | [RouteDefinition](../modules/_contracts_.md#routedefinition)‹*`Context`*› |

**Returns:** *this*

___

###  match

▸ **match**(`url`: string, `method`: string, `domain?`: undefined | string): *null | [MatchedRoute](../modules/_contracts_.md#matchedroute)‹*`Context`*›*

Matches the url, method and optionally domain to pull the matching
route. `null` is returned when unable to match the URL against
registered routes.

**Parameters:**

Name | Type |
------ | ------ |
`url` | string |
`method` | string |
`domain?` | undefined \| string |

**Returns:** *null | [MatchedRoute](../modules/_contracts_.md#matchedroute)‹*`Context`*›*

## Object literals

###  tree

### ▪ **tree**: *object*

###  domains

• **domains**: *object*

#### Type declaration:

###  tokens

• **tokens**: *never[]* =  []