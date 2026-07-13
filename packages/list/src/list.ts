import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "./list-styles.js";

/**
 * Material Design 3 list — a surface container for `lit-material-list-item`
 * children.
 *
 * @element lit-material-list
 *
 * @slot - `lit-material-list-item` elements (or any other content).
 *
 * @csspart list - The outer container (background, vertical padding).
 */
@customElement("lit-material-list")
export class LitMaterialList extends LitElement {
  static override styles = styles;

  override render() {
    return html`
      <div class="list" part="list" role="list">
        <slot></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-list": LitMaterialList;
  }
}
