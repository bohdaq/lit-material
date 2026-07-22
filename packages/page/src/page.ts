import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "./page-styles.js";

/**
 * The outermost app-shell grid: a header row spanning the full width, and a
 * sidebar/main-content row below it. A pure layout primitive — it renders
 * whatever's slotted into `header`/`sidebar` (typically
 * `lit-material-top-app-bar` and `lit-material-navigation-drawer` or
 * `-rail`) without knowing anything about their specific behavior, so it has
 * no opinion on responsive collapsing, drawer toggling, or the sidebar's
 * width — that's already each of those components' own responsibility, and
 * duplicating it here would just create two sources of truth. `main` and
 * `sidebar` scroll independently of each other and of the header, which
 * stays put across both — the usual app-shell scrolling behavior — with no
 * JS required.
 *
 * Sizing is left to the consumer, the same way `lit-material-top-app-bar`
 * leaves positioning to the consumer: give `lit-material-page` a height
 * (typically `height: 100vh` on it or an ancestor) for the scroll regions to
 * have something to scroll within.
 *
 * @element lit-material-page
 *
 * @slot header - The page header (masthead).
 * @slot sidebar - Primary navigation.
 * @slot - The main content.
 *
 * @csspart header - The header row's container.
 * @csspart sidebar - The sidebar column's container.
 * @csspart main - The main content column's container.
 */
@customElement("lit-material-page")
export class LitMaterialPage extends LitElement {
  static override styles = styles;

  override render() {
    return html`
      <div class="header" part="header"><slot name="header"></slot></div>
      <div class="sidebar" part="sidebar"><slot name="sidebar"></slot></div>
      <main class="main" part="main"><slot></slot></main>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-page": LitMaterialPage;
  }
}
