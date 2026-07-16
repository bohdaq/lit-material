import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { RouteController, type RouteConfig } from "./route-controller.js";
import { navigate } from "./navigate.js";
import { stripBasePath } from "./base-path.js";
import { styles } from "./router-outlet-styles.js";

/**
 * Matches `location.pathname` against `.routes` and renders the matched
 * route's content in place of itself (`display: contents`, so it doesn't add
 * a layout box). Also intercepts same-origin `<a>` clicks anywhere in the
 * document — including inside other components' shadow roots, via
 * `event.composedPath()` — so ordinary links become SPA navigations without
 * every link needing to call `navigate()` itself.
 *
 * Client-side only: routing depends on `window.history`/`location`, so this
 * element (unlike every other lit-material component) isn't SSR-safe to
 * construct — don't import it from an SSR entry point.
 */
@customElement("lit-material-router-outlet")
export class LitMaterialRouterOutlet extends LitElement {
  static override styles = [styles];

  @property({ attribute: false })
  routes: RouteConfig<unknown>[] = [];

  private readonly route = new RouteController(this, () => this.routes);

  override connectedCallback(): void {
    super.connectedCallback();
    document.addEventListener("click", this.handleClick);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener("click", this.handleClick);
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
