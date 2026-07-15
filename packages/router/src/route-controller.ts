import type { ReactiveController, ReactiveControllerHost } from "lit";
import { matchRouteTree } from "./route-tree.js";
import { ROUTE_CHANGE_EVENT } from "./navigate.js";

export interface RouteConfig<T> {
  path: string;
  /**
   * `outlet()` returns the matched child route's content (from `children`),
   * or `null` if this route has no children, or none matched — call it
   * wherever the nested content should appear in this route's own template.
   * Existing zero/one-argument `render` functions still work unchanged;
   * `outlet` only matters for routes that declare `children`.
   */
  render: (params: Record<string, string>, outlet: () => T | null) => T;
  /** Nested routes, matched against whatever's left of the path after this route's own `path` is consumed. */
  children?: RouteConfig<T>[];
}

export interface CurrentRoute<T> {
  path: string;
  params: Record<string, string>;
  content: T | null;
}

/**
 * Reads the currently matched route without owning an outlet — for
 * components that need to react to navigation (e.g. highlighting the active
 * item in a NavigationRail) but don't render the routed content themselves.
 * `LitMaterialRouterOutlet` uses this same controller internally.
 *
 * `getRoutes` is a function, not a static array, so it always reads the
 * host's current route config (e.g. a reactive `routes` property) rather
 * than a snapshot taken at construction time.
 */
export class RouteController<T = unknown> implements ReactiveController {
  private readonly host: ReactiveControllerHost;
  private readonly getRoutes: () => RouteConfig<T>[];
  current: CurrentRoute<T>;

  constructor(host: ReactiveControllerHost, getRoutes: () => RouteConfig<T>[]) {
    this.host = host;
    this.getRoutes = getRoutes;
    this.current = this.match();
    host.addController(this);
  }

  hostConnected(): void {
    this.current = this.match();
    window.addEventListener("popstate", this.handleChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, this.handleChange);
  }

  hostDisconnected(): void {
    window.removeEventListener("popstate", this.handleChange);
    window.removeEventListener(ROUTE_CHANGE_EVENT, this.handleChange);
  }

  private match(): CurrentRoute<T> {
    const path = window.location.pathname;
    const matched = matchRouteTree(this.getRoutes(), path);
    if (matched) {
      return { path, params: matched.params, content: matched.content };
    }
    return { path, params: {}, content: null };
  }

  private readonly handleChange = (): void => {
    this.current = this.match();
    this.host.requestUpdate();
  };
}
