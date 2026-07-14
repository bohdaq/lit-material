import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import type { LitMaterialDataTableCell, SortDirection } from "./data-table-cell.js";
import type { LitMaterialDataTableRow } from "./data-table-row.js";
import { styles } from "./data-table-styles.js";

/**
 * Material Design 3 data table — a container for `lit-material-data-table-row`
 * elements (each holding `lit-material-data-table-cell` elements).
 *
 * This component owns UI *state* (which column is sorted which way, which
 * rows are checked) and *notifies* you of it via events — it doesn't own
 * your data, so it never reorders rows itself. Sort a header cell (one
 * with `sort-key` set) and this table updates `sortKey`/`sortDirection`,
 * syncs the indicator onto the right cell, and fires `sort-change`; you
 * re-render the rows in the new order (or re-fetch a sorted page) in
 * response. The same headless-behavior split
 * [`lit-material-tabs`](https://github.com/bohdaq/lit-material/tree/main/packages/tabs)
 * makes for tab *panels*.
 *
 * Row selection works by event delegation rather than a hard dependency on
 * any specific checkbox implementation: put a real `<input type="checkbox">`
 * (or `lit-material-checkbox`, or anything that fires a bubbling `change`
 * event) with a `data-row-select` attribute in a row's cell, and one with
 * `data-select-all` in the header row's — this table listens for `change`
 * on those, drives "select all" indeterminate state, sets the matching
 * row's `selected`, and fires `selection-change` with the checked rows'
 * closest-`<tr>`-equivalent (`lit-material-data-table-row`) `data-row-id`
 * attribute.
 *
 * @element lit-material-data-table
 *
 * @slot - `lit-material-data-table-row` elements.
 *
 * @csspart table - The table layout container.
 *
 * @fires sort-change - `detail: { sortKey, sortDirection }`, when a sortable header cell is activated.
 * @fires selection-change - `detail: { selected: string[] }` (the checked rows' `data-row-id` values),
 *   when a `data-row-select`/`data-select-all` checkbox changes.
 */
@customElement("lit-material-data-table")
export class LitMaterialDataTable extends LitElement {
  static override styles = styles;

  @property({ attribute: "sort-key" }) sortKey?: string;
  @property({ attribute: "sort-direction" }) sortDirection: SortDirection = "ascending";

  constructor() {
    super();
    this.addEventListener("sort-request", this.handleSortRequest as EventListener);
    this.addEventListener("change", this.handleChange);
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag (see lit-material-linear-progress for
    // the full explanation) — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output.
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "table");
    }
    if (changed.has("sortKey") || changed.has("sortDirection")) {
      this.syncSortIndicators();
    }
  }

  private get headerCells(): LitMaterialDataTableCell[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during connectedCallback — degrade to no cells rather than
    // throwing (there's no sort/selection state to sync server-side anyway).
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll<LitMaterialDataTableCell>("lit-material-data-table-cell[header]"));
  }

  private get rowCheckboxes(): HTMLInputElement[] {
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll<HTMLInputElement>("[data-row-select]"));
  }

  private get selectAllCheckbox(): HTMLInputElement | null {
    if (typeof this.querySelector !== "function") return null;
    return this.querySelector<HTMLInputElement>("[data-select-all]");
  }

  private syncSortIndicators(): void {
    this.headerCells.forEach((cell) => {
      cell.sortDirection = cell.sortKey === this.sortKey ? this.sortDirection : "none";
    });
  }

  private syncSelectAllState(): void {
    const selectAll = this.selectAllCheckbox;
    if (!selectAll) return;
    const boxes = this.rowCheckboxes;
    const checkedCount = boxes.filter((box) => box.checked).length;
    selectAll.checked = boxes.length > 0 && checkedCount === boxes.length;
    selectAll.indeterminate = checkedCount > 0 && checkedCount < boxes.length;
  }

  private syncRowSelectedState(): void {
    this.rowCheckboxes.forEach((box) => {
      const row = box.closest<LitMaterialDataTableRow>("lit-material-data-table-row");
      if (row) row.selected = box.checked;
    });
  }

  private dispatchSelectionChange(): void {
    const selected = this.rowCheckboxes
      .filter((box) => box.checked)
      .map((box) => box.closest<LitMaterialDataTableRow>("lit-material-data-table-row")?.getAttribute("data-row-id"))
      .filter((id): id is string => id !== null && id !== undefined);
    this.dispatchEvent(new CustomEvent("selection-change", { bubbles: true, detail: { selected } }));
  }

  private readonly handleSlotChange = (): void => {
    this.syncSortIndicators();
    this.syncSelectAllState();
    this.syncRowSelectedState();
  };

  private readonly handleSortRequest = (event: CustomEvent<{ sortKey?: string }>): void => {
    const key = event.detail.sortKey;
    if (!key) return;
    if (this.sortKey === key) {
      this.sortDirection = this.sortDirection === "ascending" ? "descending" : "ascending";
    } else {
      this.sortKey = key;
      this.sortDirection = "ascending";
    }
    this.dispatchEvent(
      new CustomEvent("sort-change", {
        bubbles: true,
        detail: { sortKey: this.sortKey, sortDirection: this.sortDirection },
      }),
    );
  };

  private readonly handleChange = (event: Event): void => {
    const target = event.composedPath()[0] as HTMLElement | undefined;
    if (!target?.hasAttribute) return;
    if (target.hasAttribute("data-select-all")) {
      const checked = (target as HTMLInputElement).checked;
      this.rowCheckboxes.forEach((box) => {
        if (!box.disabled) box.checked = checked;
      });
      this.syncRowSelectedState();
      this.dispatchSelectionChange();
    } else if (target.hasAttribute("data-row-select")) {
      this.syncRowSelectedState();
      this.syncSelectAllState();
      this.dispatchSelectionChange();
    }
  };

  override render() {
    return html`<div class="table" part="table"><slot @slotchange=${this.handleSlotChange}></slot></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table": LitMaterialDataTable;
  }
}
