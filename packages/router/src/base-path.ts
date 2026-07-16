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
