/*
 * @adonisjs/http-server
 *
 * (c) AdonisJS
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

import type { MatchItRouteToken } from '../types/route.ts'
import { stripRouteSeparators, type ParsedRouteToken } from './route_parser.ts'

type IndexedRoute<T> = {
  additionalMatcherChecks?: { index: number; matcher: RegExp }[]
  isStructurallyMatched?: boolean
  matcher?: RegExp
  matcherSegmentIndex?: number
  order: number
  tokens: MatchItRouteToken[]
  value: T
}

type RouteNode<T> = {
  literals?: Map<string, RouteNode<T>>
  minimumOrder: number
  optionals?: Map<string, RouteNode<T>>
  parameters?: Map<string, RouteNode<T>>
  terminals?: IndexedRoute<T>[]
  wildcards?: IndexedRoute<T>[]
}

function createNode<T>(): RouteNode<T> {
  return {
    minimumOrder: Number.POSITIVE_INFINITY,
  }
}

function splitRoutePath(pathname: string): string[] {
  pathname = stripRouteSeparators(pathname)
  return pathname === '/' ? ['/'] : pathname.split('/')
}

function getStaticRouteKey(tokens: MatchItRouteToken[]): string | null {
  if (!tokens.length || tokens.some((token) => token.type !== 0)) {
    return null
  }

  return tokens.length === 1 && tokens[0].val === '/'
    ? 'root'
    : `segments:${tokens.map((token) => token.val).join('/')}`
}

function getStaticRequestKey(pathname: string): string {
  pathname = stripRouteSeparators(pathname)
  return pathname === '/' ? 'root' : `segments:${pathname}`
}

function getOrCreateChild<T>(children: Map<string, RouteNode<T>>, key: string): RouteNode<T> {
  let child = children.get(key)
  if (!child) {
    child = createNode<T>()
    children.set(key, child)
  }
  return child
}

function matchesRoute(tokens: MatchItRouteToken[], segments: string[]): boolean {
  if (
    tokens.length !== segments.length &&
    !(tokens.length < segments.length && tokens[tokens.length - 1].type === 2) &&
    !(tokens.length > segments.length && tokens[tokens.length - 1].type === 3)
  ) {
    return false
  }

  let index = 0
  while (index < tokens.length) {
    const rawToken = tokens[index]
    const token = rawToken as ParsedRouteToken
    const segment = segments[index]

    if (token.val === segment && token.type === 0) {
      index++
      continue
    }
    if (segment === '/') {
      if (token.type > 1) {
        index++
        continue
      }
      return false
    }
    if (token.type === 0) {
      return false
    }
    if (segment === '') {
      if (token.end === '' && (token.matcher ? token.matcher.test(segment) : true)) {
        index++
        continue
      }
      return false
    }
    if (!segment) {
      if (token.end === '') {
        index++
        continue
      }
      return false
    }
    if (segment.endsWith(token.end) && (token.matcher ? token.matcher.test(segment) : true)) {
      index++
      continue
    }
    return false
  }

  return true
}

function matchesIndexedRoute<T>(route: IndexedRoute<T>, segments: string[]): boolean {
  if (!route.isStructurallyMatched) {
    return matchesRoute(route.tokens, segments)
  }

  const matcher = route.matcher
  if (matcher) {
    const segment = segments[route.matcherSegmentIndex!]
    if (segment !== undefined && segment !== '/' && !matcher.test(segment)) {
      return false
    }
  }

  for (const { index, matcher: additionalMatcher } of route.additionalMatcherChecks ?? []) {
    const segment = segments[index]
    if (segment !== undefined && segment !== '/' && !additionalMatcher.test(segment)) {
      return false
    }
  }
  return true
}

export function extractRouteParams(
  tokens: MatchItRouteToken[],
  pathname: string,
  shouldDecodeParams: boolean
) {
  const segments = splitRoutePath(pathname)
  const params: Record<string, any> = {}
  let index = 0
  while (index < tokens.length) {
    const token = tokens[index]
    const segment = segments[index]

    if (segment === '/') {
      index++
      continue
    }

    if (token.val === '*') {
      params[token.val] = segments.slice(index).map((value) => {
        if (!shouldDecodeParams) {
          return value
        }
        try {
          return decodeURIComponent(value)
        } catch {
          return value
        }
      })
      break
    }

    if (segment === undefined || token.type === 0) {
      index++
      continue
    }

    let value = segment.replace(token.end, '')
    if (shouldDecodeParams) {
      try {
        value = decodeURIComponent(value)
      } catch {}
    }
    params[token.val] = token.cast ? token.cast(value) : value
    index++
  }
  return params
}

/**
 * Matches a transient list of tokenized routes without building an index.
 */
