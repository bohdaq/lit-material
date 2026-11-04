import { LitElement, isServer, type PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { RouteController, type CurrentRoute, type NavigationType, type RouteConfig } from "./route-controller.js";
import { navigate, stateWithKey } from "./navigate.js";
import { stripBasePath } from "./base-path.js";
import { styles } from "./router-outlet-styles.js";

const STORAGE_KEY = "lit-material-router-scroll";

/**
 * Matches `location.pathname` against `.routes` and renders the matched
 * route's content in place of itself (`display: contents`, so it doesn't add
 * a layout box). Also intercepts same-origin `<a>` clicks anywhere in the
 * document — including inside other components' shadow roots, via
 * `event.composedPath()` — so ordinary links become SPA navigations without
 * every link needing to call `navigate()` itself.
 *
 * Before showing a route it follows its `redirect`, runs its `guard`s and
 * waits for its lazy `load()` (the previous page stays up meanwhile, with the
 * `pending` attribute set). Once shown, it sets `document.title` from the
 * route's `title` and scrolls: to the top (or the `#hash` target) on a new
 * navigation, back to where the reader was on back/forward.
 *
 * On the server there's no `location`: it renders the route for its `path`
 * attribute, or nothing without one. See `resolveRoute()` for prerendering.
 *
 * @fires lit-material-route-error - A guard or `load()` threw; `detail.error` has the error. The previous page stays.
 */
@customElement("lit-material-router-outlet")
export class LitMaterialRouterOutlet extends LitElement {
  static override styles = [styles];

  @property({ attribute: false })
  routes: RouteConfig<unknown>[] = [];

  /** The path (with optional `?query`) to render where there's no `location`: server rendering and prerendering. Ignored in the browser. */
  @property()
  path?: string;

  /**
   * Loader data for `path` on the server: `resolveRoute()`'s `data`. Without it, routes with a `loader`
   * render nothing on the server. Ignored in the browser, which reads the data `routeDataScript()` embedded.
   */
  @property({ attribute: false })
  data?: unknown[];

  /** Wraps each route's `title` before it goes in `document.title`: `%s` stands for the route's title, e.g. `"%s · Admin"`. */
  @property({ attribute: "title-template" })
  titleTemplate = "%s";

  /** `"restore"` (default): top of the page on new navigations, the saved position on back/forward. `"none"` leaves scrolling alone. */
  @property({ attribute: "scroll-restoration" })
  scrollRestoration: "restore" | "none" = "restore";

  /** Set while a guard or lazy route is still resolving; the previous page is still showing. */
  @property({ type: Boolean, reflect: true })
  pending = false;

  private readonly route = new RouteController(this, () => this.routes, {
    resolve: true,
    serverPath: () => this.path,
    serverData: () => this.data,
    onCommit: (current, navigation) => void this.afterCommit(current, navigation),
    onError: (error) =>
      this.dispatchEvent(new CustomEvent("lit-material-route-error", { detail: { error }, bubbles: true, composed: true })),
  });

  private defaultTitle = "";
  private titled = false;
  private scrollPositions: Record<string, number> = {};
  private scrollFrame = 0;

  /** The route showing now: path, params, query, title. */
  get current(): CurrentRoute<unknown> {
    return this.route.current;
  }

  override connectedCallback(): void {
    this.defaultTitle = document.title;
    if (this.scrollRestoration === "restore") {
      history.scrollRestoration = "manual";
      try {
        this.scrollPositions = JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? "{}") as Record<string, number>;
      } catch {
        this.scrollPositions = {};
      }
      if (this.historyKey() === undefined) history.replaceState(stateWithKey(history.state), "");
      window.addEventListener("scroll", this.handleScroll, { passive: true });
    }
    super.connectedCallback();
    document.addEventListener("click", this.handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleClick);
    window.removeEventListener("scroll", this.handleScroll);
    cancelAnimationFrame(this.scrollFrame);
    if (this.scrollRestoration === "restore") history.scrollRestoration = "auto";
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    this.pending = this.route.pending;
    // On the server nothing connects, so match here, once `path` and `routes` are set.
    if (isServer || (this.hasUpdated && changed.has("routes"))) this.route.refresh();
  }

  private historyKey(): string | undefined {
    const state = history.state as { litMaterialRouterKey?: unknown } | null;
    return typeof state?.litMaterialRouterKey === "string" ? state.litMaterialRouterKey : undefined;
  }

  private readonly handleScroll = (): void => {
    cancelAnimationFrame(this.scrollFrame);
    this.scrollFrame = requestAnimationFrame(() => {
      const key = this.historyKey();
      if (key === undefined) return;
      this.scrollPositions[key] = window.scrollY;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(this.scrollPositions));
      } catch {
        // Storage full or blocked: positions still work for this page's lifetime.
      }
    });
  };

  private async afterCommit(current: CurrentRoute<unknown>, navigation: NavigationType): Promise<void> {
    if (isServer) return;
    // Apps that never use `title` keep managing document.title themselves; only undo a title set here.
    if (current.title !== undefined) {
      document.title = this.titleTemplate.replace("%s", current.title);
      this.titled = true;
    } else if (this.titled) {
      document.title = this.defaultTitle;
      this.titled = false;
    }

    if (this.scrollRestoration !== "restore" || navigation === "refresh") return;
    // Read the saved position now: the new page rendering can clamp the scroll and overwrite it.
    const key = this.historyKey();
    const saved = key === undefined ? undefined : this.scrollPositions[key];
    // Let the new page render (and its own children, a frame later) before scrolling within it.
    await this.updateComplete;
    await new Promise((resolve) => requestAnimationFrame(resolve));
    if (current !== this.route.current) return;

    if (navigation === "pop") {
      window.scrollTo(0, saved ?? 0);
      return;
    }
    if (navigation === "initial" && saved !== undefined) {
      window.scrollTo(0, saved);
      return;
    }
    const id = decodeURIComponent(location.hash.slice(1));
    const target = id ? (document.getElementById(id) ?? this.renderRoot.querySelector(`[id="${CSS.escape(id)}"]`)) : null;
    if (target) target.scrollIntoView();
    else if (navigation !== "initial") window.scrollTo(0, 0);
  }

  private readonly handleClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const anchor = event.composedPath().find((el): el is HTMLAnchorElement => el instanceof HTMLAnchorElement);
    if (!anchor || !anchor.href) return;
    if (anchor.target !== "" && anchor.target !== "_self") return;
    if (anchor.hasAttribute("download")) return;

    const url = new URL(anchor.href, window.location.href);
    if (url.origin !== window.location.origin) return;

    event.preventDefault();
    // `navigate()` always takes a base-free path (see `setBasePath()`) and adds the configured base back
    // itself — strip it from this real, resolved anchor pathname first so it isn't applied twice.
    navigate(stripBasePath(url.pathname) + url.search + url.hash);
  };

  override render() {
    return this.route.current.content;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-router-outlet": LitMaterialRouterOutlet;
  }
}
