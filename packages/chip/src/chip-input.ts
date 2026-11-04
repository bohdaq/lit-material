import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import "./chip.js";

let nextId = 0;

/**
 * A field that turns what you type into chips: tags, labels, email
 * addresses, allowed hosts. Enter or a comma adds the typed value; pasting
 * several values separated by commas, spaces or new lines adds them all.
 * Each chip has a remove button, and Backspace in the empty field removes
 * the last one.
 *
 * `validator` refuses a value with a message (shown under the field, the
 * text stays for fixing); duplicates are refused unless `allow-duplicates`.
 *
 * @element lit-material-chip-input
 *
 * @fires change - After a value is added or removed; `detail: { values }`.
 *
 * @csspart field - The box holding the chips and the input.
 * @csspart input - The text input.
 */
@customElement("lit-material-chip-input")
export class LitMaterialChipInput extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
    }
    :host([hidden]) {
      display: none;
    }
    label {
      display: block;
      margin-block-end: 4px;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    }
    .field {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 6px;
      box-sizing: border-box;
      min-height: 56px;
      padding: 8px 12px;
      border: 1px solid var(--md-sys-color-outline, light-dark(#79747e, #938f99));
      border-radius: var(--md-sys-shape-corner-extra-small, 4px);
      cursor: text;
    }
    .field:focus-within {
      border-color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      box-shadow: inset 0 0 0 1px var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    :host([invalid]) .field {
      border-color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    }
    :host([disabled]) .field {
      opacity: 0.38;
      cursor: default;
    }
    input {
      flex: 1;
      min-width: 8ch;
      padding: 4px 0;
      border: 0;
      outline: none;
      background: transparent;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
      font: inherit;
      font-size: var(--md-sys-typescale-body-large-size, 1rem);
    }
    .supporting {
      margin: 4px 16px 0;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    }
    :host([invalid]) .supporting {
      color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    }
    .sr {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `;

  /** The chips' values. */
  @property({ type: Array }) values: string[] = [];

  /** Visible label above the field; also names the input. */
  @property() label = "";

  @property() placeholder = "";

  /** Help under the field, replaced by an error while there is one. */
  @property({ attribute: "supporting-text" }) supportingText = "";

  /** Refuses a value: return a message, or `""` to accept. */
  @property({ attribute: false }) validator?: (value: string) => string;

  @property({ type: Boolean, attribute: "allow-duplicates" }) allowDuplicates = false;

  /** Most chips allowed; `0` for no limit. */
  @property({ type: Number }) max = 0;

  @property({ type: Boolean, reflect: true }) disabled = false;

  /** Set while the typed value was refused; reflected. */
  @property({ type: Boolean, reflect: true }) invalid = false;

  @state() private error = "";

  @state() private announcement = "";

  @query("input") private readonly input!: HTMLInputElement;

  private readonly uid = `chip-input-${++nextId}`;

  private readonly localize = new LocalizeController(this);

  override focus(options?: FocusOptions): void {
    this.input?.focus(options);
  }

  /** Adds `raw` (trimmed); returns the refusal message, `""` on success. */
  add(raw: string): string {
    const value = raw.trim();
    if (!value) return "";
    let message = "";
    if (this.max && this.values.length >= this.max) message = this.localize.term("chipInput.max", "At most {max}", { max: this.max });
    else if (!this.allowDuplicates && this.values.includes(value)) message = this.localize.term("chipInput.duplicate", "{value} is already added", { value });
    else message = this.validator?.(value) ?? "";
    this.setError(message);
    if (message) return message;
    this.values = [...this.values, value];
    this.announcement = this.localize.term("chipInput.added", "{value} added", { value });
    this.emit();
    return "";
  }

  /** Removes the chip at `index`. */
  removeAt(index: number): void {
    const value = this.values[index];
    if (value === undefined) return;
    this.values = this.values.filter((_, i) => i !== index);
    this.announcement = this.localize.term("chipInput.removed", "{value} removed", { value });
    this.emit();
  }

  private setError(message: string): void {
    this.error = message;
    this.invalid = Boolean(message);
  }

  private emit(): void {
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, composed: true, detail: { values: this.values } }));
  }

  private commitTyped(): void {
    if (!this.add(this.input.value)) this.input.value = "";
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" || event.key === ",") {
      if (!this.input.value.trim()) return;
      event.preventDefault();
      this.commitTyped();
    } else if (event.key === "Backspace" && this.input.value === "" && this.values.length) {
      event.preventDefault();
      this.removeAt(this.values.length - 1);
    }
  }

  private onPaste(event: ClipboardEvent): void {
    const text = event.clipboardData?.getData("text/plain") ?? "";
    const parts = text.split(/[\s,;]+/).filter(Boolean);
    if (parts.length < 2) return;
    event.preventDefault();
    const refused = parts.filter((part) => this.add(part));
    // Leave what was refused in the field, to fix.
    this.input.value = refused.join(", ");
    if (refused.length) {
      this.setError(
        this.localize.term(
          "chipInput.notAdded",
          { one: "{count} not added: {values}", other: "{count} not added: {values}" },
          { count: refused.length, values: refused.join(", ") },
        ),
      );
    }
  }

  private onInput(): void {
    if (this.error) this.setError("");
  }

  override render() {
    const message = this.error || this.supportingText;
    return html`
      ${this.label ? html`<label for=${this.uid}>${this.label}</label>` : nothing}
      <div part="field" class="field" @click=${(e: Event) => e.target === e.currentTarget && this.focus()}>
        ${repeat(
          this.values,
          (value, i) => `${i}:${value}`,
          (value, i) => html`<lit-material-chip
            variant="input"
            removable
            remove-label=${this.localize.term("chipInput.removeValue", "Remove {value}", { value })}
            ?disabled=${this.disabled}
            @remove=${(e: Event) => {
              e.preventDefault();
              this.removeAt(i);
              this.focus();
            }}
            >${value}</lit-material-chip
          >`,
        )}
        <input
          part="input"
          id=${this.uid}
          type="text"
          autocomplete="off"
          spellcheck="false"
          placeholder=${this.values.length ? "" : this.placeholder}
          ?disabled=${this.disabled}
          aria-invalid=${this.invalid ? "true" : "false"}
          aria-describedby=${message ? `${this.uid}-msg` : nothing}
          @keydown=${this.onKeyDown}
          @paste=${this.onPaste}
          @input=${this.onInput}
          @blur=${() => this.input.value.trim() && this.commitTyped()}
        />
      </div>
      ${message ? html`<div class="supporting" id="${this.uid}-msg">${message}</div>` : nothing}
      <div class="sr" role="status">${this.announcement}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-chip-input": LitMaterialChipInput;
  }
}
