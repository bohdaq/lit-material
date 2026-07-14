export interface MatchedRoute {
  params: Record<string, string>;
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
  const patternSegments = splitPath(pattern);
  const pathSegments = splitPath(pathname);
  const params: Record<string, string> = {};

  for (let i = 0; i < patternSegments.length; i++) {
    const patternSegment = patternSegments[i]!;

    if (patternSegment === "*") {
      params.wildcard = pathSegments.slice(i).join("/");
      return { params };
    }

    const pathSegment = pathSegments[i];
    if (pathSegment === undefined) return null;

    if (patternSegment.startsWith(":")) {
      params[patternSegment.slice(1)] = decodeURIComponent(pathSegment);
      continue;
    }

    if (patternSegment !== pathSegment) return null;
  }

  if (pathSegments.length !== patternSegments.length) return null;
  return { params };
}

function splitPath(path: string): string[] {
  return path.split("/").filter((segment) => segment.length > 0);
}
