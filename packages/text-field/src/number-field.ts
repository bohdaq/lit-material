import { css, html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "@lit-material/icon-button";
import "./text-field.js";
import type { TextFieldVariant } from "./text-field.js";

// Material icons remove, add (Apache 2.0).
const minusIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13H5v-2h14v2z"></path></svg>`;
const plusIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path></svg>`;

/** Decimal places of `n` as written, so 0.1 + 0.2 steps land on 0.3. */
function decimals(n: number): number {
  const text = String(n);
  const e = /e-(\d+)$/.exec(text);
  if (e) return Number(e[1]);
  return text.includes(".") ? text.length - text.indexOf(".") - 1 : 0;
}

/**
 * A number with − and + buttons beside it: replicas, cores, gigabytes.
 * Typing works too; ArrowUp/ArrowDown step, PageUp/PageDown step by ten,
 * Home/End jump to `min`/`max` when set.
 *
 * It says what's wrong in words ("Enter a number", "At least 1") rather
 * than relying on the browser's number input, whose spinners are tiny and
 * whose validation messages can't be styled. `value` is `null` while the
 * field is empty.
 *
 * @element lit-material-number-field
 *
 * @fires input - While typing, once the text is a number (or empty).
 * @fires change - After a step, or when a typed value is committed.
 *
 * @cssprop --lit-material-number-field-width - The field's smallest width (default `8ch`).
 *
 * @csspart field - The text field.
 * @csspart decrement - The − button.
 * @csspart increment - The + button.
 */
@customElement("lit-material-number-field")
export class LitMaterialNumberField extends LitElement {
  static override styles = css`
    :host {
      display: inline-flex;
      align-items: flex-start;
      gap: 4px;
      vertical-align: top;
    }
    :host([hidden]) {
      display: none;
    }
    lit-material-text-field {
      flex: 1;
      min-width: 0;
      --lit-material-text-field-min-width: var(--lit-material-number-field-width, 8ch);
    }
    lit-material-icon-button {
      margin-block-start: 8px;
    }
    svg {
      width: 100%;
      height: 100%;
      fill: currentColor;
    }
  `;

  /** The number, or `null` when empty. */
  @property({ type: Number }) value: number | null = null;

  @property({ type: Number }) min?: number;

  @property({ type: Number }) max?: number;

  /** Amount per step; typed values aren't snapped to it. */
  @property({ type: Number }) step = 1;

  @property() label = "";

  /** Shown after the number inside the field, e.g. "GiB". */
  @property() unit = "";

  @property() variant: TextFieldVariant = "outlined";

  @property({ attribute: "supporting-text" }) supportingText = "";

  /** An error of your own; the field's own range and number checks come first. */
  @property({ attribute: "error-text" }) errorText = "";

  @property() name = "";

  @property({ type: Boolean }) required = false;

  @property({ type: Boolean, reflect: true }) disabled = false;

  @property({ type: Boolean }) readonly = false;

  /** The field's own problem with the text, `""` when none. */
  @state() validationMessage = "";

  /** What's in the field when it isn't (yet) a valid number. */
  @state() private draft: string | null = null;

  /** `true` when the value is a number in range (or empty and not `required`). */
  checkValidity(): boolean {
    this.validationMessage = this.check();
    return !this.validationMessage;
  }

  private check(): string {
    if (this.draft !== null && this.draft.trim() !== "") return "Enter a number";
    if (this.value === null) return this.required ? "Required" : "";
    if (this.min !== undefined && this.value < this.min) return `At least ${this.min}`;
    if (this.max !== undefined && this.value > this.max) return `At most ${this.max}`;
    return "";
  }

  protected override willUpdate(changed: Map<string, unknown>): void {
    if (changed.has("value")) this.draft = null;
    this.validationMessage = this.check();
  }

  private clamp(n: number): number {
    if (this.min !== undefined) n = Math.max(this.min, n);
    if (this.max !== undefined) n = Math.min(this.max, n);
    return n;
  }

  /** Steps by `count` steps (negative steps down), clamped to `min`/`max`. */
  stepBy(count: number): void {
    if (this.value === null) {
      // From empty, a step lands on the start of the range.
      this.commit(this.clamp(this.min ?? 0));
      return;
    }
    const base = this.value;
    const places = Math.max(decimals(this.step), decimals(base));
    this.commit(this.clamp(Number((base + count * this.step).toFixed(places))));
  }

  private commit(value: number | null): void {
    const changed = value !== this.value || this.draft !== null;
    this.value = value;
    this.draft = null;
    if (changed) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
  }

  private onInput(event: Event): void {
    event.stopPropagation();
    const text = (event.target as HTMLInputElement).value.trim();
    const n = text === "" ? null : Number(text.replace(",", "."));
    if (n !== null && !Number.isFinite(n)) {
      this.draft = text;
      this.validationMessage = this.check();
      return;
    }
    this.value = n;
    this.draft = null;
    this.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (this.disabled || this.readonly) return;
    const steps: Record<string, number> = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 };
    if (event.key in steps) {
      event.preventDefault();
      this.stepBy(steps[event.key]!);
    } else if (event.key === "Home" && this.min !== undefined) {
      event.preventDefault();
      this.commit(this.min);
    } else if (event.key === "End" && this.max !== undefined) {
      event.preventDefault();
      this.commit(this.max);
    }
  }

  override render() {
    const locked = this.disabled || this.readonly;
    const name = this.label || "value";
    const error = this.validationMessage || this.errorText;
    const text = this.draft ?? (this.value === null ? "" : String(this.value));
    return html`
      <lit-material-icon-button
        part="decrement"
        aria-label=${`Decrease ${name}`}
        ?disabled=${locked || (this.min !== undefined && this.value !== null && this.value <= this.min)}
        @click=${() => this.stepBy(-1)}
        ><span slot="icon">${minusIcon}</span></lit-material-icon-button
      >
      <lit-material-text-field
        part="field"
        variant=${this.variant}
        label=${this.label}
        inputmode=${this.step % 1 === 0 && (this.min ?? 0) >= 0 ? "numeric" : "decimal"}
        autocomplete="off"
        .value=${text}
        suffix=${this.unit || nothing}
        name=${this.name || nothing}
        supporting-text=${this.supportingText}
        error-text=${error}
        ?error=${Boolean(error)}
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?readonly=${this.readonly}
        @input=${this.onInput}
        @change=${(e: Event) => {
          e.stopPropagation();
          if (this.draft === null) this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
        }}
        @keydown=${this.onKeyDown}
      ></lit-material-text-field>
      <lit-material-icon-button
        part="increment"
        aria-label=${`Increase ${name}`}
        ?disabled=${locked || (this.max !== undefined && this.value !== null && this.value >= this.max)}
        @click=${() => this.stepBy(1)}
        ><span slot="icon">${plusIcon}</span></lit-material-icon-button
      >
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-number-field": LitMaterialNumberField;
  }
}
