import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./data-table-pagination-styles.js";

/**
 * A pagination footer for `lit-material-data-table` — a standalone,
 * headless control rather than something the table renders itself, since
 * the table never owns your data (see its own class docs) and paging is
 * exactly as data-shaped a concern as sorting/selection. Place one below a
 * table, feed it `total`/`page`/`page-size`, and re-render (or re-fetch) the
 * table's rows in response to `page-change` — this component never touches
 * the table directly.
 *
 * @element lit-material-data-table-pagination
 *
 * @fires page-change - `detail: { page, pageSize }`, when a nav button is activated or the page-size
 *   select changes (which also resets `page` to `0`).
 */
@customElement("lit-material-data-table-pagination")
export class LitMaterialDataTablePagination extends LitElement {
  static override styles = styles;

  /** 0-based current page index. */
  @property({ type: Number }) page = 0;
  @property({ attribute: "page-size", type: Number }) pageSize = 10;
  /** Total row count across every page — this control has no idea what a "row" is beyond this number. */
  @property({ type: Number }) total = 0;
  @property({ attribute: false }) pageSizeOptions: readonly number[] = [10, 25, 50];

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", "Pagination");
    }
  }

  private get pageCount(): number {
    return Math.max(1, Math.ceil(this.total / this.pageSize));
  }

  private get clampedPage(): number {
    return Math.min(Math.max(this.page, 0), this.pageCount - 1);
  }

  private get rangeStart(): number {
    return this.total === 0 ? 0 : this.clampedPage * this.pageSize + 1;
  }

  private get rangeEnd(): number {
    return Math.min(this.total, (this.clampedPage + 1) * this.pageSize);
  }

  private emitChange(page: number): void {
    this.page = page;
    this.dispatchEvent(
      new CustomEvent("page-change", { bubbles: true, detail: { page: this.page, pageSize: this.pageSize } }),
    );
  }

  private readonly handleFirst = (): void => this.emitChange(0);
  private readonly handlePrevious = (): void => this.emitChange(Math.max(0, this.clampedPage - 1));
  private readonly handleNext = (): void => this.emitChange(Math.min(this.pageCount - 1, this.clampedPage + 1));
  private readonly handleLast = (): void => this.emitChange(this.pageCount - 1);

  private readonly handlePageSizeChange = (event: Event): void => {
    this.pageSize = Number((event.target as HTMLSelectElement).value);
    this.emitChange(0);
  };

  override render() {
    const page = this.clampedPage;
    const isFirst = page <= 0;
    const isLast = page >= this.pageCount - 1;
    return html`
      <div class="page-size">
        <label id="page-size-label">Rows per page</label>
        <select aria-labelledby="page-size-label" .value=${String(this.pageSize)} @change=${this.handlePageSizeChange}>
          ${this.pageSizeOptions.map(
            (size) => html`<option value=${size} ?selected=${size === this.pageSize}>${size}</option>`,
          )}
        </select>
      </div>
      <div class="range">${this.rangeStart}–${this.rangeEnd} of ${this.total}</div>
      <div class="controls">
        <button type="button" aria-label="First page" ?disabled=${isFirst} @click=${this.handleFirst}>⏮</button>
        <button type="button" aria-label="Previous page" ?disabled=${isFirst} @click=${this.handlePrevious}>
          ◀
        </button>
        <button type="button" aria-label="Next page" ?disabled=${isLast} @click=${this.handleNext}>▶</button>
        <button type="button" aria-label="Last page" ?disabled=${isLast} @click=${this.handleLast}>⏭</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table-pagination": LitMaterialDataTablePagination;
  }
}
