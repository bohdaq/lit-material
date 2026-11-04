import { isServer, type ReactiveController, type ReactiveControllerHost } from "lit";
import { matchRouteChain, renderRouteChain, type MatchedRouteEntry } from "./route-tree.js";
import { navigate, ROUTE_CHANGE_EVENT, type RouteChangeDetail } from "./navigate.js";
import { stripBasePath } from "./base-path.js";
import { loadChain, runGuards, titleOf, type GuardResult, type Resolution } from "./resolve.js";

/** What a route's `render`, `guard`, `redirect` and `title` functions are given. */
export interface RouteContext {
  /** The matched path, base-path free (see `setBasePath()`). */
  path: string;
  /** Params captured up to this route's level of the tree. */
  params: Record<string, string>;
  /** The URL's query; read it typed with `parseQuery()`. */
  query: URLSearchParams;
}

export interface RouteConfig<T> {
  path: string;
  /**
   * `outlet()` returns the matched child route's content (from `children`),
   * or `null` if this route has no children, or none matched — call it
   * wherever the nested content should appear in this route's own template.
   * Existing zero/one-argument `render` functions still work unchanged;
   * `outlet` only matters for routes that declare `children`.
   *
   * Optional: a route without `render` (a guard or redirect layer around its children) renders its matched
   * child as-is.
   */
  render?: (params: Record<string, string>, outlet: () => T | null, context: RouteContext) => T;
  /** Nested routes, matched against whatever's left of the path after this route's own `path` is consumed. */
  children?: RouteConfig<T>[];
  /**
   * Send this path somewhere else (replacing the history entry). A string may use the matched `:params`
   * (`"/users/:id"`); a function gets the route context.
   */
  redirect?: string | ((context: RouteContext) => string);
  /**
   * Runs before the route (and anything nested in it) is shown, outermost first. Return `true` or nothing to
   * go ahead, `false` to cancel (the address bar goes back to the page still showing), or a path to redirect
   * to — e.g. `"/login"` when signed out. May be async.
   */
  guard?: (context: RouteContext) => GuardResult | Promise<GuardResult>;
  /**
   * Lazy-loads what this route renders, typically `() => import("./user-page.js")`. Called once, the first
   * time the route matches; the outlet keeps showing the previous page until it settles.
   */
  load?: () => Promise<unknown>;
  /** Page title while this route is showing; the innermost route with one wins. */
  title?: string | ((context: RouteContext) => string);
  /** HTTP status `resolveRoute()` reports for this route — `404` on a catch-all "not found" route. */
  status?: number;
}

export interface CurrentRoute<T> {
  /** `location.pathname` with the configured base path (see `setBasePath()`) stripped, if any. */
  path: string;
  params: Record<string, string>;
  /** `location.search` as `URLSearchParams`; see `parseQuery()` for typed values. */
  query: URLSearchParams;
  content: T | null;
  /** The matched routes' `title`, if one declares it. */
  title?: string;
}

/** How the current route was reached; the outlet uses it to decide where to scroll. */
export type NavigationType = "initial" | "push" | "replace" | "pop" | "refresh";

export interface RouteControllerOptions<T> {
  /**
   * Run `redirect`, `guard` and `load` before showing a route. Off by default, so a controller that only
   * reads the route (to highlight a nav item) doesn't run guards a second time; the outlet turns it on.
   */
  resolve?: boolean;
  /** The path (optionally with `?query`) to match where there's no `location`, i.e. server rendering. */
  serverPath?: () => string | undefined;
  /** Called after each new route is shown. */
  onCommit?: (current: CurrentRoute<T>, navigation: NavigationType) => void;
  /** Called when a guard or `load()` throws; the previous route stays. */
  onError?: (error: unknown) => void;
}

