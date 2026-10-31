import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import "@lit-material/button";
import "@lit-material/icon-button";
import "@lit-material/text-field";

export interface KeyValueEntry {
  key: string;
  value: string;
}

// Material icons close, add (Apache 2.0).
const removeIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true">
  <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
</svg>`;
const addIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>`;

/**
 * Parses pasted `KEY=value` (or `key: value`) lines, as from a `.env` file or
 * `kubectl get --show-labels`. Blank lines and `#` comments are skipped, a
 * leading `export ` is dropped and one pair of matching quotes around the
 * value is removed. Returns `[]` when the text isn't in that shape.
 */
export function parseKeyValues(text: string): KeyValueEntry[] {
  const lines = text
    .split(/\r?\n|,(?=[^=,\s]+=)/)
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith("#"));
  const entries: KeyValueEntry[] = [];
  for (const line of lines) {
    const match = /^(?:export\s+)?([^=:\s][^=:]*?)\s*(?:=|:\s)\s*(.*)$/.exec(line);
    if (!match) return [];
    let value = match[2] ?? "";
    if (value.length >= 2 && /^(["']).*\1$/.test(value)) value = value.slice(1, -1);
    entries.push({ key: match[1] ?? "", value });
  }
  return entries;
}

interface Row extends KeyValueEntry {
  id: number;
}

let nextRowId = 0;

/**
 * Edits an ordered list of key/value pairs: labels, annotations,
 * environment variables, headers. Each row is a key field, a value field
 * and a remove button; "Add" appends a row and focuses its key.
 *
 * It flags a duplicate key, a value without a key and, with `key-pattern`,
 * a key that doesn't match (e.g. a Kubernetes label key). `valid` and
 * `checkValidity()` report it, so a form can refuse to submit.
 *
 * Pasting several `KEY=value` lines (a `.env` file) into a key field turns
 * them into rows.
 *
 * Rows with an empty key and value are left out of `entries` and the
 * `change` event, so an added, untouched row costs nothing.
 *
 * @element lit-material-key-value-editor
 *
 * @fires change - After any edit, add or remove; `detail` is `{ entries }`.
 *
 * @csspart row - One key/value row.
 * @csspart add - The add button.
 */
@customElement("lit-material-key-value-editor")
export class LitMaterialKeyValueEditor extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    :host([hidden]) {
      display: none;
    }
    .rows {
      display: grid;
      gap: 8px;
      margin-block-end: 8px;
    }
    .row {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(0, 1.5fr) auto;
      align-items: start;
      gap: 8px;
    }
    .row > lit-material-text-field {
      --lit-material-text-field-min-width: 0;
      width: 100%;
    }
    lit-material-icon-button {
      margin-block-start: 8px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
    .add svg {
      width: 18px;
      height: 18px;
    }
    @media (max-width: 480px) {
      .row {
        grid-template-columns: minmax(0, 1fr) auto;
      }
      .row > lit-material-text-field:nth-child(2) {
        grid-row: 2;
      }
    }
  `;

  /** Label of the key fields. */
  @property({ attribute: "key-label" }) keyLabel = "Key";

  /** Label of the value fields. */
  @property({ attribute: "value-label" }) valueLabel = "Value";

  /** Label of the add button. */
  @property({ attribute: "add-label" }) addLabel = "Add";

  /** A regular expression (whole key) every key must match. */
  @property({ attribute: "key-pattern" }) keyPattern = "";

  /** Error shown when a key doesn't match `key-pattern`. */
  @property({ attribute: "key-pattern-message" }) keyPatternMessage = "Invalid key";

  /** Show values as password fields, e.g. secrets. */
  @property({ type: Boolean, attribute: "mask-values" }) maskValues = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean }) readonly = false;

  private rows: Row[] = [];

  /** The pairs, in order, without blank rows. Setting it replaces every row. */
  @property({ attribute: false })
  get entries(): KeyValueEntry[] {
    return this.rows.filter((r) => r.key || r.value).map(({ key, value }) => ({ key, value }));
  }
  set entries(entries: readonly KeyValueEntry[]) {
    const old = this.entries;
    this.rows = entries.map(({ key, value }) => ({ id: ++nextRowId, key, value }));
    this.requestUpdate("entries", old);
  }

  /** The pairs as an object; with duplicate keys the last one wins. */
  toObject(): Record<string, string> {
    return Object.fromEntries(this.entries.map((e) => [e.key, e.value]));
  }

  /** `true` when no row has an error. */
  get valid(): boolean {
    return this.rows.every((row) => !this.keyError(row));
  }

  /** Same as `valid`; focuses the first bad key when there is one. */
  checkValidity(): boolean {
    const bad = this.rows.find((row) => this.keyError(row));
    if (!bad) return true;
    this.fieldFor(bad.id)?.focus();
    return false;
  }

  /** Appends a blank row and focuses its key field. */
  async addRow(): Promise<void> {
    const row = { id: ++nextRowId, key: "", value: "" };
    this.rows = [...this.rows, row];
    this.requestUpdate();
    await this.updateComplete;
    this.fieldFor(row.id)?.focus();
  }

  private fieldFor(id: number): HTMLElement | null {
    return this.renderRoot.querySelector<HTMLElement>(`[data-row="${id}"] .key`);
  }

  private get keyRegExp(): RegExp | undefined {
    try {
      return new RegExp(`^(?:${this.keyPattern})$`, "u");
    } catch {
      return undefined; // A broken pattern accepts nothing rather than throwing on every render.
    }
  }

  private keyError(row: Row): string {
    if (!row.key) return row.value ? "Key required" : "";
    if (this.rows.some((other) => other !== row && other.key === row.key)) return "Duplicate key";
    if (this.keyPattern && !this.keyRegExp?.test(row.key)) return this.keyPatternMessage;
    return "";
  }

  private emit(): void {
    this.requestUpdate();
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { entries: this.entries } }));
  }

  private edit(row: Row, field: "key" | "value", event: Event): void {
    event.stopPropagation();
    row[field] = (event.target as HTMLInputElement).value;
    this.emit();
  }

  private async removeRow(row: Row): Promise<void> {
    const index = this.rows.indexOf(row);
    this.rows = this.rows.filter((r) => r !== row);
    this.emit();
    await this.updateComplete;
    // Keep focus in the list: the next row's remove button, else the previous one's, else Add.
    const buttons = this.renderRoot.querySelectorAll<HTMLElement>(".remove");
    (buttons[Math.min(index, buttons.length - 1)] ?? this.renderRoot.querySelector<HTMLElement>(".add"))?.focus();
  }

  private paste(row: Row, event: ClipboardEvent): void {
    // A plain key (no "=" or ": ") pastes as usual.
    const pasted = parseKeyValues(event.clipboardData?.getData("text/plain") ?? "");
    if (pasted.length === 0) return;
    event.preventDefault();
    const index = this.rows.indexOf(row);
    const replace = !row.key && !row.value ? 1 : 0;
    const added = pasted.map((e) => ({ id: ++nextRowId, ...e }));
    this.rows = [...this.rows.slice(0, index + 1 - replace), ...added, ...this.rows.slice(index + 1)];
    this.emit();
  }

  override render() {
    const locked = this.disabled || this.readonly;
    return html`
      ${this.rows.length
        ? html`<div class="rows">
            ${repeat(
              this.rows,
              (row) => row.id,
              (row, i) => {
                const error = this.keyError(row);
                return html`<div part="row" class="row" data-row=${row.id}>
                  <lit-material-text-field
                    class="key"
                    variant="outlined"
                    label=${this.keyLabel}
                    autocomplete="off"
                    spellcheck="false"
                    .value=${row.key}
                    ?error=${Boolean(error)}
                    error-text=${error}
                    ?disabled=${this.disabled}
                    ?readonly=${this.readonly}
                    @input=${(e: Event) => this.edit(row, "key", e)}
                    @change=${(e: Event) => e.stopPropagation()}
                    @paste=${(e: ClipboardEvent) => this.paste(row, e)}
                  ></lit-material-text-field>
                  <lit-material-text-field
                    variant="outlined"
                    label=${this.valueLabel}
                    type=${this.maskValues ? "password" : "text"}
                    autocomplete="off"
                    spellcheck="false"
                    .value=${row.value}
                    ?disabled=${this.disabled}
                    ?readonly=${this.readonly}
                    @input=${(e: Event) => this.edit(row, "value", e)}
                    @change=${(e: Event) => e.stopPropagation()}
                  ></lit-material-text-field>
                  ${locked
                    ? nothing
                    : html`<lit-material-icon-button
                        class="remove"
                        aria-label=${row.key ? `Remove ${row.key}` : `Remove row ${i + 1}`}
                        @click=${() => void this.removeRow(row)}
                        ><span slot="icon">${removeIcon}</span></lit-material-icon-button
                      >`}
                </div>`;
              },
            )}
          </div>`
        : nothing}
      ${locked
        ? nothing
        : html`<lit-material-button part="add" class="add" variant="text" @click=${() => void this.addRow()}>
            <span slot="icon">${addIcon}</span>${this.addLabel}
          </lit-material-button>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-key-value-editor": LitMaterialKeyValueEditor;
  }
}