export function matchRouteTokens(
  pathname: string,
  routes: MatchItRouteToken[][],
  shouldDecodeParams: boolean
): Record<string, any> | null {
  const segments = splitRoutePath(pathname)
  for (const tokens of routes) {
    if (matchesRoute(tokens, segments)) {
      return extractRouteParams(tokens, pathname, shouldDecodeParams)
    }
  }
  return null
}

/**
 * Registration-ordered route matcher. The structural index only discards
 * impossible routes; the lowest registration order always selects the winner.
 */
export class RouteTable<T> {
  #nextOrder = 0
  #root = createNode<T>()
  #staticRoutes = new Map<string, IndexedRoute<T>>()
  #unindexedRoutes: IndexedRoute<T>[] = []

  add(tokens: MatchItRouteToken[], value: T): this {
    const indexedRoute: IndexedRoute<T> = { order: this.#nextOrder++, tokens, value }
    const staticKey = getStaticRouteKey(tokens)

    if (staticKey !== null) {
      if (!this.#staticRoutes.has(staticKey)) {
        this.#staticRoutes.set(staticKey, indexedRoute)
      }
      return this
    }

    const hasStatefulMatcher = tokens.some((rawToken, index) => {
      const matcher = (rawToken as ParsedRouteToken).matcher
      const isStateful =
        matcher &&
        (matcher.global ||
          matcher.sticky ||
          matcher.exec !== RegExp.prototype.exec ||
          matcher.test !== RegExp.prototype.test)
      if (isStateful) {
        return true
      }
      if (matcher) {
        if (!indexedRoute.matcher) {
          indexedRoute.matcher = matcher
          indexedRoute.matcherSegmentIndex = index
        } else {
          indexedRoute.additionalMatcherChecks ||= []
          indexedRoute.additionalMatcherChecks.push({ index, matcher })
        }
      }
      return false
    })
    if (!tokens.length || hasStatefulMatcher) {
      this.#unindexedRoutes.push(indexedRoute)
      return this
    }

    let node = this.#root
    node.minimumOrder = Math.min(node.minimumOrder, indexedRoute.order)
    for (const token of tokens) {
      if (token.type === 0) {
        node.literals ||= new Map()
        node = getOrCreateChild(node.literals, token.val)
      } else if (token.type === 1) {
        node.parameters ||= new Map()
        node = getOrCreateChild(node.parameters, token.end)
      } else if (token.type === 3) {
        node.optionals ||= new Map()
        node = getOrCreateChild(node.optionals, token.end)
      } else {
        node.wildcards ||= []
        node.wildcards.push(indexedRoute)
        return this
      }
      node.minimumOrder = Math.min(node.minimumOrder, indexedRoute.order)
    }
    node.terminals ||= []
    indexedRoute.isStructurallyMatched = true
    node.terminals.push(indexedRoute)
    return this
  }

  match(
    pathname: string,
    shouldDecodeParams: boolean
  ): { params: Record<string, any>; value: T } | null {
    const staticRoute = this.#staticRoutes.get(getStaticRequestKey(pathname))
    const cutoff = staticRoute?.order ?? Number.POSITIVE_INFINITY
    const firstUnindexedRoute = this.#unindexedRoutes[0]
    if (
      staticRoute &&
      this.#root.minimumOrder >= cutoff &&
      (!firstUnindexedRoute || firstUnindexedRoute.order >= cutoff)
    ) {
      return { value: staticRoute.value, params: {} }
    }

    const segments = splitRoutePath(pathname)
    const candidateLists: IndexedRoute<T>[][] = []
    if (firstUnindexedRoute && firstUnindexedRoute.order < cutoff) {
      candidateLists.push(this.#unindexedRoutes)
    }
    this.#collectCandidates(this.#root, segments, 0, cutoff, candidateLists)

    if (candidateLists.length === 1) {
      const candidates = candidateLists[0]
      let candidateIndex = 0
      while (candidateIndex < candidates.length) {
        const candidate = candidates[candidateIndex++]
        if (candidate.order >= cutoff) {
          break
        }
        if (matchesIndexedRoute(candidate, segments)) {
          return {
            value: candidate.value,
            params: extractRouteParams(candidate.tokens, pathname, shouldDecodeParams),
          }
        }
      }

      return staticRoute ? { value: staticRoute.value, params: {} } : null
    }

    const positions = new Uint32Array(candidateLists.length)
    while (true) {
      let selectedList = -1
      let selectedRoute: IndexedRoute<T> | undefined
      for (const [listIndex, candidates] of candidateLists.entries()) {
        const candidate = candidates[positions[listIndex]]
        if (candidate && (!selectedRoute || candidate.order < selectedRoute.order)) {
          selectedList = listIndex
          selectedRoute = candidate
        }
      }

      if (!selectedRoute || selectedRoute.order >= cutoff) {
        break
      }
      positions[selectedList]++

      if (matchesIndexedRoute(selectedRoute, segments)) {
        return {
          value: selectedRoute.value,
          params: extractRouteParams(selectedRoute.tokens, pathname, shouldDecodeParams),
        }
      }
    }

    return staticRoute ? { value: staticRoute.value, params: {} } : null
  }

  #collectCandidates(
    node: RouteNode<T>,
    segments: string[],
    segmentIndex: number,
    cutoff: number,
    candidateLists: IndexedRoute<T>[][],
    canMatchTerminal: boolean = true
  ) {
    if (node.minimumOrder >= cutoff) {
      return
    }

    const wildcards = node.wildcards
    if (wildcards?.length && wildcards[0].order < cutoff) {
      candidateLists.push(wildcards)
    }

    if (segmentIndex === segments.length) {
      const terminals = node.terminals
      if (canMatchTerminal && terminals?.length && terminals[0].order < cutoff) {
        candidateLists.push(terminals)
      }
      for (const [suffix, optionalChild] of node.optionals ?? []) {
        if (suffix === '') {
          this.#collectCandidates(optionalChild, segments, segmentIndex, cutoff, candidateLists)
        }
      }
      for (const [suffix, parameterChild] of node.parameters ?? []) {
        if (suffix === '') {
          this.#collectCandidates(
            parameterChild,
            segments,
            segmentIndex,
            cutoff,
            candidateLists,
            false
          )
        }
      }
      return
    }

    const segment = segments[segmentIndex]
    const literalChild = node.literals?.get(segment)
    if (literalChild) {
      this.#collectCandidates(literalChild, segments, segmentIndex + 1, cutoff, candidateLists)
    }
    if (segment !== '/') {
      for (const [suffix, parameterChild] of node.parameters ?? []) {
        if (segment.endsWith(suffix)) {
          this.#collectCandidates(
            parameterChild,
            segments,
            segmentIndex + 1,
            cutoff,
            candidateLists
          )
        }
      }
    }
    for (const [suffix, optionalChild] of node.optionals ?? []) {
      if (segment === '/' || segment.endsWith(suffix)) {
        this.#collectCandidates(optionalChild, segments, segmentIndex + 1, cutoff, candidateLists)
      }
    }
  }
}
