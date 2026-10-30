import { html, LitElement, nothing, type TemplateResult } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./table-styles.js";

export interface TableColumn<Row = Record<string, unknown>> {
  /** The row field shown (and the column's identity). */
  key: string;
  /** Header text. */
  label: string;
  /** Right-aligned, tabular figures. */
  numeric?: boolean;
  /** Monospace (addresses, ids, paths). */
  mono?: boolean;
  /** A header that's only for screen readers (e.g. an actions column). */
  hiddenLabel?: boolean;
  /** Render the cell yourself; default is the field as text. */
  render?: (row: Row) => TemplateResult | string | number | typeof nothing;
}

/**
 * A semantic, read-only table from data: a real `<table>` with a caption,
 * a header row with `scope="col"`, numeric and monospace columns, and a
 * scroll container so a wide table scrolls inside its box, not the page.
 *
 * For sorting, selection, pagination or resizing use `lit-material-data-table`;
 * this one is for showing rows plainly, and is accessible as a table by
 * construction.
 *
 * @element lit-material-table
 *
 * @slot empty - Shown instead of the body when there are no rows.
 *
 * @csspart container - The scroll container.
 * @csspart table - The `<table>`.
 */
@customElement("lit-material-table")
export class LitMaterialTable<Row = Record<string, unknown>> extends LitElement {
  static override styles = styles;

  @property({ attribute: false }) columns: TableColumn<Row>[] = [];

  @property({ attribute: false }) rows: Row[] = [];

  /** Describes the table; read by screen readers. */
  @property() caption = "";

  /** Keep the caption for screen readers only. */
  @property({ type: Boolean, attribute: "caption-hidden" }) captionHidden = false;

  /** Row height: `standard` or `compact`. */
  @property({ reflect: true }) density: "standard" | "compact" = "standard";

  /** Header stays visible while the container scrolls (give the host a height). */
  @property({ type: Boolean, reflect: true, attribute: "sticky-header" }) stickyHeader = false;

  private cell(row: Row, column: TableColumn<Row>) {
    if (column.render) return column.render(row);
    const value = (row as Record<string, unknown>)[column.key];
    return value === undefined || value === null ? "" : String(value);
  }

  override render() {
    const columns = this.columns;
    return html`
      <div class="container" part="container" tabindex=${this.stickyHeader ? "0" : nothing}>
        <table part="table">
          ${this.caption ? html`<caption class=${this.captionHidden ? "visually-hidden" : ""}>${this.caption}</caption>` : nothing}
          <thead>
            <tr>
              ${columns.map(
                (c) =>
                  html`<th scope="col" class=${[c.numeric ? "num" : "", c.hiddenLabel ? "hidden-label" : ""].join(" ").trim() || nothing}>
                    ${c.hiddenLabel ? html`<span class="visually-hidden">${c.label}</span>` : c.label}
                  </th>`,
              )}
            </tr>
          </thead>
          ${this.rows.length
            ? html`<tbody>
                ${this.rows.map(
                  (row) =>
                    html`<tr>
                      ${columns.map(
                        (c) => html`<td class=${[c.numeric ? "num" : "", c.mono ? "mono" : ""].join(" ").trim() || nothing}>${this.cell(row, c)}</td>`,
                      )}
                    </tr>`,
                )}
              </tbody>`
            : nothing}
        </table>
        ${this.rows.length ? nothing : html`<div class="empty"><slot name="empty"></slot></div>`}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-table": LitMaterialTable;
  }
}
