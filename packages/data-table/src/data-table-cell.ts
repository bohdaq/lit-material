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
 * Set `resizable` on a header cell to add a drag handle at its trailing
 * edge. Dragging it dispatches a bubbling, composed `column-resize` event
 * (`detail: { width }`, in pixels) — the cell only reports the drag, it
 * never resizes itself or its column-mates; `lit-material-data-table`
 * listens for that event and applies the resulting width to every cell in
 * the same column (see its own class docs for why that has to happen
 * one level up).
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
 * @csspart resize-handle - The drag handle for a `resizable` header cell.
 *
 * @fires column-resize - `detail: { width }` (pixels), while dragging a `resizable` cell's handle.
 */
@customElement("lit-material-data-table-cell")
export class LitMaterialDataTableCell extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) header = false;
  @property({ type: Boolean, reflect: true }) numeric = false;
  @property({ attribute: "sort-key" }) sortKey?: string;
  /** Kept in sync by the parent table — see the class docs. Not meant to be set directly. */
  @property({ attribute: "sort-direction", reflect: true }) sortDirection: SortDirection = "none";
  /** Adds a drag handle at the trailing edge. Only meaningful on a `header` cell. */
  @property({ type: Boolean, reflect: true }) resizable = false;
  /** Floor for the width this cell's handle will report while dragging. */
  @property({ attribute: "min-width", type: Number }) minWidth = 60;
  /** Lays the cell out with flexbox instead of `display: table-cell` — see `lit-material-data-table-row`. */
  @property({ type: Boolean, reflect: true }) flex = false;
  /** This cell's width in `flex` mode (any CSS `flex-basis` value, e.g. `"96px"`). Ignored otherwise. */
  @property() width?: string;

  private resizeStartX = 0;
  private resizeStartWidth = 0;

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("header")) {
      this.setAttribute("role", this.header ? "columnheader" : "cell");
    }
    // @lit-labs/ssr's light-DOM shim doesn't implement `style` on the host — skip rather than
    // throw, there's no layout to compute server-side anyway.
    if ((changed.has("flex") || changed.has("width")) && this.style) {
      this.style.flex = this.flex ? `0 0 ${this.width ?? "auto"}` : "";
    }
  }

  private get isSortable(): boolean {
    return this.header && !!this.sortKey;
  }

  override render() {
    const handle = this.resizable
      ? html`<span
          class="resize-handle"
          part="resize-handle"
          @pointerdown=${this.handleResizePointerDown}
        ></span>`
      : "";
    if (this.isSortable) {
      const icon = this.sortDirection === "descending" ? "▼" : "▲";
      return html`
        <button class="sort-button" part="sort-button" type="button" @click=${this.handleSortClick}>
          <span class="content"><slot></slot></span>
          <span class="sort-icon" part="sort-icon" aria-hidden="true">${icon}</span>
        </button>
        ${handle}
      `;
    }
    return html`<span class="content"><slot></slot></span>${handle}`;
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

  private readonly handleResizePointerDown = (event: PointerEvent): void => {
    event.preventDefault();
    const handle = event.currentTarget as HTMLElement;
    // Pointer capture keeps drag events flowing to the handle even once the cursor leaves its
    // small hit area mid-drag; synthetic pointer events (as in tests) don't register as an
    // "active" pointer the platform will accept, so degrade to plain bubbling instead of throwing.
    try {
      handle.setPointerCapture(event.pointerId);
    } catch {
      // no-op — see comment above.
    }
    this.resizeStartX = event.clientX;
    this.resizeStartWidth = this.getBoundingClientRect().width;
    handle.addEventListener("pointermove", this.handleResizePointerMove);
    handle.addEventListener("pointerup", this.handleResizePointerUp);
    handle.addEventListener("pointercancel", this.handleResizePointerUp);
  };

  private readonly handleResizePointerMove = (event: PointerEvent): void => {
    this.dispatchResize(event.clientX);
  };

  private readonly handleResizePointerUp = (event: PointerEvent): void => {
    this.dispatchResize(event.clientX);
    const handle = event.currentTarget as HTMLElement;
    handle.removeEventListener("pointermove", this.handleResizePointerMove);
    handle.removeEventListener("pointerup", this.handleResizePointerUp);
    handle.removeEventListener("pointercancel", this.handleResizePointerUp);
  };

  private dispatchResize(clientX: number): void {
    const isRtl = getComputedStyle(this).direction === "rtl";
    const delta = isRtl ? this.resizeStartX - clientX : clientX - this.resizeStartX;
    const width = Math.max(this.minWidth, Math.round(this.resizeStartWidth + delta));
    this.dispatchEvent(
      new CustomEvent("column-resize", { bubbles: true, composed: true, detail: { width } }),
    );
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table-cell": LitMaterialDataTableCell;
  }
}
