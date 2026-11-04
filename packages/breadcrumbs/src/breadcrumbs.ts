import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { styles } from "./breadcrumbs-styles.js";

/**
 * Groups `lit-material-breadcrumb-item` elements into a `<nav>` wrapping an
 * `<ol>` — an ordered list, since a breadcrumb trail genuinely is a sequence.
 * `<ol>` has an implicit ARIA `list` role on its own; nothing extra to set
 * there. Each item sets its own `role="listitem"` (see that component), and
 * draws its own trailing separator, so this container needs no JS logic
 * beyond rendering the wrapper.
 *
 * @element lit-material-breadcrumbs
 *
 * @slot - `lit-material-breadcrumb-item` elements, in order from the root down to the current page.
 *
 * @csspart nav - The `<nav>` landmark.
 * @csspart list - The `<ol>`.
 */
@customElement("lit-material-breadcrumbs")
export class LitMaterialBreadcrumbs extends LitElement {
  static override styles = styles;

  /** The `<nav>` landmark's accessible name. Default: "Breadcrumb", translated. */
  @property() label?: string;

  private readonly localize = new LocalizeController(this);

  override render() {
    return html`
      <nav class="breadcrumbs" part="nav" aria-label=${this.label ?? this.localize.term("breadcrumbs.label", "Breadcrumb")}>
        <ol class="list" part="list">
          <slot></slot>
        </ol>
      </nav>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-breadcrumbs": LitMaterialBreadcrumbs;
  }
}
