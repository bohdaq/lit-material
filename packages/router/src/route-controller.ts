import type { ReactiveController, ReactiveControllerHost } from "lit";
import { matchRoute } from "./match.js";
import { ROUTE_CHANGE_EVENT } from "./navigate.js";

export interface RouteConfig<T> {
  path: string;
  render: (params: Record<string, string>) => T;
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
    for (const route of this.getRoutes()) {
      const matched = matchRoute(route.path, path);
      if (matched) {
        return { path, params: matched.params, content: route.render(matched.params) };
      }
    }
    return { path, params: {}, content: null };
  }

  private readonly handleChange = (): void => {
    this.current = this.match();
    this.host.requestUpdate();
  };
}
