import { html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "./data-list-styles.js";

/**
 * Groups `lit-material-data-list-item` rows into a native `<ul>` — a list
 * of flexible, multi-cell rows, each independently sized via
 * `lit-material-data-list-cell`'s `fill`, optionally expandable. Distinct
 * from `lit-material-data-table`, whose rows all share the same fixed
 * columns: a data list's rows can each lay out their own cells differently,
 * and any individual row can expand to reveal extra content without
 * needing a whole extra table column for it.
 *
 * @element lit-material-data-list
 *
 * @slot - `lit-material-data-list-item` elements.
 *
 * @csspart list - The `<ul>`.
 */
@customElement("lit-material-data-list")
export class LitMaterialDataList extends LitElement {
  static override styles = styles;

  override render() {
    return html`<ul class="list" part="list"><slot></slot></ul>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-list": LitMaterialDataList;
  }
}
