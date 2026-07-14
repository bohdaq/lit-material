import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./data-table-cell-styles.js";

export type SortDirection = "none" | "ascending" | "descending";

/**
 * A single cell inside a `lit-material-data-table-row`.
 *
 * `header` renders it as a column header (`role="columnheader"`, label
 * typography); otherwise it's a plain data cell (`role="cell"`). Set
 * `sort-key` on a header cell to make it sortable — that wraps its content
 * in a real `<button>` (the ARIA APG pattern for sortable column headers is
 * an interactive element *inside* the columnheader cell, not the cell
 * itself carrying the interaction) which requests a sort from the parent
 * table on click; `sort-direction` is then kept in sync by the table, not
 * set directly.
 *
 * `:host` uses `display: table-cell` (not a real `<td>`) so cells still
 * align into columns via the browser's native table layout algorithm
 * without needing an actual `<table>` element — see `lit-material-data-table`
 * for why: CSS `::slotted()` can only style a *directly* slotted node, never
 * its descendants, so a real `<table>` with slotted `<thead>`/`<tbody>`
 * content would leave individual `<td>`/`<th>` cells entirely unstylable
 * from this component's own shadow root.
 *
 * @element lit-material-data-table-cell
 *
 * @slot - The cell's content.
 *
 * @csspart sort-button - The button wrapping content, for sortable header cells.
 * @csspart sort-icon - The ascending/descending indicator.
 */
@customElement("lit-material-data-table-cell")
export class LitMaterialDataTableCell extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) header = false;
  @property({ type: Boolean, reflect: true }) numeric = false;
  @property({ attribute: "sort-key" }) sortKey?: string;
  /** Kept in sync by the parent table — see the class docs. Not meant to be set directly. */
  @property({ attribute: "sort-direction", reflect: true }) sortDirection: SortDirection = "none";

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("header")) {
      this.setAttribute("role", this.header ? "columnheader" : "cell");
    }
  }

  private get isSortable(): boolean {
    return this.header && !!this.sortKey;
  }

  override render() {
    if (this.isSortable) {
      const icon = this.sortDirection === "descending" ? "▼" : "▲";
      return html`
        <button class="sort-button" part="sort-button" type="button" @click=${this.handleSortClick}>
          <span class="content"><slot></slot></span>
          <span class="sort-icon" part="sort-icon" aria-hidden="true">${icon}</span>
        </button>
      `;
    }
    return html`<span class="content"><slot></slot></span>`;
  }

  private readonly handleSortClick = (): void => {
    this.dispatchEvent(
      new CustomEvent("sort-request", {
        bubbles: true,
        composed: true,
        detail: { sortKey: this.sortKey },
      }),
    );
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table-cell": LitMaterialDataTableCell;
  }
}
