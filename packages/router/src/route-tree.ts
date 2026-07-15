import { matchRoutePrefix } from "./match.js";
import type { RouteConfig } from "./route-controller.js";

export interface MatchedTree<T> {
  content: T;
  params: Record<string, string>;
}

/**
 * Recursively matches `pathname` against a (possibly nested) route tree.
 * Each matched level's `render(params, outlet)` is composed into the next:
 * `outlet()` returns the matched child's content, or `null` if this route
 * has no `children`, or none of them matched.
 *
 * Matching rules per level:
 * - If this route's own `path` doesn't even prefix-match, try the next
 *   sibling.
 * - If it prefix-matches and consumes the *whole* remaining path, try
 *   matching `children` against `""` first (an "index" child, `path: ""`);
 *   if none match, render this route alone with an empty outlet.
 * - If it prefix-matches but path remains, a child **must** match the
 *   remainder, or this route's entire branch doesn't match — try the next
 *   sibling instead (a parent route never renders with leftover,
 *   unaccounted-for path segments).
 */
export function matchRouteTree<T>(
  routes: RouteConfig<T>[],
  pathname: string,
  parentParams: Record<string, string> = {},
): MatchedTree<T> | null {
  for (const route of routes) {
    const prefixMatch = matchRoutePrefix(route.path, pathname);
    if (!prefixMatch) continue;

    const params = { ...parentParams, ...prefixMatch.params };
    const children = route.children ?? [];

    if (prefixMatch.remaining === "") {
      const indexMatch = children.length > 0 ? matchRouteTree(children, "", params) : null;
      if (indexMatch) {
        return { content: route.render(params, () => indexMatch.content), params: indexMatch.params };
      }
      return { content: route.render(params, () => null), params };
    }

    if (children.length === 0) continue;
    const childMatch = matchRouteTree(children, prefixMatch.remaining, params);
    if (!childMatch) continue;
    return { content: route.render(params, () => childMatch.content), params: childMatch.params };
  }
  return null;
}
