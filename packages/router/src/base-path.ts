let basePath = "";

/**
 * Configures a path prefix every route/`navigate()` call is considered relative to — for an app deployed
 * under a subpath (e.g. a GitHub Pages project site served at `/my-repo/`, not domain root) rather than
 * assuming it owns the whole origin. Call once at startup, before anything reads the current route (before
 * constructing the first `RouteController`/`<lit-material-router-outlet>`).
 *
 * Route configs and `navigate()` calls are written the same way regardless of deployment location — this is
 * the only place that needs to know the real deployed path prefix; `RouteController` strips it from
 * `location.pathname` before matching, and `navigate()` adds it back before calling `history.pushState()`.
 */
export function setBasePath(path: string): void {
  const trimmed = path.replace(/\/+$/, "");
  basePath = trimmed === "" || trimmed === "/" ? "" : trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

/** The path prefix configured via `setBasePath()` — `""` (no prefix) by default. */
export function getBasePath(): string {
  return basePath;
}

/** Strips the configured base path from a real `location.pathname`, for matching against base-free route configs. */
export function stripBasePath(pathname: string): string {
  if (basePath && pathname.startsWith(basePath)) {
    const stripped = pathname.slice(basePath.length);
    return stripped === "" ? "/" : stripped;
  }
  return pathname;
}

/** How the route is kept in the URL: in the path (`/users/42`) or after a `#` (`/#/users/42`). */
export type RouterMode = "history" | "hash";

let mode: RouterMode = "history";

/**
 * Keeps the route after a `#` (`/#/users/42`) instead of in the path. For apps served as static files with no
 * server fallback to `index.html`: a reload or a shared link of any route still loads the one page. Call once at
 * startup, before the first `RouteController`/`<lit-material-router-outlet>`. The base path doesn't apply in this
 * mode (the page's own path stays as it is), and a `#` can't also point at an element on the page.
 */
export function setRouterMode(value: RouterMode): void {
  mode = value;
}

/** The mode set with `setRouterMode()`: `"history"` by default. */
export function getRouterMode(): RouterMode {
  return mode;
}

/** The current route's path (base-path free) and query, read from the URL for the router mode. */
export function currentLocation(): { path: string; query: URLSearchParams } {
  if (mode === "hash") {
    const url = new URL(location.hash.slice(1) || "/", "http://localhost");
    return { path: url.pathname, query: url.searchParams };
  }
  return { path: stripBasePath(location.pathname), query: new URLSearchParams(location.search) };
}

/**
 * The `href` to write in an `<a>` for an app path: `"#/users/42"` in hash mode, the base path plus the path
 * otherwise. The outlet turns clicks on either into in-app navigations.
 */
export function routeHref(path: string): string {
  return mode === "hash" ? `#${path}` : basePath + path;
}

/** The URL `navigate()` writes into `history` for an app path. */
export function historyUrl(path: string): string {
  return mode === "hash" ? `${location.pathname}${location.search}#${path}` : basePath + path;
}
