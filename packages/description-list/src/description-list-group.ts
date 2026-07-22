import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "./description-list-group-styles.js";

/**
 * One term/description pair within `lit-material-description-list`. Sets
 * `role="listitem"` on itself (see that component for why this uses ARIA
 * roles instead of native `<dl>`/`<dt>`/`<dd>`), and renders `term`/
 * `definition` roles internally for the pair itself.
 *
 * `:host { display: contents }` gives this element no box of its own, so
 * the list's `horizontal` two-column grid applies directly to every
 * group's term/description elements as if they were the list's own
 * flattened children, the same technique `lit-material-panel` uses for its
 * optional header/footer bands.
 *
 * @element lit-material-description-list-group
 *
 * @slot term - The term (a label, a field name).
 * @slot - The description.
 *
 * @csspart term - The term's container.
 * @csspart description - The description's container.
 */
@customElement("lit-material-description-list-group")
export class LitMaterialDescriptionListGroup extends LitElement {
  static override styles = styles;

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "listitem");
    }
  }

  override render() {
    return html`
      <div class="term" part="term" role="term"><slot name="term"></slot></div>
      <div class="description" part="description" role="definition"><slot></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-description-list-group": LitMaterialDescriptionListGroup;
  }
}
