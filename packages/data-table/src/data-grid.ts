import { html, LitElement, nothing, svg, type PropertyValues, type TemplateResult } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { isRtl, LocalizeController } from "@lit-material/core/localize.js";
import { cssProps } from "@lit-material/core/css-props.js";
import "@lit-material/text-field/text-field.js";
import "@lit-material/text-field/number-field.js";
import "@lit-material/select/select.js";
import "@lit-material/select/select-option.js";
import "./data-table.js";
import "./data-table-row.js";
import "./data-table-cell.js";
import "./data-table-pagination.js";
import type { SortDirection } from "./data-table-cell.js";
import type { LitMaterialDataTable } from "./data-table.js";
import { toCsvText } from "./csv.js";
import { styles } from "./data-grid-styles.js";

export type GridRow = Record<string, unknown>;

/** A built-in group aggregate, or your own function of the group's values (and rows). */
export type DataGridAggregate<R extends GridRow = GridRow> =
  | "sum"
  | "avg"
  | "min"
  | "max"
  | "count"
  | ((values: unknown[], rows: R[]) => unknown);

export interface DataGridEditorOption {
  value: string | number;
  label: string;
}

export interface DataGridColumn<R extends GridRow = GridRow> {
  /** The row field shown (and the column's identity). */
  key: string;
  /** Header text; also the inline editor's label. */
  header: string;
  /** End-aligned, tabular figures; the default editor becomes `"number"`. */
  numeric?: boolean;
  /** The header sorts the grid by this column. */
  sortable?: boolean;
  /** Cells can be edited in place. */
  editable?: boolean;
  /** The inline editor. Default `"number"` for `numeric` columns, otherwise `"text"`. */
  editor?: "text" | "number" | "select";
  /** Choices for the `"select"` editor; a cell without `format` shows the matching label. */
  options?: (string | number | DataGridEditorOption)[];
  /**
   * Display text for a value. `row` is the row, or `null` for a group's aggregate. Return a string (or
   * number) for it to reach `toCSV()`; a template renders, and the CSV then has the raw value.
   */
  format?: (value: unknown, row: R | null) => string | number | TemplateResult | typeof nothing;
  /** Shown in group header rows, over the group's rows. */
  aggregate?: DataGridAggregate<R>;
  /** Column width: a CSS length, or a number of pixels. */
  width?: string | number;
}

export type CsvRows = "all" | "visible" | "selected";

export interface DataGridCsvOptions {
  /** Column keys to export, in order. Default: every column. */
  columns?: string[];
  /** `"all"` (default: every row, in display order), `"visible"` (expanded groups, current page) or `"selected"`. */
  rows?: CsvRows;
  /** Start with a UTF-8 byte order mark (for Excel). Default `false` for `toCSV()`, `true` for `downloadCSV()`. */
  bom?: boolean;
  /** Field separator. Default `","`. */
  delimiter?: string;
  /** Raw values instead of `format` output. Default `false`. */
  raw?: boolean;
  /** Include the header record. Default `true`. */
  header?: boolean;
  /** Neutralise spreadsheet formulas with a leading `'` (see the README). Default `true`. */
  escapeFormulas?: boolean;
}

export interface CellEditDetail<R extends GridRow = GridRow> {
  row: R;
  column: string;
  /** The new value; a listener may replace it (to normalise input). */
  value: unknown;
  oldValue: unknown;
  /** Set it with `preventDefault()`: the editor stays open and shows this message. */
  error?: string;
}

interface DataEntry<R extends GridRow> {
  kind: "row";
  row: R;
  key: string;
  level: number;
  setsize: number;
  posinset: number;
  parent?: GroupEntry<R>;
}

interface GroupEntry<R extends GridRow> {
  kind: "group";
  id: string;
  column: DataGridColumn<R>;
  value: unknown;
  rows: R[];
  level: number;
  setsize: number;
  posinset: number;
  expanded: boolean;
  parent?: GroupEntry<R>;
}

type Entry<R extends GridRow> = DataEntry<R> | GroupEntry<R>;

interface Editing {
  key: string;
  column: string;
}

const jsonArray = {
  fromAttribute(value: string | null): string[] {
    if (!value) return [];
    const trimmed = value.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed: unknown = JSON.parse(trimmed);
        return Array.isArray(parsed) ? parsed.map(String) : [];
      } catch {
        return [];
      }
    }
    return trimmed
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);
  },
  toAttribute(value: string[] | string): string {
    return Array.isArray(value) ? value.join(",") : value;
  },
};

// Material icon chevron_right (Apache 2.0).
const chevron = html`<svg viewBox="0 0 24 24" aria-hidden="true">${svg`<path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>`}</svg>`;

const isEmpty = (value: unknown): boolean => value === null || value === undefined || value === "";

