export interface MatchedRoute {
  params: Record<string, string>;
}

export interface RoutePrefixMatch {
  params: Record<string, string>;
  /** Unmatched remainder of the pathname (e.g. `/settings`), or `""` if `pattern` consumed the whole path. */
  remaining: string;
}

/**
 * Like `matchRoute`, but `pattern` only has to match a *prefix* of
 * `pathname` — whatever's left over is returned as `remaining`, for matching
 * against child routes. This is what powers nested-route support in
 * `matchRouteTree` (see `route-tree.ts`); `matchRoute` itself is just a
 * prefix match that happens to leave nothing remaining.
 */
export function matchRoutePrefix(pattern: string, pathname: string): RoutePrefixMatch | null {
  const patternSegments = splitPath(pattern);
  const pathSegments = splitPath(pathname);
  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]!;

    if (patternSegment === "*") {
      params.wildcard = pathSegments.slice(i).join("/");
      return { params, remaining: "" };
    }

    const pathSegment = pathSegments[i];
    if (pathSegment === undefined) return null;

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (patternSegment !== pathSegment) return null;
  }

  const remainingSegments = pathSegments.slice(patternSegments.length);
  return { params, remaining: remainingSegments.length > 0 ? `/${remainingSegments.join("/")}` : "" };
}

/**
 * Matches `pathname` against a route `pattern` like `/users/:id` or
 * `/files/*`. Supports static segments, `:name` named params, and a single
 * trailing `*` wildcard (captured as `params.wildcard`).
 *
 * Deliberately simple string-segment matching, not a full regex/`URLPattern`
 * engine — `/users/:id`-style matching is all a client router actually
 * needs, and this keeps the package dependency-free (no `urlpattern-polyfill`
 * for browsers that lack native `URLPattern`).
 */
export function matchRoute(pattern: string, pathname: string): MatchedRoute | null {
  const prefixMatch = matchRoutePrefix(pattern, pathname);
  if (!prefixMatch || prefixMatch.remaining !== "") return null;
  return { params: prefixMatch.params };
}

function splitPath(path: string): string[] {
  return path.split("/").filter((segment) => segment.length > 0);
}
