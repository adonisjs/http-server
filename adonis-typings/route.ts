/**
 * @adonisjs/http-server
 *
 * (c) Harminder Virk <virk@adonisjs.com>
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

declare module '@ioc:Adonis/Core/Route' {
	import { MacroableConstructorContract } from 'macroable'
	import { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
	import { MiddlewareHandler, ResolvedMiddlewareHandler } from '@ioc:Adonis/Core/Middleware'

	/**
	 * The shape of the route handler
	 */
	export type RouteHandler = ((ctx: HttpContextContract) => Promise<any>) | string

	/**
	 * Node after resolving controller.method binding from the route
	 */
	export type ResolvedRouteHandler =
		| {
				type: 'function'
				handler: Exclude<RouteHandler, string>
		  }
		| {
				type: 'alias' | 'binding'
				namespace: string
				method: string
		  }

	/**
	 * Shape of match from the route store
	 */
	export type RouteStoreMatch = { old: string; type: number; val: string }

	/**
	 * Shape of route param matchers
	 */
	export type RouteMatchers = {
		[param: string]: RegExp
	}

	/**
	 * Route node persisted within the store
	 */
	export type RouteNode = {
		pattern: string

		/**
		 * The router itself doesn't use the handler for anything, it
		 * leaves the type to `any` for the consumer to decide the
		 * shape of the handler
		 */
		handler: RouteHandler

		/**
		 * The router itself doesn't use the middleware for anything, it
		 * leaves the type to `any` for the consumer to decide the
		 * shape of the middleware
		 */
		middleware: MiddlewareHandler[]

		/**
		 * Any custom runtime properties to be added to the route
		 */
		meta: {
			resolvedHandler?: ResolvedRouteHandler
			resolvedMiddleware?: ResolvedMiddlewareHandler[]
			namespace?: string
		} & { [key: string]: any }

		/**
		 * A unique name to lookup routes by name
		 */
		name?: string
	}

	/**
	 * An object of routes for a given HTTP method
	 */
	export type MethodNode = {
		tokens: any[]
		routes: {
			[pattern: string]: RouteNode
		}
	}

	/**
	 * Each domain node will have an object of methods and then
	 * a nested object of routes
	 */
	export type DomainNode = {
		[method: string]: MethodNode
	}

	/**
	 * Routes tree is a domain of DomainNodes
	 */
	export type RoutesTree = {
		tokens: any[]
		domains: {
			[domain: string]: DomainNode
		}
	}

	/**
	 * Route definition returned as a result of `route.toJSON` method
	 */
	export type RouteJSON = RouteNode & {
		methods: string[]
		domain?: string
		matchers: RouteMatchers
	}

	/**
	 * Route look node is used to find the routes using
	 * handler, pattern or name.
	 */
	export type RouteLookupNode = {
		handler: RouteHandler
		methods: string[]
		pattern: string
		domain: string
		name?: string
	}

	/**
	 * Shape of the matched route for a pattern, method and domain. We set
	 * them as spread options to the context.
	 */
	export type MatchedRoute = {
		route: RouteNode

		/**
		 * A unique key for the looked up route
		 */
		routeKey: string
		params: any
		subdomains: any
	}

	/**
	 * Shape of route class
	 */
	export interface RouteContract {
		/**
		 * A boolean to prevent route from getting registered within
		 * the [[Store]].
		 *
		 * This flag must be set before [[Router.commit]] method
		 */
		deleted: boolean

		/**
		 * A unique name to lookup the route
		 */
		name: string

		/**
		 * Define Regex matcher for a given param. If a matcher exists, then we do not
		 * override that, since the routes inside a group will set matchers before
		 * the group, so they should have priority over the route matchers.
		 *
		 * ```
		 * Route.group(() => {
		 *   Route.get('/:id', 'handler').where('id', /^[0-9]$/)
		 * }).where('id', /[^a-z$]/)
		 * ```
		 *
		 * The `/^[0-9]$/` should win over the matcher defined by the group
		 */
		where(param: string, matcher: string | RegExp): this

		/**
		 * Define prefix for the route. Prefixes will be concated
		 * This method is mainly exposed for the [[RouteGroup]]
		 */
		prefix(prefix: string): this

		/**
		 * Define a custom domain for the route. Again we do not overwrite the domain
		 * unless `overwrite` flag is set to true.
		 *
		 * This is again done to make route.domain win over route.group.domain
		 */
		domain(domain: string): this

		/**
		 * Define an array of middleware to be executed on the route. If `prepend`
		 * is true, then middleware will be added to start of the existing
		 * middleware. The option is exposed for [[RouteGroup]]
		 */
		middleware(middleware: MiddlewareHandler | MiddlewareHandler[], prepend?: boolean): this

		/**
		 * Give memorizable name to the route. This is helpful, when you
		 * want to lookup route defination by it's name.
		 *
		 * If `prepend` is true, then it will keep on prepending to the existing
		 * name. This option is exposed for [[RouteGroup]]
		 */
		as(name: string, prepend?: boolean): this

		/**
		 * Define controller namespace for a given route
		 */
		namespace(namespace: string): this

		/**
		 * Returns [[RouteDefinition]] that can be passed to the [[Store]] for
		 * registering the route
		 */
		toJSON(): RouteJSON
	}

	export type ResourceRouteNames =
		| 'create'
		| 'index'
		| 'store'
		| 'show'
		| 'edit'
		| 'update'
		| 'destroy'

	/**
	 * Shape of route resource class
	 */
	export interface RouteResourceContract {
		/**
		 * A copy of routes that belongs to this resource
		 */
		routes: RouteContract[]

		/**
		 * Register only given routes and remove others
		 */
		only(names: ResourceRouteNames[]): this

		/**
		 * Register all routes, except the one's defined
		 */
		except(names: ResourceRouteNames[]): this

		/**
		 * Register api only routes. The `create` and `edit` routes, which
		 * are meant to show forms will not be registered
		 */
		apiOnly(): this

		/**
		 * Add middleware to routes inside the resource
		 */
		middleware(
			middleware: {
				[P in ResourceRouteNames]?: MiddlewareHandler | MiddlewareHandler[]
			} & {
				'*'?: MiddlewareHandler | MiddlewareHandler[]
			}
		): this

		/**
		 * Define matcher for params inside the resource
		 */
		where(key: string, matcher: string | RegExp): this

		/**
		 * Define namespace for all the routes inside a given resource
		 */
		namespace(namespace: string): this

		/**
		 * Prepend name to the routes names
		 */
		as(name: string): this
	}

	/**
	 * Shape of route group class
	 */
	export interface RouteGroupContract {
		routes: (RouteContract | RouteResourceContract | BriskRouteContract | RouteGroupContract)[]

		/**
		 * Define Regex matchers for a given param for all the routes.
		 *
		 * @example
		 * ```ts
		 * Route.group(() => {
		 * }).where('id', /^[0-9]+/)
		 * ```
		 */
		where(param: string, matcher: RegExp | string): this

		/**
		 * Define prefix all the routes in the group.
		 *
		 * @example
		 * ```ts
		 * Route.group(() => {
		 * }).prefix('v1')
		 * ```
		 */
		prefix(prefix: string): this

		/**
		 * Define domain for all the routes.
		 *
		 * @example
		 * ```ts
		 * Route.group(() => {
		 * }).domain(':name.adonisjs.com')
		 * ```
		 */
		domain(domain: string): this

		/**
		 * Prepend name to the routes name.
		 *
		 * @example
		 * ```ts
		 * Route.group(() => {
		 * }).as('version1')
		 * ```
		 */
		as(name: string): this

		/**
		 * Prepend an array of middleware to all routes middleware.
		 *
		 * @example
		 * ```ts
		 * Route.group(() => {
		 * }).middleware(['auth'])
		 * ```
		 */
		middleware(middleware: MiddlewareHandler | MiddlewareHandler[]): this

		/**
		 * Define namespace for all the routes inside the group.
		 *
		 * @example
		 * ```ts
		 * Route.group(() => {
		 * }).namespace('App/Admin/Controllers')
		 * ```
		 */
		namespace(namespace: string): this
	}

	/**
	 * Shape for brisk/quick routes
	 */
	export interface BriskRouteContract {
		/**
		 * Reference to route instance. Set after `setHandler` is called
		 */
		route: RouteContract | null

		/**
		 * Set handler for the brisk route. The `invokedBy` string is the reference
		 * to the method that calls this method. It is required to create human
		 * readable error message when `setHandler` is called for multiple
		 * times.
		 */
		setHandler(handler: any, invokedBy: string): RouteContract
	}

	/**
	 * Options accepted by makeUrl methods
	 */
	export type MakeUrlOptions = {
		qs?: any
		params?: any
		domainParams?: any
		prefixDomain?: boolean
	} & { [key: string]: any }

	/**
	 * Options for making a signed url
	 */
	export type MakeSignedUrlOptions = MakeUrlOptions & {
		expiresIn?: string | number
		purpose?: string
	}

	/**
	 * Shape of router exposed for creating routes
	 */
	export interface RouterContract {
		/**
		 * Exposing BriskRoute, RouteGroup and RouteResource constructors
		 * to be extended from outside
		 */
		BriskRoute: MacroableConstructorContract<BriskRouteContract>
		RouteGroup: MacroableConstructorContract<RouteGroupContract>
		RouteResource: MacroableConstructorContract<RouteResourceContract>
		Route: MacroableConstructorContract<RouteContract>

		/**
		 * Collection of routes, including route resource and route
		 * group. To get a flat list of routes, call `router.toJSON()`
		 */
		routes: (RouteContract | RouteResourceContract | RouteGroupContract | BriskRouteContract)[]

		/**
		 * Add route for a given pattern and methods
		 */
		route(pattern: string, methods: string[], handler: RouteHandler): RouteContract

		/**
		 * Define a route that handles all common HTTP methods
		 */
		any(pattern: string, handler: RouteHandler): RouteContract

		/**
		 * Define `GET` route
		 */
		get(pattern: string, handler: RouteHandler): RouteContract

		/**
		 * Define `POST` route
		 */
		post(pattern: string, handler: RouteHandler): RouteContract

		/**
		 * Define `PUT` route
		 */
		put(pattern: string, handler: RouteHandler): RouteContract

		/**
		 * Define `PATCH` route
		 */
		patch(pattern: string, handler: RouteHandler): RouteContract

		/**
		 * Define `DELETE` route
		 */
		delete(pattern: string, handler: RouteHandler): RouteContract

		/**
		 * Creates a group of routes. A route group can apply transforms
		 * to routes in bulk
		 */
		group(callback: () => void): RouteGroupContract

		/**
		 * Registers a route resource with conventional set of routes
		 */
		resource(resource: string, controller: string): RouteResourceContract

		/**
		 * Register a route resource with shallow nested routes.
		 */
		shallowResource(resource: string, controller: string): RouteResourceContract

		/**
		 * Returns a brisk route instance for a given URL pattern
		 */
		on(pattern: string): BriskRouteContract

		/**
		 * Define global route matcher
		 */
		where(key: string, matcher: string | RegExp): this

		/**
		 * Returns a flat list of routes JSON
		 */
		toJSON(): RouteLookupNode[]

		/**
		 * Commit routes to the store. After this, no more
		 * routes can be registered.
		 */
		commit(): void

		/**
		 * Find route for a given URL, method and optionally domain
		 */
		match(url: string, method: string, domain?: string): null | MatchedRoute

		/**
		 * Look route for a given `pattern`, `route handler` or `route name`. Later this
		 * info can be used to make url for a given route.
		 */
		lookup(routeIdentifier: string, domain?: string): null | RouteLookupNode

		/**
		 * Makes url to a registered route by looking it up with the route pattern,
		 * name or the controller.method
		 */
		makeUrl(routeIdentifier: string, options?: MakeUrlOptions, domain?: string): string | null

		/**
		 * Makes a signed url, which can be confirmed for it's integrity without
		 * relying on any sort of backend storage.
		 */
		makeSignedUrl(
			routeIdentifier: string,
			options?: MakeSignedUrlOptions,
			domain?: string
		): string | null

		/**
		 * Creates a route when writing tests and auto-commits it to the
		 * routes store. Do not use this method inside your routes file.
		 *
		 * The global matchers doesn't work for testing routes and hence you have
		 * define inline matchers (if required). Also testing routes should be
		 * created to test the route functionality, they should be created to
		 * test middleware or validators by hitting a route from outside in.
		 */
		forTesting(pattern?: string, methods?: string[], handler?: any): RouteContract
	}

	const Route: RouterContract
	export default Route
}
