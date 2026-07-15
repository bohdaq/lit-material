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
 * Set `flex` instead when this row is used with `lit-material-data-table`'s
 * virtualized (`items`/`.rowRenderer`) mode: rows rendered inside an
 * absolutely-positioned, transformed viewport can't participate in the
 * browser's table layout algorithm (that requires normal in-flow siblings),
 * so virtualized rows lay themselves out with flexbox instead — give each
 * `lit-material-data-table-cell` inside a matching `flex` and a `width` so
 * columns still line up with the (still table-laid-out) header row.
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
  /** Lays the row out with flexbox instead of `display: table-row` — see the class docs. */
  @property({ type: Boolean, reflect: true }) flex = false;

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
