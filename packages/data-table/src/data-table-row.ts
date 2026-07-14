import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./data-table-row-styles.js";

/**
 * A row inside a `lit-material-data-table` — holds `lit-material-data-table-cell` children.
 *
 * Set `header` on a row made up of header cells (typically the first row);
 * it skips the hover/`selected` styling body rows get. `:host` uses
 * `display: table-row` for the same reason `lit-material-data-table-cell`
 * uses `display: table-cell` — native table column alignment without an
 * actual `<table>` element.
 *
 * @element lit-material-data-table-row
 *
 * @slot - `lit-material-data-table-cell` elements.
 */
@customElement("lit-material-data-table-row")
export class LitMaterialDataTableRow extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) header = false;
  /** Highlights the row — set by the table from a row-select checkbox's checked state, not directly. */
  @property({ type: Boolean, reflect: true }) selected = false;

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("header") || !this.hasAttribute("role")) {
      this.setAttribute("role", "row");
    }
  }

  override render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table-row": LitMaterialDataTableRow;
  }
}
