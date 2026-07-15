import "@lit-material/data-table";
import { LitElement, html } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, state } from "lit/decorators.js";

interface SortChangeDetail {
  sortKey: string;
  sortDirection: string;
}

interface SelectionChangeDetail {
  selected: string[];
}

@customElement("docs-data-table-page")
export class DocsDataTablePage extends LitElement {
  static override styles = [pageStyles];

  @state()
  private log = "";

  private readonly handleSort = (event: Event): void => {
    const { sortKey, sortDirection } = (event as CustomEvent<SortChangeDetail>).detail;
    this.log = `Sorted by ${sortKey} (${sortDirection})`;
  };

  private readonly handleSelection = (event: Event): void => {
    const { selected } = (event as CustomEvent<SelectionChangeDetail>).detail;
    this.log = `Selected rows: ${selected.length ? selected.join(", ") : "none"}`;
  };

  override render() {
    return html`
      <h1>Data Table</h1>
      <p>Sortable column headers, row selection (single/multi-select checkboxes), dense/comfortable density.</p>

      <lit-material-data-table
        style="max-width: 480px;"
        @sort-change=${this.handleSort}
        @selection-change=${this.handleSelection}
      >
        <lit-material-data-table-row header>
          <lit-material-data-table-cell header>
            <input type="checkbox" data-select-all aria-label="Select all rows" />
          </lit-material-data-table-cell>
          <lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>
          <lit-material-data-table-cell header sort-key="age" numeric>Age</lit-material-data-table-cell>
        </lit-material-data-table-row>
        <lit-material-data-table-row data-row-id="1">
          <lit-material-data-table-cell>
            <input type="checkbox" data-row-select aria-label="Select row: Ada Lovelace" />
          </lit-material-data-table-cell>
          <lit-material-data-table-cell>Ada Lovelace</lit-material-data-table-cell>
          <lit-material-data-table-cell numeric>36</lit-material-data-table-cell>
        </lit-material-data-table-row>
        <lit-material-data-table-row data-row-id="2">
          <lit-material-data-table-cell>
            <input type="checkbox" data-row-select aria-label="Select row: Grace Hopper" />
          </lit-material-data-table-cell>
          <lit-material-data-table-cell>Grace Hopper</lit-material-data-table-cell>
          <lit-material-data-table-cell numeric>85</lit-material-data-table-cell>
        </lit-material-data-table-row>
        <lit-material-data-table-row data-row-id="3">
          <lit-material-data-table-cell>
            <input type="checkbox" data-row-select aria-label="Select row: Alan Turing" />
          </lit-material-data-table-cell>
          <lit-material-data-table-cell>Alan Turing</lit-material-data-table-cell>
          <lit-material-data-table-cell numeric>41</lit-material-data-table-cell>
        </lit-material-data-table-row>
      </lit-material-data-table>
      <p style="color: var(--md-sys-color-on-surface-variant, #49454f);">${this.log}</p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-data-table-page": DocsDataTablePage;
  }
}
