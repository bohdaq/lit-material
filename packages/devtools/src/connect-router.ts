import { getRegistry, pushBounded, type RouteChangeKind } from "./registry.js";

/**
 * The event `navigate()` in `@lit-material/router` dispatches on `window` (its `ROUTE_CHANGE_EVENT`), named
 * here rather than imported so recording navigations doesn't load the router.
 */
export const ROUTE_CHANGE_EVENT = "lit-material-route-change";

export interface ConnectRouterOptions {
  /** How many navigations to keep. Default 50. */
  maxAge?: number;
}

const noop = (): void => {};
let connections = 0;

function record(kind: RouteChangeKind): void {
  const registry = getRegistry();
  if (!registry) return;
  pushBounded(
    registry.router,
    { path: location.pathname, search: location.search, hash: location.hash, time: Date.now(), kind },
    registry.routerMaxAge,
  );
  registry.notify();
}

const handleRouteChange = (event: Event): void => {
  const detail = (event as CustomEvent<{ replace?: boolean } | null>).detail;
  record(detail?.replace ? "replace" : "push");
};

const handlePop = (): void => record("pop");

/**
 * Logs every router navigation — `navigate()` calls, link clicks the router outlet intercepts (both
 * `"push"`, or `"replace"` with `{ replace: true }` and redirects) and back/forward (`"pop"`) — for the
 * `<lit-material-devtools>` panel. Listens on `window`; doesn't import `@lit-material/router`. Calling it
 * again shares the same listeners; the returned function stops logging once every caller has called it.
 * Does nothing on the server.
 */
export function connectRouter(options: ConnectRouterOptions = {}): () => void {
  const registry = getRegistry();
  if (!registry) return noop;
  if (options.maxAge !== undefined) registry.routerMaxAge = Math.max(1, Math.floor(options.maxAge));

  if (connections++ === 0) {
    window.addEventListener(ROUTE_CHANGE_EVENT, handleRouteChange);
    window.addEventListener("popstate", handlePop);
  }
  let connected = true;
  return () => {
    if (!connected) return;
    connected = false;
    if (--connections === 0) {
      window.removeEventListener(ROUTE_CHANGE_EVENT, handleRouteChange);
      window.removeEventListener("popstate", handlePop);
    }
  };
}
