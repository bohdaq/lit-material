import { html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
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
 * A `resizable` header cell's drag handle reports its own width via a
 * `column-resize` event — this table is the one that actually applies it,
 * setting an explicit `width`/`min-width`/`max-width` on every cell that
 * shares that column index (header and body alike), not just the header
 * cell that was dragged. That has to happen up here rather than in the cell
 * itself: with `display: table-cell` and no real `<colgroup>`, the browser's
 * table layout algorithm treats "same child index across sibling rows" as
 * the column, so keeping a whole column in sync means reaching into every
 * row, which only the table can see.
 *
 * Set `.items`/`.rowRenderer` for large datasets to switch on fixed-height
 * row virtualization: only the rows within (or near) the visible scroll
 * window are ever rendered, however many thousand `items` there are. This
 * is the one thing here that isn't purely headless — the table owns
 * scroll position and which slice of `items` is currently mounted — because
 * true virtualization requires knowing the full item count up front, which
 * "you slot real rows" (this table's normal mode) can't provide. Slot only
 * the header row in this mode; body rows come from `rowRenderer` instead,
 * and both the header row and every `rowRenderer`-returned row need `flex`
 * set (see `lit-material-data-table-row`'s docs) since virtualized rows are
 * positioned with `transform`, which native table layout can't do.
 *
 * @element lit-material-data-table
 *
 * @slot - `lit-material-data-table-row` elements (in virtualized mode, the header row only).
 *
 * @csspart table - The table layout container.
 * @csspart viewport - The scrollable viewport, in virtualized mode.
 * @csspart spacer - The full-height spacer inside the viewport, in virtualized mode.
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

  /** The full dataset for virtualized mode. Empty (the default) means "not virtualized". */
  @property({ attribute: false }) items: readonly unknown[] = [];
  /** Renders one virtualized body row. Required alongside `items` to turn virtualization on. */
  @property({ attribute: false }) rowRenderer?: (item: unknown, index: number) => unknown;
  /** Stable key per item, for correct DOM reuse as the visible window scrolls. Defaults to the index. */
  @property({ attribute: false }) rowKey?: (item: unknown, index: number) => string | number;
  /** Fixed row height in pixels — every virtualized row is assumed to be exactly this tall. */
  @property({ attribute: "row-height", type: Number }) rowHeight = 44;
  /** Visible scroll-viewport height in pixels. */
  @property({ attribute: "viewport-height", type: Number }) viewportHeight = 400;
  /** Extra rows rendered beyond each edge of the visible window, to absorb fast scrolling. */
  @property({ type: Number }) overscan = 4;

  @state() private viewportScrollTop = 0;
  private scrollUpdatePending = false;

  constructor() {
    super();
    this.addEventListener("sort-request", this.handleSortRequest as EventListener);
    this.addEventListener("change", this.handleChange);
    this.addEventListener("column-resize", this.handleColumnResize as EventListener);
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

  // Virtualized body rows live in this table's own shadow root (rendered by
  // `rowRenderer`, not slotted), while everything else lives in the light
  // DOM as usual — merge both trees rather than picking one, so sorting/
  // selection delegation keeps working regardless of which mode produced a
  // given row.
  private queryAllInTable<T extends Element>(selector: string): T[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during connectedCallback — degrade to no elements rather than
    // throwing (there's no sort/selection state to sync server-side anyway).
    if (typeof this.querySelectorAll !== "function") return [];
    const lightMatches = Array.from(this.querySelectorAll<T>(selector));
    const shadowMatches = this.shadowRoot ? Array.from(this.shadowRoot.querySelectorAll<T>(selector)) : [];
    return [...lightMatches, ...shadowMatches];
  }

  private get headerCells(): LitMaterialDataTableCell[] {
    return this.queryAllInTable<LitMaterialDataTableCell>("lit-material-data-table-cell[header]");
  }

  private get rowCheckboxes(): HTMLInputElement[] {
    return this.queryAllInTable<HTMLInputElement>("[data-row-select]");
  }

  private get selectAllCheckbox(): HTMLInputElement | null {
    return this.queryAllInTable<HTMLInputElement>("[data-select-all]")[0] ?? null;
  }

  private get rows(): LitMaterialDataTableRow[] {
    return this.queryAllInTable<LitMaterialDataTableRow>("lit-material-data-table-row");
  }

  private get isVirtualized(): boolean {
    return this.items.length > 0 && !!this.rowRenderer;
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

  private readonly handleColumnResize = (event: CustomEvent<{ width: number }>): void => {
    const cell = event.composedPath()[0] as HTMLElement | undefined;
    const row = cell?.parentElement;
    if (!cell || !row) return;
    const index = Array.from(row.children).indexOf(cell);
    if (index === -1) return;
    const width = `${event.detail.width}px`;
    this.rows.forEach((otherRow) => {
      const target = otherRow.children[index] as HTMLElement | undefined;
      if (!target) return;
      target.style.width = width;
      target.style.minWidth = width;
      target.style.maxWidth = width;
    });
  };

  private readonly handleViewportScroll = (event: Event): void => {
    const target = event.currentTarget as HTMLElement;
    if (this.scrollUpdatePending) return;
    this.scrollUpdatePending = true;
    requestAnimationFrame(() => {
      this.scrollUpdatePending = false;
      this.viewportScrollTop = target.scrollTop;
    });
  };

  private renderVirtualizedRows() {
    const total = this.items.length;
    const totalHeight = total * this.rowHeight;
    const start = Math.max(0, Math.floor(this.viewportScrollTop / this.rowHeight) - this.overscan);
    const visibleCount = Math.ceil(this.viewportHeight / this.rowHeight) + this.overscan * 2;
    const end = Math.min(total, start + visibleCount);
    const visible = this.items.slice(start, end);

    return html`
      <div
        class="viewport"
        part="viewport"
        style="height: ${this.viewportHeight}px"
        @scroll=${this.handleViewportScroll}
      >
        <div class="spacer" part="spacer" style="height: ${totalHeight}px">
          ${repeat(
            visible,
            (item, i) => (this.rowKey ? this.rowKey(item, start + i) : start + i),
            (item, i) => {
              const index = start + i;
              return html`<div class="virtual-row" style="transform: translateY(${index * this.rowHeight}px)">
                ${this.rowRenderer!(item, index)}
              </div>`;
            },
          )}
        </div>
      </div>
    `;
  }

  override render() {
    return html`
      <div class="table" part="table">
        <slot @slotchange=${this.handleSlotChange}></slot>
        ${this.isVirtualized ? this.renderVirtualizedRows() : ""}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table": LitMaterialDataTable;
  }
}
