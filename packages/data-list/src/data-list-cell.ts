import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./data-list-cell-styles.js";

/**
 * One cell within a `lit-material-data-list-item` row — a flex item.
 * `fill` grows to take up remaining row width (typically the row's main
 * content cell); cells without it size to their own content (typically an
 * icon or an actions cell).
 *
 * @element lit-material-data-list-cell
 *
 * @slot - The cell's content.
 */
@customElement("lit-material-data-list-cell")
export class LitMaterialDataListCell extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) fill = false;

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-list-cell": LitMaterialDataListCell;
  }
}
