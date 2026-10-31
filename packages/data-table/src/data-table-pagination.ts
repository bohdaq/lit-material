import { html, LitElement, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./data-table-pagination-styles.js";

// Material icons first_page, chevron_left, chevron_right, last_page (Apache 2.0).
const icon = (d: string) => html`<svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d=${d}></path>`}</svg>`;
const firstIcon = icon("M18.41 16.59 13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z");
const previousIcon = icon("M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z");
const nextIcon = icon("M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z");
const lastIcon = icon("M5.59 7.41 10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z");

/**
 * A pagination footer for `lit-material-data-table` — a standalone,
 * headless control rather than something the table renders itself, since
 * the table never owns your data (see its own class docs) and paging is
 * exactly as data-shaped a concern as sorting/selection. Place one below a
 * table, feed it `total`/`page`/`page-size`, and re-render (or re-fetch) the
 * table's rows in response to `page-change` — this component never touches
 * the table directly.
 *
 * Cursor-paged APIs (a Kubernetes `continue` token, `next_cursor`) don't say
 * how many rows there are: set `unknown-total` and `has-more` instead of
 * `total`. The footer then shows "Page N", enables Next only while
 * `has-more` is set and drops Last. Keep a stack of cursors keyed by page
 * index to go back. Set `disabled` while a page is loading.
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
  /** The total isn't known (cursor paging): `total` is ignored, `has-more` drives Next. */
  @property({ attribute: "unknown-total", type: Boolean }) unknownTotal = false;
  /** With `unknown-total`: there is a page after this one. */
  @property({ attribute: "has-more", type: Boolean }) hasMore = false;
  /** Disables every control, e.g. while a page loads. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected override willUpdate(): void {
    if (!this.hasAttribute("role")) {
      this.setAttribute("role", "group");
    }
    if (!this.hasAttribute("aria-label")) {
      this.setAttribute("aria-label", "Pagination");
    }
  }

  private get pageCount(): number {
    if (this.unknownTotal) return this.hasMore ? this.page + 2 : Math.max(1, this.page + 1);
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
    const range = this.unknownTotal ? `Page ${page + 1}` : `${this.rangeStart}–${this.rangeEnd} of ${this.total}`;
    return html`
      <div class="page-size">
        <label id="page-size-label">Rows per page</label>
        <select
          aria-labelledby="page-size-label"
          ?disabled=${this.disabled}
          .value=${String(this.pageSize)} @change=${this.handlePageSizeChange}>
          ${this.pageSizeOptions.map(
            (size) => html`<option value=${size} ?selected=${size === this.pageSize}>${size}</option>`,
          )}
        </select>
      </div>
      <div class="range">${range}</div>
      <div class="controls">
        <button type="button" aria-label="First page" ?disabled=${this.disabled || isFirst} @click=${this.handleFirst}>
          ${firstIcon}
        </button>
        <button
          type="button"
          aria-label="Previous page"
          ?disabled=${this.disabled || isFirst}
          @click=${this.handlePrevious}
        >
          ${previousIcon}
        </button>
        <button type="button" aria-label="Next page" ?disabled=${this.disabled || isLast} @click=${this.handleNext}>
          ${nextIcon}
        </button>
        ${this.unknownTotal
          ? nothing
          : html`<button
              type="button"
              aria-label="Last page"
              ?disabled=${this.disabled || isLast}
              @click=${this.handleLast}
            >
              ${lastIcon}
            </button>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-table-pagination": LitMaterialDataTablePagination;
  }
}
