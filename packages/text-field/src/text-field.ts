import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { FocusRingController } from "@lit-material/core";
import { styles } from "./text-field-styles.js";

export type TextFieldVariant = "filled" | "outlined";

let instanceCount = 0;

/**
 * Material Design 3 text field.
 *
 * @element lit-material-text-field
 *
 * @slot leading-icon - An optional icon before the input.
 * @slot trailing-icon - An optional icon after the input.
 *
 * @csspart container - The outer field container (background/border).
 * @csspart input - The native `<input>` element.
 * @csspart label - The floating label element.
 * @csspart supporting - The supporting-text / character-counter row.
 *
 * @fires input - Bubbles when the value changes (like a native input).
 * @fires change - Bubbles on committed edits (blur/Enter).
 */
@customElement("lit-material-text-field")
export class LitMaterialTextField extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property() variant: TextFieldVariant = "filled";
  @property() type: string = "text";
  @property() value = "";
  @property() label = "";
  @property() placeholder = "";
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ attribute: "error-text" }) errorText = "";
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) readonly = false;
  @property() prefix = "";
  @property() suffix = "";
  @property({ type: Number }) min: number | undefined;
  @property({ type: Number }) max: number | undefined;
  @property({ type: Number }) minlength: number | undefined;
  @property({ type: Number }) maxlength: number | undefined;
  @property() step = "";
  @property() pattern = "";
  @property() autocomplete = "";
  @property() inputmode = "";
  @property() name = "";
  @property({ reflect: true }) form?: string;

  @query(".input") private readonly inputElement?: HTMLInputElement;

  @state() private focused = false;
  @state() private touched = false;

  private readonly internals: ElementInternals;
  private readonly focusRing = new FocusRingController(this);
  private readonly labelId = `lit-material-text-field-label-${++instanceCount}`;
  private readonly supportingId = `lit-material-text-field-supporting-${instanceCount}`;

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
    if (
      changed.has("value") ||
      changed.has("required") ||
      changed.has("pattern") ||
      changed.has("minlength") ||
      changed.has("maxlength") ||
      changed.has("min") ||
      changed.has("max") ||
      changed.has("type")
    ) {
      this.syncInternals();
    }
  }

  private get hasValue(): boolean {
    return this.value !== "";
  }

  /** Floats when focused, holding a value, or when a placeholder is shown. */
  private get floated(): boolean {
    return this.focused || this.hasValue || this.placeholder !== "";
  }

  /** True when the field should render in its error visual + a11y state. */
  private get isError(): boolean {
    if (this.error) return true;
    if (!this.touched || !this.inputElement) return false;
    return !this.inputElement.validity.valid;
  }

  /** The message shown in the supporting-text slot. */
  private get supportingMessage(): string {
    if (this.isError) {
      return this.errorText || this.inputElement?.validationMessage || "";
    }
    return this.supportingText;
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.value);
    if (this.inputElement) {
      const message = this.isError
        ? this.errorText || this.inputElement.validationMessage
        : this.inputElement.validationMessage;
      this.internals.setValidity(this.inputElement.validity, message, this.inputElement);
    }
  }

  override render() {
    const floated = this.floated;
    const isError = this.isError;

    return html`
      <div class="text-field" part="text-field">
        <div
          class="container ${floated ? "floated" : ""} ${this.focused ? "focused" : ""}"
          part="container"
        >
          <slot name="leading-icon" class="leading-icon"></slot>
          <div class="field">
            ${this.prefix ? html`<span class="prefix">${this.prefix}</span>` : nothing}
            <div class="input-wrapper">
              ${this.label
                ? html`<label class="label" part="label" id=${this.labelId} for="input">${this.label}</label>`
                : nothing}
              <input
                class="input"
                part="input"
                id="input"
                .value=${this.value}
                type=${this.type || "text"}
                placeholder=${this.placeholder || nothing}
                ?disabled=${this.disabled}
                ?readonly=${this.readonly}
                ?required=${this.required}
                autocomplete=${this.autocomplete || nothing}
                inputmode=${this.inputmode || nothing}
                min=${this.min ?? nothing}
                max=${this.max ?? nothing}
                minlength=${this.minlength ?? nothing}
                maxlength=${this.maxlength ?? nothing}
                step=${this.step || nothing}
                pattern=${this.pattern || nothing}
                name=${this.name || nothing}
                aria-labelledby=${this.label ? this.labelId : nothing}
                aria-describedby=${this.supportingMessage ? this.supportingId : nothing}
                aria-invalid=${isError ? "true" : nothing}
                @input=${this.handleInput}
                @change=${this.handleChange}
                @focus=${this.handleFocus}
                @blur=${this.handleBlur}
              />
            </div>
            ${this.suffix ? html`<span class="suffix">${this.suffix}</span>` : nothing}
          </div>
          <slot name="trailing-icon" class="trailing-icon"></slot>
        </div>
        ${this.supportingMessage || this.maxlength != null
          ? html`
              <div class="supporting" part="supporting">
                <span class="supporting-text" id=${this.supportingId}>
                  ${this.supportingMessage}
                </span>
                ${this.maxlength != null
                  ? html`<span class="counter">${this.value.length} / ${this.maxlength}</span>`
                  : nothing}
              </div>
            `
          : nothing}
      </div>
    `;
  }

  private handleInput(event: InputEvent): void {
    this.value = (event.target as HTMLInputElement).value;
    // The native `input` event is composed and bubbles out of the shadow root
    // on its own, so no re-dispatch is needed (would duplicate the event).
  }

  private handleChange(event: Event): void {
    this.touched = true;
    this.syncInternals();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    event.stopPropagation();
  }

  private handleFocus(): void {
    this.focused = true;
  }

  private handleBlur(): void {
    this.focused = false;
    this.touched = true;
    this.syncInternals();
  }

  /** Form-associated: restore the default value when the form is reset. */
  formResetCallback(): void {
    this.value = this.getAttribute("value") ?? "";
    this.touched = false;
    this.syncInternals();
  }

  /** Form-associated: restore state after browser back/forward. */
  formStateRestoreCallback(state: string | null): void {
    this.value = state ?? "";
  }

  /** Delegates to the underlying input + ElementInternals validity. */
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-text-field": LitMaterialTextField;
  }
}
