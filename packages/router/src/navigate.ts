import { getBasePath } from "./base-path.js";

export const ROUTE_CHANGE_EVENT = "lit-material-route-change";

export interface NavigateOptions {
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean;
}

/**
 * Pushes (or replaces) a history entry and notifies any mounted
 * `<lit-material-router-outlet>`/`RouteController` instances to re-match,
 * without a full page reload. Use for programmatic navigation (e.g. after a
 * form submit or a redirect) — plain same-origin `<a href>` clicks are
 * already intercepted by the outlet and don't need this.
 *
 * `path` is always relative to the app's own root, regardless of
 * `setBasePath()` — this prepends the configured base path itself before
 * writing to `history`.
 */
export function navigate(path: string, options: NavigateOptions = {}): void {
  const fullPath = getBasePath() + path;
  if (options.replace) {
    history.replaceState(null, "", fullPath);
  } else {
    history.pushState(null, "", fullPath);
  }
  window.dispatchEvent(new CustomEvent(ROUTE_CHANGE_EVENT));
}
