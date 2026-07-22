import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./breadcrumb-item-styles.js";

/**
 * A single crumb within `lit-material-breadcrumbs` — a real `<a>` link, or
 * plain text for the current page. Renders its own trailing separator via
 * `:host(:not(:last-of-type))::after`, so the parent needs no JS
 * coordination to know which crumb is last; override
 * `--lit-material-breadcrumb-separator` to use something other than "/".
 *
 * A real link needs no custom keyboard handling — Tab/Enter already work
 * natively — so unlike most components here, this one has no interactive
 * logic of its own at all.
 *
 * @element lit-material-breadcrumb-item
 *
 * @slot - The crumb's label.
 *
 * @csspart crumb - The link or current-page text.
 */
@customElement("lit-material-breadcrumb-item")
export class LitMaterialBreadcrumbItem extends LitElement {
  static override styles = styles;

  @property() href = "";
  /** Marks this as the current page: always renders as plain text (even if `href` is set) with `aria-current="page"`. */
  @property({ type: Boolean, reflect: true }) current = false;

  // Not the constructor: a custom element constructor must not gain
  // attributes per the spec's conformance requirements, and this also needs
  // to be visible in SSR output — willUpdate runs in the same synchronous
  // pass as SSR's render, connectedCallback doesn't reliably fire there.
  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }
  }

  override render() {
    if (!this.current && this.href) {
      return html`<a class="crumb" part="crumb" href=${this.href}><slot></slot></a>`;
    }
    return html`<span class="crumb" part="crumb" aria-current=${this.current ? "page" : nothing}><slot></slot></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-breadcrumb-item": LitMaterialBreadcrumbItem;
  }
}
