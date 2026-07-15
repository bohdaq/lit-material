import "@lit-material/data-table";
import { html, LitElement } from "lit";
import { pageStyles } from "../../styles/page-styles.js";
import { customElement, state } from "lit/decorators.js";

interface SortChangeDetail {
  sortKey: string;
  sortDirection: string;
}

interface SelectionChangeDetail {
  selected: string[];
}

interface PageChangeDetail {
  page: number;
  pageSize: number;
}

interface Person {
  id: number;
  name: string;
  age: number;
}

const PAGINATED_PEOPLE: Person[] = Array.from({ length: 42 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  age: 20 + ((i * 7) % 60),
}));

const VIRTUALIZED_PEOPLE: Person[] = Array.from({ length: 10000 }, (_, i) => ({
  id: i + 1,
  name: `Person ${i + 1}`,
  age: 20 + ((i * 7) % 60),
}));

@customElement("docs-data-table-page")
export class DocsDataTablePage extends LitElement {
  static override styles = [pageStyles];

  @state()
  private log = "";

  @state()
  private page = 0;

  @state()
  private pageSize = 10;

  private readonly handleSort = (event: Event): void => {
    const { sortKey, sortDirection } = (event as CustomEvent<SortChangeDetail>).detail;
    this.log = `Sorted by ${sortKey} (${sortDirection})`;
  };

  private readonly handleSelection = (event: Event): void => {
    const { selected } = (event as CustomEvent<SelectionChangeDetail>).detail;
    this.log = `Selected rows: ${selected.length ? selected.join(", ") : "none"}`;
  };

  private readonly handlePageChange = (event: Event): void => {
    const { page, pageSize } = (event as CustomEvent<PageChangeDetail>).detail;
    this.page = page;
    this.pageSize = pageSize;
  };

  private readonly renderVirtualRow = (item: unknown, index: number) => {
    const person = item as Person;
    return html`
      <lit-material-data-table-row flex data-row-id=${person.id}>
        <lit-material-data-table-cell flex width="80px" numeric>${index + 1}</lit-material-data-table-cell>
        <lit-material-data-table-cell flex width="200px">${person.name}</lit-material-data-table-cell>
        <lit-material-data-table-cell flex width="100px" numeric>${person.age}</lit-material-data-table-cell>
      </lit-material-data-table-row>
    `;
  };

  override render() {
    const pageStart = this.page * this.pageSize;
    const pageRows = PAGINATED_PEOPLE.slice(pageStart, pageStart + this.pageSize);

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
          <lit-material-data-table-cell header sort-key="name" resizable>Name</lit-material-data-table-cell>
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
      <p>Drag the "Name" column's trailing edge to resize it — the whole column, header and body cells alike, follows.</p>

      <h2>Pagination</h2>
      <p>
        <code>lit-material-data-table-pagination</code> is a standalone footer control — it doesn't touch the
        table directly. Slice your own data by its <code>page-change</code> event and re-render the rows.
      </p>
      <lit-material-data-table style="max-width: 480px;">
        <lit-material-data-table-row header>
          <lit-material-data-table-cell header>Name</lit-material-data-table-cell>
          <lit-material-data-table-cell header numeric>Age</lit-material-data-table-cell>
        </lit-material-data-table-row>
        ${pageRows.map(
          (person) => html`
            <lit-material-data-table-row data-row-id=${person.id}>
              <lit-material-data-table-cell>${person.name}</lit-material-data-table-cell>
              <lit-material-data-table-cell numeric>${person.age}</lit-material-data-table-cell>
            </lit-material-data-table-row>
          `,
        )}
      </lit-material-data-table>
      <lit-material-data-table-pagination
        style="max-width: 480px;"
        total=${PAGINATED_PEOPLE.length}
        page=${this.page}
        page-size=${this.pageSize}
        @page-change=${this.handlePageChange}
      ></lit-material-data-table-pagination>

      <h2>Row virtualization</h2>
      <p>
        10,000 rows, but set <code>.items</code>/<code>.rowRenderer</code> and only the rows near the visible
        scroll window are ever mounted — scroll and check the DOM node count in devtools.
      </p>
      <lit-material-data-table
        style="max-width: 480px;"
        row-height="44"
        viewport-height="240"
        .items=${VIRTUALIZED_PEOPLE}
        .rowRenderer=${this.renderVirtualRow}
      >
        <lit-material-data-table-row header flex>
          <lit-material-data-table-cell header flex width="80px" numeric>#</lit-material-data-table-cell>
          <lit-material-data-table-cell header flex width="200px">Name</lit-material-data-table-cell>
          <lit-material-data-table-cell header flex width="100px" numeric>Age</lit-material-data-table-cell>
        </lit-material-data-table-row>
      </lit-material-data-table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-data-table-page": DocsDataTablePage;
  }
}