function rawText(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

const collators = new Map<string, Intl.Collator>();
function collator(lang: string): Intl.Collator {
  let found = collators.get(lang);
  if (!found) {
    try {
      found = new Intl.Collator(lang, { numeric: true, sensitivity: "base" });
    } catch {
      found = new Intl.Collator("en", { numeric: true, sensitivity: "base" });
    }
    collators.set(lang, found);
  }
  return found;
}

/** Empty values last; numbers, dates and booleans by value; text by the locale's collation (numeric-aware). */
function compareValues(a: unknown, b: unknown, lang: string): number {
  const emptyA = isEmpty(a);
  const emptyB = isEmpty(b);
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  if (a instanceof Date && b instanceof Date) return a.getTime() - b.getTime();
  if (typeof a === "boolean" && typeof b === "boolean") return Number(a) - Number(b);
  return collator(lang).compare(rawText(a), rawText(b));
}

function optionOf(option: string | number | DataGridEditorOption): DataGridEditorOption {
  return typeof option === "object" ? option : { value: option, label: String(option) };
}

/**
 * A data-driven grid: give it `columns` and `rows` and it sorts, groups (with aggregates), edits cells in
 * place, selects, pages and exports CSV — rendered with the data table's own row and cell elements.
 * `lit-material-data-table` leaves your data to you; this one owns a copy of it, which grouping, editing
 * and export need.
 *
 * It follows the ARIA grid pattern, or treegrid once `group-by` is set: group header rows carry
 * `aria-level`, `aria-expanded`, `aria-setsize` and `aria-posinset`, and so do the rows inside them.
 * One cell at a time is in the tab order (roving tabindex); arrow keys move between cells.
 *
 * @element lit-material-data-grid
 *
 * @csspart table - The inner `lit-material-data-table`.
 * @csspart pagination - The pagination footer, when `page-size` is set.
 *
 * @fires sort-change - `detail: { sortKey, sortDirection }`, when a sortable header is activated.
 * @fires selection-change - `detail: { selected: string[] }` (row keys), when a row checkbox changes.
 * @fires group-toggle - `detail: { group, expanded, expandedGroups }`, when a group is expanded or collapsed.
 * @fires cell-edit - Cancelable, before an edited value is applied: `detail: { row, column, value, oldValue, error? }`.
 *   `preventDefault()` keeps the editor open and shows `detail.error`.
 * @fires edit-commit - `detail: { row, previousRow, column, value, oldValue }`, after `rows` has the new value.
 * @fires page-change - `detail: { page, pageSize }`, from the pagination footer.
 */
@customElement("lit-material-data-grid")
export class LitMaterialDataGrid<R extends GridRow = GridRow> extends LitElement {
  static override styles = styles;

  @property({ type: Array }) columns: DataGridColumn<R>[] = [];

  @property({ type: Array }) rows: R[] = [];

  /** The row field that identifies a row (selection, editing). Unset, or missing on a row: its index in `rows`. */
  @property({ attribute: "row-key" }) rowKey?: string;

  /** The grid's accessible name. */
  @property() label = "";

  @property({ attribute: "sort-key" }) sortKey?: string;

  @property({ attribute: "sort-direction" }) sortDirection: SortDirection = "ascending";

  /** Column key(s) to group by: `"status"`, `"status,owner"` or a JSON array; nested in that order. */
  @property({ attribute: "group-by", converter: jsonArray }) groupBy: string[] | string = [];

  /** Ids of the expanded groups (see `groupId()`); groups start collapsed. */
  @property({ attribute: "expanded-groups", type: Array }) expandedGroups: string[] = [];

  /** Adds a checkbox column. */
  @property({ type: Boolean, reflect: true }) selectable = false;

  /** Keys of the selected rows. */
  @property({ type: Array }) selected: string[] = [];

  /** Rows per page; `0` (default) shows every row without a footer. */
  @property({ attribute: "page-size", type: Number }) pageSize = 0;

  /** 0-based page. */
  @property({ type: Number }) page = 0;

  @property({ attribute: "page-size-options", type: Array }) pageSizeOptions: number[] = [10, 25, 50];

  @state() private focusRow = 0;
  @state() private focusCol = 0;
  @state() private editing?: Editing;
  @state() private editError = "";
  @state() private announcement = "";

  private readonly localize = new LocalizeController(this);

  private model: {
    all: DataEntry<R>[];
    visible: Entry<R>[];
    groupIds: string[];
  } = { all: [], visible: [], groupIds: [] };

  /** The id of a group, from its values outermost first: `groupId(["Engineering", "Berlin"])` → `"Engineering/Berlin"`. */
  static groupId(values: unknown[]): string {
    return values.map((value) => encodeURIComponent(rawText(value))).join("/");
  }

  private get groupKeys(): string[] {
    const keys = typeof this.groupBy === "string" ? jsonArray.fromAttribute(this.groupBy) : this.groupBy;
    return keys.filter(Boolean);
  }

  private get offset(): number {
    return this.selectable ? 1 : 0;
  }

  private get colCount(): number {
    return this.columns.length + this.offset;
  }

  private keyOf(row: R, index: number): string {
    const value = this.rowKey ? row[this.rowKey] : undefined;
    return isEmpty(value) ? String(index) : String(value);
  }

  private column(key: string): DataGridColumn<R> | undefined {
    return this.columns.find((column) => column.key === key);
  }

  // ---- Model -------------------------------------------------------------------------------------------

  private buildModel(): void {
    const lang = this.localize.lang;
    const keyed = this.rows.map((row, index) => ({ row, key: this.keyOf(row, index) }));
    const sortColumn = this.sortKey ? this.column(this.sortKey) : undefined;
    const sortSign = this.sortDirection === "descending" ? -1 : 1;
    if (sortColumn) {
      const key = sortColumn.key;
      keyed.sort((a, b) => sortSign * compareValues(a.row[key], b.row[key], lang));
    }
    const keyOfRow = new Map(keyed.map((item) => [item.row, item.key]));
    const groupKeys = this.groupKeys;
    const expanded = new Set(this.expandedGroups);
    const all: DataEntry<R>[] = [];
    const visible: Entry<R>[] = [];
    const groupIds: string[] = [];

    const walk = (rows: R[], depth: number, path: unknown[], parent: GroupEntry<R> | undefined, shown: boolean): void => {
      if (depth === groupKeys.length) {
        rows.forEach((row, index) => {
          const entry: DataEntry<R> = {
            kind: "row",
            row,
            key: keyOfRow.get(row)!,
            level: depth + 1,
            setsize: rows.length,
            posinset: index + 1,
            parent,
          };
          all.push(entry);
          if (shown) visible.push(entry);
        });
        return;
      }
      const groupKey = groupKeys[depth]!;
      // Grouping by a field without a column: its key is the header.
      const column = this.column(groupKey) ?? { key: groupKey, header: groupKey };
      const buckets = new Map<string, { value: unknown; rows: R[] }>();
      for (const row of rows) {
        const value = row[column.key];
        const id = rawText(value);
        const bucket = buckets.get(id);
        if (bucket) bucket.rows.push(row);
        else buckets.set(id, { value, rows: [row] });
      }
      const groupSign = this.sortKey === column.key ? sortSign : 1;
      const groups = [...buckets.values()].sort((a, b) => groupSign * compareValues(a.value, b.value, lang));
      groups.forEach((group, index) => {
        const groupPath = [...path, group.value];
        const id = LitMaterialDataGrid.groupId(groupPath);
        groupIds.push(id);
        const entry: GroupEntry<R> = {
          kind: "group",
          id,
          column,
          value: group.value,
          rows: group.rows,
          level: depth + 1,
          setsize: groups.length,
          posinset: index + 1,
          expanded: expanded.has(id),
          parent,
        };
        if (shown) visible.push(entry);
        walk(group.rows, depth + 1, groupPath, entry, shown && entry.expanded);
      });
    };
    walk(
      keyed.map((item) => item.row),
      0,
      [],
      undefined,
      true,
    );
    this.model = { all, visible, groupIds };
  }

  private get pageCount(): number {
    return this.pageSize > 0 ? Math.max(1, Math.ceil(this.model.visible.length / this.pageSize)) : 1;
  }

  private get pageStart(): number {
    if (this.pageSize <= 0) return 0;
    return Math.min(Math.max(this.page, 0), this.pageCount - 1) * this.pageSize;
  }

  /** The entries rendered now (the current page of the visible rows). */
  private get pageEntries(): Entry<R>[] {
    const visible = this.model.visible;
    return this.pageSize > 0 ? visible.slice(this.pageStart, this.pageStart + this.pageSize) : visible;
  }

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (
      changed.has("rows") ||
      changed.has("columns") ||
      changed.has("sortKey") ||
      changed.has("sortDirection") ||
      changed.has("groupBy") ||
      changed.has("expandedGroups") ||
      changed.has("rowKey") ||
      changed.size === 0 // a language change: collation may differ
    ) {
      this.buildModel();
    }
    const rows = this.pageEntries.length;
    if (this.focusRow > rows) this.focusRow = rows;
    if (this.focusCol >= this.colCount) this.focusCol = Math.max(0, this.colCount - 1);
  }

  // ---- Public API -------------------------------------------------------------------------------------

  /** Expands every group. */
  expandAll(): void {
    this.expandedGroups = [...this.model.groupIds];
  }

  /** Collapses every group. */
  collapseAll(): void {
    this.expandedGroups = [];
  }

  /** Expands or collapses a group by id (toggles without `force`), and fires `group-toggle`. */
  toggleGroup(id: string, force?: boolean): void {
    const isExpanded = this.expandedGroups.includes(id);
    const expanded = force ?? !isExpanded;
    if (expanded === isExpanded) return;
    this.expandedGroups = expanded ? [...this.expandedGroups, id] : this.expandedGroups.filter((group) => group !== id);
    this.dispatchEvent(
      new CustomEvent("group-toggle", {
        bubbles: true,
        composed: true,
        detail: { group: id, expanded, expandedGroups: this.expandedGroups },
      }),
    );
  }

  /** The grid as RFC 4180 CSV (group rows are left out). See `DataGridCsvOptions`. */
  toCSV(options: DataGridCsvOptions = {}): string {
    const columns = options.columns
      ? options.columns.map((key) => this.column(key)).filter((c): c is DataGridColumn<R> => Boolean(c))
      : this.columns;
    let entries: DataEntry<R>[];
    if (options.rows === "visible") {
      entries = this.pageEntries.filter((entry): entry is DataEntry<R> => entry.kind === "row");
    } else if (options.rows === "selected") {
      const selected = new Set(this.selected.map(String));
      entries = this.model.all.filter((entry) => selected.has(entry.key));
    } else {
      entries = this.model.all;
    }
    const records = entries.map((entry) => columns.map((column) => this.csvValue(entry.row, column, options.raw ?? false)));
    if (options.header ?? true) records.unshift(columns.map((column) => column.header));
    return toCsvText(records, { delimiter: options.delimiter, bom: options.bom, escapeFormulas: options.escapeFormulas });
  }

  /** Downloads `toCSV(options)` as a file (with a byte order mark unless `bom: false`). */
  downloadCSV(filename = "data.csv", options: DataGridCsvOptions = {}): void {
    const text = this.toCSV({ bom: true, ...options });
    const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  private csvValue(row: R, column: DataGridColumn<R>, raw: boolean): string {
    const value = row[column.key];
    if (!raw && column.format) {
      const formatted = column.format(value, row);
      if (typeof formatted === "string" || typeof formatted === "number") return String(formatted);
    }
    return rawText(value);
  }

  // ---- Display ----------------------------------------------------------------------------------------

  private display(value: unknown, row: R | null, column: DataGridColumn<R>): unknown {
    if (column.format) return column.format(value, row);
    if (column.options) {
      const match = column.options.map(optionOf).find((option) => String(option.value) === rawText(value));
      if (match) return match.label;
    }
    if (typeof value === "number") return this.localize.number(value);
    if (value instanceof Date) return this.localize.date(value);
    return rawText(value);
  }

  private aggregateText(column: DataGridColumn<R>, rows: R[]): string | unknown {
    const aggregate = column.aggregate;
    if (!aggregate) return nothing;
    const values = rows.map((row) => row[column.key]);
    if (typeof aggregate === "function") return this.display(aggregate(values, rows), null, column);
    const present = values.filter((value) => !isEmpty(value));
    if (aggregate === "count") {
      return this.localize.term("dataTable.aggregateCount", "Count: {value}", { value: present.length });
    }
    const numbers = present.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
    let result: unknown;
    if (aggregate === "sum") result = numbers.reduce((a, b) => a + b, 0);
    else if (aggregate === "avg") result = numbers.length ? numbers.reduce((a, b) => a + b, 0) / numbers.length : undefined;
    else {
      const pool: unknown[] = numbers.length ? numbers : present;
      const lang = this.localize.lang;
      const sign = aggregate === "min" ? 1 : -1;
      result = pool.length ? [...pool].sort((a, b) => sign * compareValues(a, b, lang))[0] : undefined;
    }
    if (result === undefined) return nothing;
    const shown = this.display(result, null, column);
    const value = typeof shown === "string" || typeof shown === "number" ? String(shown) : rawText(result);
    switch (aggregate) {
      case "sum":
        return this.localize.term("dataTable.aggregateSum", "Sum: {value}", { value });
      case "avg":
        return this.localize.term("dataTable.aggregateAvg", "Average: {value}", { value });
      case "min":
        return this.localize.term("dataTable.aggregateMin", "Min: {value}", { value });
      default:
        return this.localize.term("dataTable.aggregateMax", "Max: {value}", { value });
    }
  }

  // ---- Rendering --------------------------------------------------------------------------------------

  private tab(r: number, c: number): string {
    return r === this.focusRow && c === this.focusCol ? "0" : "-1";
  }

  private width(column: DataGridColumn<R>): string | undefined {
    return typeof column.width === "number" ? `${column.width}px` : column.width;
  }

  private renderHeader() {
    const selected = new Set(this.selected.map(String));
    const total = this.model.all.length;
    const count = this.model.all.filter((entry) => selected.has(entry.key)).length;
    return html`<lit-material-data-table-row header role="row" aria-rowindex=${this.pageSize > 0 ? 1 : nothing}>
      ${this.selectable
        ? html`<lit-material-data-table-cell header role="columnheader" data-r="0" data-c="0"
            ><input
              type="checkbox"
              class="select-box"
              data-focus
              tabindex=${this.tab(0, 0)}
              aria-label=${this.localize.term("dataTable.selectAll", "Select all rows")}
              .checked=${total > 0 && count === total}
              .indeterminate=${count > 0 && count < total}
              ?disabled=${total === 0}
              @change=${this.handleSelectAll}
          /></lit-material-data-table-cell>`
        : nothing}
      ${this.columns.map((column, i) => {
        const c = i + this.offset;
        const sorted = this.sortKey === column.key;
        return html`<lit-material-data-table-cell
          header
          role="columnheader"
          data-r="0"
          data-c=${c}
          tabindex=${this.tab(0, c)}
          ?numeric=${column.numeric ?? false}
          sort-key=${column.sortable ? column.key : nothing}
          sort-tabindex=${column.sortable ? -1 : nothing}
          sort-direction=${column.sortable ? (sorted ? this.sortDirection : "none") : nothing}
          aria-sort=${sorted && column.sortable ? this.sortDirection : nothing}
          style=${cssProps({ width: this.width(column), minWidth: this.width(column) })}
          >${column.header}</lit-material-data-table-cell
        >`;
      })}
    </lit-material-data-table-row>`;
  }

  private renderGroupRow(entry: GroupEntry<R>, r: number, rowIndex: number) {
    const groupColumn = entry.column;
    const shown = isEmpty(entry.value)
      ? this.localize.term("dataTable.emptyGroup", "(Empty)")
      : this.display(entry.value, entry.rows[0] ?? null, groupColumn);
    const count = this.localize.term("dataTable.groupCount", { one: "{count} row", other: "{count} rows" }, { count: entry.rows.length });
    return html`<lit-material-data-table-row
      class="group"
      role="row"
      aria-level=${entry.level}
      aria-expanded=${entry.expanded ? "true" : "false"}
      aria-setsize=${entry.setsize}
      aria-posinset=${entry.posinset}
      aria-rowindex=${this.pageSize > 0 ? rowIndex : nothing}
      data-group=${entry.id}
    >
      ${this.selectable
        ? html`<lit-material-data-table-cell role="gridcell" data-r=${r} data-c="0" tabindex=${this.tab(r, 0)}></lit-material-data-table-cell>`
        : nothing}
      ${this.columns.map((column, i) => {
        const c = i + this.offset;
        const aggregate = this.aggregateText(column, entry.rows);
        if (i === 0) {
          return html`<lit-material-data-table-cell
            role="gridcell"
            data-r=${r}
            data-c=${c}
            style=${cssProps({ paddingInlineStart: `${8 + (entry.level - 1) * 24}px` })}
            ><button
              type="button"
              class="toggle"
              data-focus
              tabindex=${this.tab(r, c)}
              aria-expanded=${entry.expanded ? "true" : "false"}
              @click=${() => this.toggleGroup(entry.id)}
            >
              ${chevron}<span>${groupColumn.header}: ${shown}</span><span class="count">(${count})</span>
            </button>
            ${aggregate === nothing ? nothing : html`<span class="aggregate">${aggregate}</span>`}</lit-material-data-table-cell
          >`;
        }
        return html`<lit-material-data-table-cell role="gridcell" data-r=${r} data-c=${c} tabindex=${this.tab(r, c)} ?numeric=${column.numeric ?? false}
          >${aggregate === nothing ? nothing : html`<span class="aggregate">${aggregate}</span>`}</lit-material-data-table-cell
        >`;
      })}
    </lit-material-data-table-row>`;
  }

  private renderDataRow(entry: DataEntry<R>, r: number, rowIndex: number, grouped: boolean, anyEditable: boolean) {
    const isSelected = this.selected.map(String).includes(entry.key);
    const first = this.columns[0];
    return html`<lit-material-data-table-row
      role="row"
      ?selected=${isSelected}
      aria-selected=${this.selectable ? (isSelected ? "true" : "false") : nothing}
      aria-level=${grouped ? entry.level : nothing}
      aria-setsize=${grouped ? entry.setsize : nothing}
      aria-posinset=${grouped ? entry.posinset : nothing}
      aria-rowindex=${this.pageSize > 0 ? rowIndex : nothing}
      data-key=${entry.key}
    >
      ${this.selectable
        ? html`<lit-material-data-table-cell role="gridcell" data-r=${r} data-c="0"
            ><input
              type="checkbox"
              class="select-box"
              data-focus
              tabindex=${this.tab(r, 0)}
              aria-label=${this.localize.term("dataTable.selectRow", "Select row {row}", {
                row: first ? rawText(entry.row[first.key]) : entry.key,
              })}
              .checked=${isSelected}
              @change=${(event: Event) => this.handleSelectRow(entry.key, (event.target as HTMLInputElement).checked)}
          /></lit-material-data-table-cell>`
        : nothing}
      ${this.columns.map((column, i) => {
        const c = i + this.offset;
        const value = entry.row[column.key];
        const isEditing = this.editing?.key === entry.key && this.editing.column === column.key;
        const indent = grouped && i === 0 ? `${16 + (entry.level - 1) * 24}px` : undefined;
        return html`<lit-material-data-table-cell
          role="gridcell"
          data-r=${r}
          data-c=${c}
          tabindex=${isEditing ? "-1" : this.tab(r, c)}
          ?numeric=${column.numeric ?? false}
          ?editing=${isEditing}
          aria-readonly=${anyEditable && !column.editable ? "true" : nothing}
          style=${cssProps({ paddingInlineStart: indent })}
          >${isEditing ? this.renderEditor(column, value) : this.display(value, entry.row, column)}</lit-material-data-table-cell
        >`;
      })}
    </lit-material-data-table-row>`;
  }

  private editorKind(column: DataGridColumn<R>): "text" | "number" | "select" {
    return column.editor ?? (column.numeric ? "number" : "text");
  }

  private renderEditor(column: DataGridColumn<R>, value: unknown) {
    const error = this.editError;
    const kind = this.editorKind(column);
    let editor;
    if (kind === "number") {
      editor = html`<lit-material-number-field
        variant="outlined"
        label=${column.header}
        .value=${typeof value === "number" ? value : isEmpty(value) ? null : Number(value)}
        error-text=${error}
      ></lit-material-number-field>`;
    } else if (kind === "select") {
      editor = html`<lit-material-select variant="outlined" label=${column.header} .value=${rawText(value)} ?error=${Boolean(error)} error-text=${error}>
        ${(column.options ?? []).map(optionOf).map(
          (option) => html`<lit-material-select-option value=${String(option.value)}>${option.label}</lit-material-select-option>`,
        )}
      </lit-material-select>`;
    } else {
      editor = html`<lit-material-text-field
        variant="outlined"
        label=${column.header}
        .value=${rawText(value)}
        ?error=${Boolean(error)}
        error-text=${error}
      ></lit-material-text-field>`;
    }
    return html`<div
      class="editor"
      data-key=${this.editing?.key ?? ""}
      data-column=${column.key}
      @keydown=${{ handleEvent: this.handleEditorKeydown, capture: true }} @focusout=${this.handleEditorFocusOut}>
      ${editor}
    </div>`;
  }

  override render() {
    const entries = this.pageEntries;
    const grouped = this.groupKeys.length > 0;
    const anyEditable = this.columns.some((column) => column.editable);
    const start = this.pageStart;
    return html`
      <lit-material-data-table
        part="table"
        role=${grouped ? "treegrid" : "grid"}
        aria-label=${this.label || this.localize.term("dataTable.grid", "Data grid")}
        aria-multiselectable=${this.selectable ? "true" : nothing}
        aria-rowcount=${this.pageSize > 0 ? this.model.visible.length + 1 : nothing}
        .sortKey=${this.sortKey}
        .sortDirection=${this.sortDirection}
        @sort-change=${this.handleSortChange}
        @keydown=${this.handleKeydown}
        @focusin=${this.handleFocusIn}
        @dblclick=${this.handleDoubleClick}
      >
        ${this.renderHeader()}
        ${entries.length === 0
          ? html`<lit-material-data-table-row role="row"
              ><lit-material-data-table-cell role="gridcell" class="empty"
                >${this.localize.term("dataTable.noRows", "No rows")}</lit-material-data-table-cell
              ></lit-material-data-table-row
            >`
          : entries.map((entry, i) =>
              entry.kind === "group"
                ? this.renderGroupRow(entry, i + 1, start + i + 2)
                : this.renderDataRow(entry, i + 1, start + i + 2, grouped, anyEditable),
            )}
      </lit-material-data-table>
      ${this.pageSize > 0
        ? html`<lit-material-data-table-pagination
            part="pagination"
            .page=${Math.min(Math.max(this.page, 0), this.pageCount - 1)}
            .pageSize=${this.pageSize}
            .total=${this.model.visible.length}
            .pageSizeOptions=${this.pageSizeOptions}
            @page-change=${this.handlePageChange}
          ></lit-material-data-table-pagination>`
        : nothing}
      <div class="visually-hidden" role="status" aria-live="polite">${this.announcement}</div>
    `;
  }

  // ---- Focus ------------------------------------------------------------------------------------------

  private cellAt(r: number, c: number): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>(`lit-material-data-table-cell[data-r="${r}"][data-c="${c}"]`) ?? null;
  }

  private focusTarget(r: number, c: number): HTMLElement | null {
    const cell = this.cellAt(r, c);
    return cell?.querySelector<HTMLElement>(":scope > [data-focus]") ?? cell;
  }

  private async moveFocus(r: number, c: number): Promise<void> {
    const rows = this.pageEntries.length;
    this.focusRow = Math.max(0, Math.min(r, rows));
    this.focusCol = Math.max(0, Math.min(c, this.colCount - 1));
    await this.updateComplete;
    this.focusTarget(this.focusRow, this.focusCol)?.focus();
  }

  private position(event: Event): { r: number; c: number; cell: HTMLElement } | null {
    for (const node of event.composedPath()) {
      if (node instanceof HTMLElement && node.localName === "lit-material-data-table-cell" && node.dataset.r !== undefined) {
        return { r: Number(node.dataset.r), c: Number(node.dataset.c), cell: node };
      }
    }
    return null;
  }

  private entryAt(r: number): Entry<R> | undefined {
    return r > 0 ? this.pageEntries[r - 1] : undefined;
  }

  private readonly handleFocusIn = (event: FocusEvent): void => {
    const pos = this.position(event);
    if (pos && (pos.r !== this.focusRow || pos.c !== this.focusCol)) {
      this.focusRow = pos.r;
      this.focusCol = pos.c;
    }
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (this.editing || event.defaultPrevented) return;
    const pos = this.position(event);
    if (!pos) return;
    const { r, c } = pos;
    const entry = this.entryAt(r);
    const target = event.composedPath()[0] as HTMLElement;
    const onControl = target instanceof HTMLButtonElement || target instanceof HTMLInputElement;
    const rtl = isRtl(this);
    const key = event.key === "ArrowRight" ? (rtl ? "Back" : "Forward") : event.key === "ArrowLeft" ? (rtl ? "Forward" : "Back") : event.key;
    const last = this.pageEntries.length;
    const toggleCol = this.offset;
    let handled = true;
    switch (key) {
      case "ArrowDown":
        void this.moveFocus(r + 1, c);
        break;
      case "ArrowUp":
        void this.moveFocus(r - 1, c);
        break;
      case "Forward":
        if (entry?.kind === "group" && c === toggleCol && !entry.expanded) this.toggleGroup(entry.id, true);
        else void this.moveFocus(r, c + 1);
        break;
      case "Back":
        if (entry?.kind === "group" && c === toggleCol && entry.expanded) this.toggleGroup(entry.id, false);
        else if (c > 0) void this.moveFocus(r, c - 1);
        else if (entry?.parent) void this.focusGroup(entry.parent.id);
        break;
      case "Home":
        void this.moveFocus(event.ctrlKey ? 0 : r, 0);
        break;
      case "End":
        void this.moveFocus(event.ctrlKey ? last : r, this.colCount - 1);
        break;
      case "PageDown":
        void this.moveFocus(r + 10, c);
        break;
      case "PageUp":
        void this.moveFocus(r - 10, c);
        break;
      case "Enter":
      case "F2":
      case " ": {
        if (onControl && key !== "F2") {
          handled = false;
          break;
        }
        const column = this.columns[c - this.offset];
        if (r === 0 && column?.sortable && key !== "F2") {
          pos.cell.dispatchEvent(new CustomEvent("sort-request", { bubbles: true, composed: true, detail: { sortKey: column.key } }));
        } else if (entry?.kind === "row" && column?.editable && key !== " ") {
          void this.startEdit(entry.key, column.key);
        } else {
          handled = false;
        }
        break;
      }
      default:
        handled = false;
    }
    if (handled) event.preventDefault();
  };

  private async focusGroup(id: string): Promise<void> {
    const index = this.pageEntries.findIndex((entry) => entry.kind === "group" && entry.id === id);
    if (index !== -1) await this.moveFocus(index + 1, this.offset);
  }

  private readonly handleDoubleClick = (event: MouseEvent): void => {
    if (this.editing) return;
    const pos = this.position(event);
    const entry = pos ? this.entryAt(pos.r) : undefined;
    const column = pos ? this.columns[pos.c - this.offset] : undefined;
    if (entry?.kind === "row" && column?.editable) void this.startEdit(entry.key, column.key);
  };

  // ---- Editing ----------------------------------------------------------------------------------------

  /** Opens the editor on a cell, by row key and column key. */
  async startEdit(rowKey: string, columnKey: string): Promise<void> {
    const column = this.column(columnKey);
    const index = this.pageEntries.findIndex((entry) => entry.kind === "row" && entry.key === rowKey);
    if (!column?.editable || index === -1) return;
    this.editing = { key: rowKey, column: columnKey };
    this.editError = "";
    this.focusRow = index + 1;
    this.focusCol = this.columns.indexOf(column) + this.offset;
    await this.updateComplete;
    const editor = this.editorElement;
    if (!editor) return;
    await (editor as LitElement).updateComplete;
    // number-field and select don't delegate focus from their host; focus the control inside.
    const inner = editor.shadowRoot?.querySelector<HTMLElement>("lit-material-text-field, [part~='trigger']");
    (inner ?? editor).focus();
  }

  private get editorElement(): HTMLElement | null {
    return this.shadowRoot?.querySelector<HTMLElement>(".editor > *") ?? null;
  }

  private readEditor(column: DataGridColumn<R>): { value: unknown; error: string } {
    const editor = this.editorElement as (HTMLElement & { value: unknown; validationMessage?: string }) | null;
    if (!editor) return { value: undefined, error: "" };
    const kind = this.editorKind(column);
    if (kind === "number") {
      const field = editor as HTMLElement & { value: number | null; checkValidity(): boolean; validationMessage: string };
      return { value: field.value, error: field.checkValidity() ? "" : field.validationMessage };
    }
    if (kind === "select") {
      const chosen = String(editor.value);
      const option = (column.options ?? []).map(optionOf).find((o) => String(o.value) === chosen);
      return { value: option ? option.value : chosen, error: "" };
    }
    return { value: editor.value, error: "" };
  }

  /** Commits the open editor. Returns `false` when it stays open (invalid, or a `cell-edit` listener prevented it). */
  commitEdit(): boolean {
    const editing = this.editing;
    if (!editing) return true;
    const column = this.column(editing.column);
    const index = this.rows.findIndex((row, i) => this.keyOf(row, i) === editing.key);
    const row = this.rows[index];
    if (!column || !row) {
      this.editing = undefined;
      return true;
    }
    const { value, error } = this.readEditor(column);
    if (error) return this.rejectEdit(error);
    const oldValue = row[column.key];
    const unchanged = Object.is(value, oldValue) || (isEmpty(value) && isEmpty(oldValue));
    if (!unchanged) {
      const detail: CellEditDetail<R> = { row, column: column.key, value, oldValue };
      const proceed = this.dispatchEvent(new CustomEvent("cell-edit", { bubbles: true, composed: true, cancelable: true, detail }));
      if (!proceed) return this.rejectEdit(detail.error || this.localize.term("dataTable.invalidValue", "Invalid value"));
      const updated = { ...row, [column.key]: detail.value } as R;
      const rows = [...this.rows];
      rows[index] = updated;
      this.rows = rows;
      this.dispatchEvent(
        new CustomEvent("edit-commit", {
          bubbles: true,
          composed: true,
          detail: { row: updated, previousRow: row, column: column.key, value: detail.value, oldValue },
        }),
      );
    }
    this.editing = undefined;
    this.editError = "";
    return true;
  }

  /** Closes the editor without applying it. */
  cancelEdit(): void {
    this.editing = undefined;
    this.editError = "";
  }

  private rejectEdit(message: string): false {
    this.editError = message;
    this.announce(message);
    return false;
  }

  private announce(message: string): void {
    // A repeated message still has to change the live region's text to be read again.
    this.announcement = this.announcement === message ? `${message} ` : message;
  }

  /** After an edit closes, focus that cell again (it may have moved, if the grid is sorted by it). */
  private async refocusEdited(editing: Editing): Promise<void> {
    await this.updateComplete;
    const index = this.pageEntries.findIndex((entry) => entry.kind === "row" && entry.key === editing.key);
    const column = this.column(editing.column);
    if (index === -1 || !column) {
      await this.moveFocus(this.focusRow, this.focusCol);
      return;
    }
    await this.moveFocus(index + 1, this.columns.indexOf(column) + this.offset);
  }

  /** The next (or previous) editable cell after a row and column, in reading order. */
  private nextEditable(editing: Editing, step: 1 | -1): Editing | undefined {
    const entries = this.pageEntries;
    const editable = this.columns.filter((column) => column.editable);
    if (!editable.length) return undefined;
    const cells: Editing[] = [];
    for (const entry of entries) {
      if (entry.kind !== "row") continue;
      for (const column of editable) cells.push({ key: entry.key, column: column.key });
    }
    const at = cells.findIndex((cell) => cell.key === editing.key && cell.column === editing.column);
    return at === -1 ? undefined : cells[at + step];
  }

  private readonly handleEditorKeydown = (event: KeyboardEvent): void => {
    const editing = this.editing;
    if (!editing) return;
    const editor = this.editorElement as (HTMLElement & { open?: boolean }) | null;
    if (editor?.localName === "lit-material-select" && editor.open) return; // the listbox has the keys
    if (event.key === "Enter" || event.key === "Tab") {
      event.preventDefault();
      event.stopPropagation();
      if (!this.commitEdit()) return;
      const next = event.key === "Tab" ? this.nextEditable(editing, event.shiftKey ? -1 : 1) : undefined;
      if (next) void this.updateComplete.then(() => this.startEdit(next.key, next.column));
      else void this.refocusEdited(editing);
    } else if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      this.cancelEdit();
      void this.refocusEdited(editing);
    }
  };

  private readonly handleEditorFocusOut = (event: FocusEvent): void => {
    const wrapper = event.currentTarget as HTMLElement;
    const next = event.relatedTarget as Node | null;
    const editing = this.editing;
    // Chrome fires focusout when the focused editor is removed; that's an edit already closed.
    if (!editing || wrapper.dataset.key !== editing.key || wrapper.dataset.column !== editing.column) return;
    if (next && wrapper.contains(next)) return;
    // Focus is inside the editor's own shadow tree (the select's popup options are its light DOM children).
    if (next && wrapper.firstElementChild?.shadowRoot?.contains(next)) return;
    this.commitEdit();
  };

  // ---- Sorting, selection, paging --------------------------------------------------------------------

  private readonly handleSortChange = (event: CustomEvent<{ sortKey: string; sortDirection: SortDirection }>): void => {
    event.stopPropagation();
    if (this.editing && !this.commitEdit()) {
      // The inner table already flipped its own state; put it back.
      const table = event.currentTarget as LitMaterialDataTable;
      table.sortKey = this.sortKey;
      table.sortDirection = this.sortDirection;
      return;
    }
    this.sortKey = event.detail.sortKey;
    this.sortDirection = event.detail.sortDirection;
    const column = this.column(this.sortKey);
    if (column) {
      this.announce(
        this.sortDirection === "descending"
          ? this.localize.term("dataTable.sortedDescending", "Sorted by {column}, descending", { column: column.header })
          : this.localize.term("dataTable.sortedAscending", "Sorted by {column}, ascending", { column: column.header }),
      );
    }
    this.dispatchEvent(
      new CustomEvent("sort-change", { bubbles: true, composed: true, detail: { sortKey: this.sortKey, sortDirection: this.sortDirection } }),
    );
  };

  private emitSelection(selected: string[]): void {
    this.selected = selected;
    this.dispatchEvent(new CustomEvent("selection-change", { bubbles: true, composed: true, detail: { selected } }));
  }

  private handleSelectRow(key: string, checked: boolean): void {
    const rest = this.selected.map(String).filter((k) => k !== key);
    this.emitSelection(checked ? [...rest, key] : rest);
  }

  private readonly handleSelectAll = (event: Event): void => {
    const checked = (event.target as HTMLInputElement).checked;
    this.emitSelection(checked ? this.model.all.map((entry) => entry.key) : []);
  };

  private readonly handlePageChange = (event: CustomEvent<{ page: number; pageSize: number }>): void => {
    event.stopPropagation();
    if (this.editing && !this.commitEdit()) return;
    this.page = event.detail.page;
    this.pageSize = event.detail.pageSize;
    this.focusRow = Math.min(this.focusRow, 1);
    this.dispatchEvent(new CustomEvent("page-change", { bubbles: true, composed: true, detail: { ...event.detail } }));
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-data-grid": LitMaterialDataGrid;
  }
}
