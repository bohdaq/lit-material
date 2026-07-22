import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./simple-list-item-styles.js";

/**
 * One item within `lit-material-simple-list` — a real `<a href>`, or a
 * `<button>` for a JS-driven selection (no navigation). `current` is purely
 * presentational: unlike `lit-material-tabs`, this component doesn't
 * enforce single-selection across siblings — set/clear it yourself on
 * whichever items should be highlighted.
 *
 * @element lit-material-simple-list-item
 *
 * @slot - The item's label.
 *
 * @csspart item - The `<a>` or `<button>`.
 */
@customElement("lit-material-simple-list-item")
export class LitMaterialSimpleListItem extends LitElement {
  static override styles = styles;

  @property() href = "";
  @property({ type: Boolean, reflect: true }) current = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }
  }

  override render() {
    const ariaCurrent = this.current ? "true" : nothing;
    if (this.href && !this.disabled) {
      return html`<a class="item" part="item" href=${this.href} aria-current=${ariaCurrent}><slot></slot></a>`;
    }
    return html`
      <button class="item" part="item" type="button" ?disabled=${this.disabled} aria-current=${ariaCurrent}>
        <slot></slot>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-simple-list-item": LitMaterialSimpleListItem;
  }
}
