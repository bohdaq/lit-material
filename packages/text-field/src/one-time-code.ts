import { css, html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";

let instanceCount = 0;

/**
 * A one-time code: the digits from a sign-in or confirmation mail, an
 * authenticator app or a text message. One native input underneath a row of
 * boxes, so typing, paste, deleting, the phone's code suggestion
 * (`autocomplete="one-time-code"`) and screen readers all work as in a plain
 * field. Spaces and dashes in a pasted code are dropped.
 *
 * Form-associated: submits `value` under `name`; `required` and an incomplete
 * code make the form invalid. Enter submits the form.
 *
 * @element lit-material-one-time-code
 *
 * @csspart cells - The row of boxes.
 * @csspart cell - Each box.
 * @csspart supporting - The supporting or error text.
 *
 * @fires input - Bubbles while the code is typed.
 * @fires complete - When the last character is entered; `detail` is `{ value }`. Submit or verify here.
 */
@customElement("lit-material-one-time-code")
export class LitMaterialOneTimeCode extends LitElement {
  static override styles = css`
    :host {
      display: inline-block;
      font-family: var(--md-sys-typescale-body-large-font, inherit);
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    :host([hidden]) {
      display: none;
    }
    label {
      display: block;
      margin-block-end: 8px;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    .field {
      position: relative;
      width: fit-content;
    }
    .cells {
      display: flex;
      gap: 8px;
    }
    .cell {
      display: grid;
      place-items: center;
      width: 44px;
      height: 52px;
      box-sizing: border-box;
      border: 1px solid var(--md-sys-color-outline, light-dark(#79747e, #938f99));
      border-radius: var(--md-sys-shape-corner-small, 8px);
      font-family: var(--lit-material-one-time-code-font, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
      font-size: 1.5rem;
      font-variant-numeric: tabular-nums;
    }
    .cell.gap {
      margin-inline-start: 12px;
    }
    :host(:focus-within) .cell.active {
      border: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    :host([error]) .cell,
    .invalid .cell {
      border-color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    }
    :host([disabled]) {
      opacity: 0.38;
    }
    /* The real input covers the boxes, its own text and caret invisible. */
    input {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      padding: 0;
      border: 0;
      margin: 0;
      opacity: 0;
      font-size: 16px; /* no zoom on focus in iOS Safari */
      color: transparent;
      caret-color: transparent;
      background: transparent;
      cursor: text;
    }
    .supporting {
      margin-block-start: 4px;
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    :host([error]) .supporting {
      color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    }
  `;

  static override shadowRootOptions: ShadowRootInit = { ...LitElement.shadowRootOptions, delegatesFocus: true };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  /** The code typed so far. */
  @property() value = "";

  /** How many characters the code has. */
  @property({ type: Number }) length = 6;

  /** Letters as well as digits (upper-cased as typed). Digits only by default. */
  @property({ type: Boolean }) alphanumeric = false;

  /** A small gap after this many boxes, e.g. `3` for "123 456". `0` for none. */
  @property({ type: Number, attribute: "group-size" }) groupSize = 0;

  /** Visible label above the boxes. */
  @property() label = "";

  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ attribute: "error-text" }) errorText = "";
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property() name = "";

  @query("input") private readonly inputElement?: HTMLInputElement;
  @state() private caret = 0;

  private readonly internals: ElementInternals;
  private readonly localize = new LocalizeController(this);
  private readonly ids = ++instanceCount;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncInternals();
  }

  protected override firstUpdated(): void {
    this.syncInternals();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("value") || changed.has("length") || changed.has("required")) this.syncInternals();
  }

  /** `value` cleaned to the allowed characters and cut to `length`. */
  private clean(text: string): string {
    const allowed = this.alphanumeric ? /[^0-9A-Z]/g : /[^0-9]/g;
    return text.toUpperCase().replace(allowed, "").slice(0, this.length);
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.value);
    const short = this.value.length > 0 && this.value.length < this.length;
    const missing = this.required && this.value === "";
    if (short || missing) {
      const message = missing
        ? this.localize.term("oneTimeCode.required", "Enter the code")
        : this.localize.term("oneTimeCode.incomplete", "Enter all {length} characters", { length: this.length });
      const flags = missing ? { valueMissing: true } : { tooShort: true };
      if (this.inputElement) this.internals.setValidity(flags, message, this.inputElement);
      else this.internals.setValidity(flags, message);
    } else {
      this.internals.setValidity({});
    }
  }

  override render() {
    const chars = [...this.value];
    const active = Math.min(this.caret, this.length - 1);
    const message = this.error ? this.errorText : this.supportingText;
    const labelId = `lit-material-one-time-code-label-${this.ids}`;
    const supportingId = `lit-material-one-time-code-supporting-${this.ids}`;
    const name = this.label || this.localize.term("oneTimeCode.label", "Code");
    return html`
      ${this.label ? html`<label id=${labelId} for="input">${this.label}</label>` : nothing}
      <div class="field">
        <div class="cells" part="cells" aria-hidden="true">
          ${Array.from({ length: this.length }, (_, i) => html`<span
              part="cell"
              class="cell ${i === active ? "active" : ""} ${this.groupSize > 0 && i > 0 && i % this.groupSize === 0 ? "gap" : ""}"
              >${chars[i] ?? ""}</span
            >`)}
        </div>
        <input
          id="input"
          .value=${this.value}
          ?disabled=${this.disabled}
          ?required=${this.required}
          name=${this.name || nothing}
          autocomplete="one-time-code"
          inputmode=${this.alphanumeric ? "text" : "numeric"}
          autocapitalize=${this.alphanumeric ? "characters" : nothing}
          spellcheck="false"
          maxlength=${this.length * 2}
          aria-label=${this.label ? nothing : name}
          aria-labelledby=${this.label ? labelId : nothing}
          aria-describedby=${message ? supportingId : nothing}
          aria-invalid=${this.error ? "true" : nothing}
          @input=${this.handleInput}
          @keydown=${this.handleKeydown}
          @keyup=${this.trackCaret}
          @click=${this.trackCaret}
          @focus=${this.trackCaret}
          @select=${this.trackCaret}
        />
      </div>
      ${message ? html`<div class="supporting" part="supporting" id=${supportingId}>${message}</div>` : nothing}
    `;
  }

  private handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const before = this.value;
    const cleaned = this.clean(input.value);
    if (input.value !== cleaned) input.value = cleaned;
    this.value = cleaned;
    this.caret = cleaned.length;
    // Valid before `complete` fires, so a handler can submit the form at once.
    this.syncInternals();
    if (cleaned.length === this.length && before !== cleaned) {
      this.dispatchEvent(new CustomEvent("complete", { detail: { value: cleaned }, bubbles: true, composed: true }));
    }
  }

  private handleKeydown(event: KeyboardEvent): void {
    if (event.key !== "Enter" || event.isComposing) return;
    const form = this.internals.form;
    if (!form) return;
    event.preventDefault();
    form.requestSubmit();
  }

  private trackCaret(): void {
    this.caret = this.inputElement?.selectionStart ?? this.value.length;
  }

  /** Empties the code and focuses the field, e.g. after the server refused it. */
  clear(): void {
    this.value = "";
    this.caret = 0;
    this.focus();
  }

  formResetCallback(): void {
    this.value = "";
    this.caret = 0;
  }

  formDisabledCallback(disabled: boolean): void {
    this.disabled = disabled;
  }

  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-one-time-code": LitMaterialOneTimeCode;
  }
}
