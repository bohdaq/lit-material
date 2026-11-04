import { historyUrl } from "./base-path.js";

export const ROUTE_CHANGE_EVENT = "lit-material-route-change";

export interface NavigateOptions {
  /** Replace the current history entry instead of pushing a new one. */
  replace?: boolean;
}

/** `detail` of `ROUTE_CHANGE_EVENT`: whether the entry was pushed or replaced. */
export interface RouteChangeDetail {
  replace: boolean;
}

let keyCounter = 0;

/**
 * A fresh history-state object carrying a key the outlet saves scroll positions under. Keeps whatever else
 * an app put in `history.state`, if that's a plain object.
 */
export function stateWithKey(state: unknown = null): Record<string, unknown> {
  const base = state !== null && typeof state === "object" ? (state as Record<string, unknown>) : {};
  return { ...base, litMaterialRouterKey: `${Date.now().toString(36)}-${(keyCounter++).toString(36)}` };
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
 * writing to `history` (or, in hash mode, writes it after the `#`).
 */
export function navigate(path: string, options: NavigateOptions = {}): void {
  const fullPath = historyUrl(path);
  const replace = options.replace === true;
  if (replace) {
    history.replaceState(stateWithKey(), "", fullPath);
  } else {
    history.pushState(stateWithKey(), "", fullPath);
  }
  window.dispatchEvent(new CustomEvent<RouteChangeDetail>(ROUTE_CHANGE_EVENT, { detail: { replace } }));
}
