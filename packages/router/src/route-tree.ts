import { matchRoutePrefix } from "./match.js";
import type { RouteConfig, RouteContext } from "./route-controller.js";

export interface MatchedTree<T> {
  content: T;
  params: Record<string, string>;
  /** The matched routes, outermost first, each with the params captured up to its level. */
  chain: MatchedRouteEntry<T>[];
}

export interface MatchedRouteEntry<T> {
  route: RouteConfig<T>;
  params: Record<string, string>;
  /** What this route's `loader` returned, once it has run. */
  data?: unknown;
}

/**
 * Finds the chain of routes (outermost first) that matches `pathname`, without rendering anything.
 *
 * Matching rules per level:
 * - If this route's own `path` doesn't even prefix-match, try the next sibling.
 * - If it prefix-matches and consumes the *whole* remaining path, try matching `children` against `""`
 *   first (an "index" child, `path: ""`); if none match, this route ends the chain.
 * - If it prefix-matches but path remains, a child **must** match the remainder, or this route's entire
 *   branch doesn't match — try the next sibling instead (a parent route never renders with leftover,
 *   unaccounted-for path segments).
 */
export function matchRouteChain<T>(
  routes: RouteConfig<T>[],
  pathname: string,
  parentParams: Record<string, string> = {},
): MatchedRouteEntry<T>[] | null {
  for (const route of routes) {
    const prefixMatch = matchRoutePrefix(route.path, pathname);
    if (!prefixMatch) continue;

    const params = { ...parentParams, ...prefixMatch.params };
    const entry = { route, params };
    const children = route.children ?? [];

    if (prefixMatch.remaining === "") {
      const index = children.length > 0 ? matchRouteChain(children, "", params) : null;
      return index ? [entry, ...index] : [entry];
    }

    if (children.length === 0) continue;
    const childChain = matchRouteChain(children, prefixMatch.remaining, params);
    if (childChain) return [entry, ...childChain];
  }
  return null;
}

/**
 * Renders a matched chain: each level's `render(params, outlet, context)` gets an `outlet()` that returns the
 * next level's content (`null` at the innermost level). A route without `render` (a pure redirect or guard
 * layer) passes its child's content straight through.
 */
export function renderRouteChain<T>(chain: MatchedRouteEntry<T>[], context: RouteContext): T | null {
  // A route whose loader hasn't produced data yet isn't rendered at all, rather than rendered without it.
  if (!hasData(chain)) return null;
  const renderFrom = (i: number): T | null => {
    const entry = chain[i];
    if (!entry) return null;
    const outlet = () => renderFrom(i + 1);
    const ctx = { ...context, params: entry.params, data: entry.data };
    return entry.route.render ? entry.route.render(entry.params, outlet, ctx) : outlet();
  };
  return renderFrom(0);
}

/**
 * Recursively matches `pathname` against a (possibly nested) route tree and renders it — `matchRouteChain`
 * followed by `renderRouteChain`. What `RouteController` calls on every navigation.
 */
export function matchRouteTree<T>(
  routes: RouteConfig<T>[],
  pathname: string,
  parentParams: Record<string, string> = {},
  query: URLSearchParams = new URLSearchParams(),
): MatchedTree<T> | null {
  const chain = matchRouteChain(routes, pathname, parentParams);
  if (!chain) return null;
  const params = chain[chain.length - 1]!.params;
  const content = renderRouteChain(chain, { path: pathname, params, query });
  return { content: content as T, params, chain };
}

/** `true` when every route in the chain that has a `loader` has its data. */
export function hasData<T>(chain: MatchedRouteEntry<T>[]): boolean {
  return chain.every((entry) => !entry.route.loader || "data" in entry);
}

/** The chain with each entry's loader data attached (`data[i]` for entry `i`). */
export function withData<T>(chain: MatchedRouteEntry<T>[], data: readonly unknown[]): MatchedRouteEntry<T>[] {
  return chain.map((entry, i) => (entry.route.loader ? { ...entry, data: data[i] } : entry));
}
