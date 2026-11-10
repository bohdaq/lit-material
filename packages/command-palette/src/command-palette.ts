import { html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { fuzzyMatch } from "./fuzzy.js";
import { styles } from "./command-palette-styles.js";
import "@lit-material/method-tag";

/** One thing the palette can find and choose. */
export interface CommandPaletteItem {
  /** Unique within `items`. */
  id: string;
  /** What the person reads and what the query matches. */
  label: string;
  /** The group it is listed under, e.g. "Commands". */
  section?: string;
  /** Quiet text at the end of the row, e.g. a folder. */
  hint?: string;
  /** More words the query matches (not shown). */
  keywords?: string[];
  /** Keys shown at the end of the row, e.g. `["⌘", "⇧", "R"]`. The palette doesn't bind them. */
  shortcut?: string[];
  /** Listed but can't be chosen. */
  disabled?: boolean;
  /** An HTTP or API method shown as a coloured tag before the label, e.g. `POST`, `WS`. */
  method?: string;
}

/** An extra key hint in the footer, e.g. `{ keys: ["⇥"], label: "ask agent" }`. */
export interface CommandPaletteHint {
  keys: string[];
  label: string;
}

export interface CommandPaletteSelectDetail {
  item: CommandPaletteItem;
  /** What was typed, prefix included. */
  query: string;
}

export interface CommandPaletteTabDetail {
  query: string;
}

interface Row {
  item: CommandPaletteItem;
  index: number;
  score: number;
  at: number[];
}

interface Group {
  section: string;
  rows: Row[];
}

let nextId = 0;

/** The element that has focus, looking inside shadow roots. */
function deepActiveElement(): HTMLElement | null {
  let el = document.activeElement as HTMLElement | null;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement;
  return el;
}

/**
 * A modal command palette: one search field over commands and items, fuzzy matched, grouped by section,
 * fully usable from the keyboard. Open it from your own shortcut (⌘K, Ctrl+K…) with `show()` or `open` —
 * the palette binds no global keys.
 *
 * Typing a prefix from `prefixes` (e.g. `>` for "Commands") limits the list to that section. Arrow keys,
 * Home and End move, Enter chooses (`select`), Escape or a click outside closes (`close`). Tab fires a
 * cancelable `tab` with the query, for handing it to something else such as an assistant; focus stays in
 * the palette while it is open and goes back where it was when it closes.
 *
 * Built on the native `<dialog>` (top layer, inert page behind) with the ARIA combobox pattern: the field
 * is a combobox controlling a listbox, and the active row is its `aria-activedescendant`.
 *
 * @element lit-material-command-palette
 *
 * @fires select - An item was chosen. `detail`: `{ item, query }`. The palette closes after it.
 * @fires close - The palette closed by itself (Escape, a click outside, after `select`).
 * @fires tab - Tab was pressed. `detail`: `{ query }`. Cancelable; the palette stays open either way.
 *
 * @cssprop --lit-material-command-palette-width - The panel's width (default `min(640px, 100vw - 32px)`).
 * @cssprop --lit-material-command-palette-max-height - The list's height limit (default `min(60vh, 420px)`).
 * @cssprop --lit-material-command-palette-top - Distance from the top of the window (default `12vh`).
 * @cssprop --lit-material-command-palette-preview-width - The panel's width while a preview shows (default `min(960px, 100vw - 32px)`).
 *
 * @csspart dialog - The native `<dialog>` panel.
 * @csspart input - The search field.
 * @csspart listbox - The list of results.
 * @csspart option - Each result row.
 * @csspart footer - The key hints.
 * @csspart preview - The preview pane beside the list.
 */
@customElement("lit-material-command-palette")
export class LitMaterialCommandPalette extends LitElement {
  static override styles = styles;

  /** Whether the palette is showing. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** Everything the palette can find, in the order sections and rows are listed. */
  @property({ type: Array }) items: CommandPaletteItem[] = [];

  /** The field's placeholder. Unset: "Search or run a command…", translated. */
  @property() placeholder = "";

  /** The palette's accessible name. Unset: "Command palette", translated. */
  @property() label = "";

  /** Prefixes that limit the list to one section, e.g. `{ ">": "Commands", "@": "Environments" }`. */
  @property({ type: Object }) prefixes: Record<string, string> = {};

  /**
   * Renders a preview of the active item in a pane beside the list (anything Lit can render: a template,
   * a string, a node). Return `nothing`, `null` or `undefined` for no preview. Unset: no pane. The pane
   * hides below 720px of width.
   */
  @property({ attribute: false }) preview?: (item: CommandPaletteItem) => unknown;

  /** Extra key hints after the built-in ones in the footer. */
  @property({ type: Array }) hints: CommandPaletteHint[] = [];

  @state() private query = "";
  @state() private active = 0;

  @query("dialog") private dialogElement?: HTMLDialogElement;
  @query("input") private inputElement?: HTMLInputElement;

  private readonly localize = new LocalizeController(this);
  private readonly uid = `lmcp${++nextId}`;
  private returnFocus: HTMLElement | null = null;

  /** Opens the palette with an empty query. */
  show(): void {
    this.open = true;
  }

  /** Closes the palette (no `close` event: you closed it). */
  hide(): void {
    this.open = false;
  }

  /** The section and text a query searches: a known prefix limits the section. */
  private parse(): { section: string | null; text: string } {
    for (const [prefix, section] of Object.entries(this.prefixes)) {
      if (prefix && this.query.startsWith(prefix)) return { section, text: this.query.slice(prefix.length).trim() };
    }
    return { section: null, text: this.query.trim() };
  }

  private groups(): Group[] {
    const { section, text } = this.parse();
    const order: string[] = [];
    const bySection = new Map<string, Row[]>();
    this.items.forEach((item, index) => {
      const name = item.section ?? "";
      if (section !== null && name !== section) return;
      let match = fuzzyMatch(text, item.label);
      if (!match && item.keywords?.length) {
        const best = item.keywords.map((k) => fuzzyMatch(text, k)).filter((m) => m !== null).sort((a, b) => b.score - a.score)[0];
        if (best) match = { score: best.score - 1, at: [] };
      }
      if (!match) return;
      if (!bySection.has(name)) {
        bySection.set(name, []);
        order.push(name);
      }
      bySection.get(name)!.push({ item, index, score: match.score, at: match.at });
    });
    return order.map((name) => {
      const rows = bySection.get(name)!;
      if (text) rows.sort((a, b) => b.score - a.score || a.index - b.index);
      return { section: name, rows };
    });
  }

  private rows(): Row[] {
    return this.groups().flatMap((g) => g.rows);
  }

  private optionId(row: Row): string {
    return `${this.uid}-o${row.index}`;
  }

  protected override willUpdate(changed: PropertyValues): void {
    if (changed.has("open") && this.open) {
      this.query = "";
      this.active = 0;
    }
    if (changed.has("open") || changed.has("items") || changed.has("query")) {
      const rows = this.rows();
      if (this.active >= rows.length || rows[this.active]?.item.disabled) this.active = this.firstEnabled(rows, 0, 1);
    }
  }

  protected override updated(changed: PropertyValues): void {
    const dialog = this.dialogElement;
    if (changed.has("open") && dialog) {
      if (this.open && !dialog.open) {
        this.returnFocus = deepActiveElement();
        dialog.showModal();
        this.inputElement?.focus();
      } else if (!this.open && dialog.open) {
        dialog.close();
        const target = this.returnFocus;
        this.returnFocus = null;
        if (target?.isConnected) target.focus();
      }
    }
    if (this.open) {
      this.renderRoot.querySelector<HTMLElement>('[role="option"][aria-selected="true"]')?.scrollIntoView?.({ block: "nearest" });
    }
  }

  private firstEnabled(rows: Row[], from: number, step: 1 | -1): number {
    for (let i = from; i >= 0 && i < rows.length; i += step) if (!rows[i]!.item.disabled) return i;
    return rows.findIndex((r) => !r.item.disabled) === -1 ? 0 : this.active;
  }

  private dismiss(): void {
    if (!this.open) return;
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  private choose(row: Row | undefined): void {
    if (!row || row.item.disabled) return;
    const detail: CommandPaletteSelectDetail = { item: row.item, query: this.query };
    this.dispatchEvent(new CustomEvent("select", { detail, bubbles: true, composed: true }));
    this.dismiss();
  }

  private onKeyDown(event: KeyboardEvent): void {
    const rows = this.rows();
    const move = (to: number) => {
      event.preventDefault();
      this.active = to;
    };
    switch (event.key) {
      case "ArrowDown":
        return move(this.firstEnabled(rows, this.active + 1, 1));
      case "ArrowUp":
        return move(this.firstEnabled(rows, this.active - 1, -1));
      case "Home":
        if (event.ctrlKey || event.metaKey || !this.query) return move(this.firstEnabled(rows, 0, 1));
        return;
      case "End":
        if (event.ctrlKey || event.metaKey || !this.query) return move(this.firstEnabled(rows, rows.length - 1, -1));
        return;
      case "Enter":
        event.preventDefault();
        return this.choose(rows[this.active]);
      case "Escape":
        event.preventDefault();
        return this.dismiss();
      case "Tab":
        // Focus stays in the palette; plain Tab is offered to the app.
        event.preventDefault();
        if (!event.shiftKey) {
          const detail: CommandPaletteTabDetail = { query: this.query };
          this.dispatchEvent(new CustomEvent("tab", { detail, bubbles: true, composed: true, cancelable: true }));
        }
        return;
    }
  }

  private onCancel(event: Event): void {
    event.preventDefault();
    this.dismiss();
  }

  private onDialogClick(event: MouseEvent): void {
    // A click on the dialog itself (not its panel) is a click on the backdrop.
    if (event.target === this.dialogElement) this.dismiss();
  }

  private highlight(row: Row) {
    const text = row.item.label;
    if (!row.at.length) return text;
    const hit = new Set(row.at);
    const parts: unknown[] = [];
    let run = "";
    let inHit = false;
    for (let i = 0; i < text.length; i++) {
      const h = hit.has(i);
      if (h !== inHit && run) {
        parts.push(inHit ? html`<mark>${run}</mark>` : run);
        run = "";
      }
      inHit = h;
      run += text[i];
    }
    if (run) parts.push(inHit ? html`<mark>${run}</mark>` : run);
    return parts;
  }

  override render() {
    const groups = this.open ? this.groups() : [];
    const rows = groups.flatMap((g) => g.rows);
    const active = rows[this.active];
    const listId = `${this.uid}-list`;
    const shown = this.open && active && this.preview ? this.preview(active.item) : undefined;
    const hasPreview = shown !== undefined && shown !== null && shown !== nothing;
    const name = this.label || this.localize.term("commandPalette.label", "Command palette");
    return html`
      <dialog part="dialog" aria-label=${name} @cancel=${this.onCancel} @click=${this.onDialogClick}>
        <div class="panel ${hasPreview ? "with-preview" : ""}">
          <div class="field">
            <svg class="search" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7"></circle><path d="M20 20l-3.5-3.5"></path></svg>
            <input
              part="input"
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              aria-label=${name}
              aria-expanded=${this.open && rows.length ? "true" : "false"}
              aria-controls=${listId}
              aria-autocomplete="list"
              aria-activedescendant=${active ? this.optionId(active) : nothing}
              placeholder=${this.placeholder || this.localize.term("commandPalette.placeholder", "Search or run a command…")}
              .value=${this.query}
              @input=${(e: Event) => {
                this.query = (e.target as HTMLInputElement).value;
                this.active = 0;
              }}
              @keydown=${this.onKeyDown}
            />
          </div>
          <div class="body">
          <div class="list" id=${listId} role="listbox" part="listbox" aria-label=${this.localize.term("commandPalette.results", "Results")}>
            ${groups.map(
              (g) => html`<div role="group" class="group" aria-label=${g.section || nothing}>
                ${g.section ? html`<div class="section" aria-hidden="true">${g.section}</div>` : nothing}
                ${g.rows.map((row) => {
                  const i = rows.indexOf(row);
                  return html`<div
                    class="option"
                    part="option"
                    role="option"
                    id=${this.optionId(row)}
                    aria-selected=${i === this.active ? "true" : "false"}
                    aria-disabled=${row.item.disabled ? "true" : nothing}
                    @mousemove=${() => {
                      if (!row.item.disabled && this.active !== i) this.active = i;
                    }}
                    @click=${() => this.choose(row)}
                  >
                    ${row.item.method ? html`<lit-material-method-tag class="method" part="method" method=${row.item.method}></lit-material-method-tag>` : nothing}
                    <span class="label">${this.highlight(row)}</span>
                    ${row.item.hint ? html`<span class="hint">${row.item.hint}</span>` : nothing}
                    ${row.item.shortcut?.length
                      ? html`<span class="keys">${row.item.shortcut.map((k) => html`<kbd>${k}</kbd>`)}</span>`
                      : nothing}
                  </div>`;
                })}
              </div>`,
            )}
            ${this.open && !rows.length ? html`<div class="empty" role="status">${this.localize.term("commandPalette.empty", "No results")}</div>` : nothing}
          </div>
          ${hasPreview ? html`<div class="preview" part="preview">${shown}</div>` : nothing}
          </div>
          <div class="footer" part="footer" aria-hidden="true">
            <span><kbd>↑</kbd><kbd>↓</kbd> ${this.localize.term("commandPalette.move", "move")}</span>
            <span><kbd>↵</kbd> ${this.localize.term("commandPalette.choose", "choose")}</span>
            <span><kbd>esc</kbd> ${this.localize.term("commandPalette.dismiss", "close")}</span>
            ${this.hints.map((h) => html`<span>${h.keys.map((k) => html`<kbd>${k}</kbd>`)} ${h.label}</span>`)}
          </div>
        </div>
      </dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-command-palette": LitMaterialCommandPalette;
  }
}