const MAX_REDIRECTS = 10;

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
  private readonly options: RouteControllerOptions<T>;
  current: CurrentRoute<T>;
  /** `true` while a guard or lazy `load()` is in flight; `current` still holds the previous route. */
  pending = false;
  private token = 0;
  private redirects = 0;
  private committedUrl: string | undefined;

  constructor(host: ReactiveControllerHost, getRoutes: () => RouteConfig<T>[], options: RouteControllerOptions<T> = {}) {
    this.host = host;
    this.getRoutes = getRoutes;
    this.options = options;
    const { path, query } = this.where();
    this.current = this.plainMatch(path, query);
    host.addController(this);
  }

  hostConnected(): void {
    window.addEventListener("popstate", this.handlePop);
    window.addEventListener(ROUTE_CHANGE_EVENT, this.handleChange);
    this.run("initial");
  }

  hostDisconnected(): void {
    this.token++; // drop any navigation still resolving
    window.removeEventListener("popstate", this.handlePop);
    window.removeEventListener(ROUTE_CHANGE_EVENT, this.handleChange);
  }

  /** Matches again, e.g. after the routes themselves changed. */
  refresh(): void {
    this.run("refresh");
  }

  private where(): { path: string; query: URLSearchParams } {
    if (!isServer) {
      return { path: stripBasePath(location.pathname), query: new URLSearchParams(location.search) };
    }
    // No location when rendering on the server: match the path the host was given, or nothing (an outlet
    // then renders empty there and the browser fills it in).
    const serverPath = this.options.serverPath?.();
    if (serverPath === undefined) return { path: "", query: new URLSearchParams() };
    const url = new URL(serverPath, "http://localhost");
    return { path: url.pathname, query: url.searchParams };
  }

  private plainMatch(path: string, query: URLSearchParams): CurrentRoute<T> {
    const chain = path === "" ? null : matchRouteChain(this.getRoutes(), path);
    return this.toCurrent(path, query, chain);
  }

  private toCurrent(path: string, query: URLSearchParams, chain: MatchedRouteEntry<T>[] | null): CurrentRoute<T> {
    if (!chain) return { path, params: {}, query, content: null };
    const params = chain[chain.length - 1]!.params;
    const ctx = { path, params, query };
    return { path, params, query, content: renderRouteChain(chain, ctx), title: titleOf(chain, ctx) };
  }

  private run(navigation: NavigationType): void {
    const token = ++this.token;
    const { path, query } = this.where();

    // Reading controllers, and server rendering (where `resolveRoute()` has already run guards and loads),
    // just match.
    if (!this.options.resolve || isServer) {
      this.commit(this.plainMatch(path, query), navigation);
      return;
    }

    const chain = path === "" ? null : matchRouteChain(this.getRoutes(), path);
    if (!chain) {
      this.commit(this.toCurrent(path, query, null), navigation);
      return;
    }

    const settle = (resolution: Resolution<T>): void => {
      if (token !== this.token) return;
      if (resolution.kind === "redirect") {
        if (++this.redirects > MAX_REDIRECTS) {
          this.fail(new Error(`@lit-material/router: more than ${MAX_REDIRECTS} redirects from ${path}`));
          return;
        }
        navigate(resolution.to, { replace: true });
        return;
      }
      if (resolution.kind !== "match") {
        // Cancelled: put the address bar back to the page still showing.
        this.redirects = 0;
        this.setPending(false);
        if (this.committedUrl !== undefined) history.replaceState(history.state, "", this.committedUrl);
        else this.commit(this.toCurrent(path, query, null), navigation);
        return;
      }
      const loading = loadChain(resolution.chain);
      const next = this.toCurrent(path, query, resolution.chain);
      if (!loading) {
        this.commit(next, navigation);
        return;
      }
      // First paint shows the route straight away (its elements upgrade once loaded), so server-rendered
      // markup hydrates as is; later navigations keep the old page up until the new one is ready.
      if (navigation === "initial") this.commit(next, navigation);
      else this.setPending(true);
      loading.then(
        () => {
          if (token === this.token && navigation !== "initial") this.commit(next, navigation);
        },
        (error: unknown) => {
          if (token === this.token) this.fail(error);
        },
      );
    };

    const guarded = runGuards(chain, { path, params: {}, query });
    if (guarded instanceof Promise) {
      this.setPending(true);
      guarded.then(settle, (error: unknown) => {
        if (token === this.token) this.fail(error);
      });
    } else {
      settle(guarded);
    }
  }

  private commit(current: CurrentRoute<T>, navigation: NavigationType): void {
    this.current = current;
    this.pending = false;
    this.redirects = 0;
    if (!isServer) this.committedUrl = location.pathname + location.search + location.hash;
    this.host.requestUpdate();
    this.options.onCommit?.(current, navigation);
  }

  private fail(error: unknown): void {
    this.redirects = 0;
    this.setPending(false);
    if (this.options.onError) this.options.onError(error);
    else console.error(error);
  }

  private setPending(pending: boolean): void {
    if (this.pending === pending) return;
    this.pending = pending;
    this.host.requestUpdate();
  }

  private readonly handlePop = (): void => {
    this.run("pop");
  };

  private readonly handleChange = (event: Event): void => {
    const detail = (event as CustomEvent<RouteChangeDetail | null>).detail;
    this.run(detail?.replace ? "replace" : "push");
  };
}
