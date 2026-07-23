import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styles } from "./textarea-styles.js";

export type TextareaVariant = "filled" | "outlined";
export type TextareaResize = "none" | "vertical" | "horizontal" | "both";

let instanceCount = 0;

/**
 * Material Design 3 multi-line text field — `lit-material-text-field`'s
 * sibling for body-length text (a comment, a description, an address).
 * Shares its floating-label/filled/outlined/error-state/character-counter
 * design, minus the parts that don't make sense for multiple rows: no
 * leading/trailing icon slots, no prefix/suffix, and a resting label that
 * sits near the top (roughly where the first typed line would go) instead
 * of vertically centering the way a single-line input's does — there's no
 * sensible "middle" to center it in once the box is several rows tall.
 *
 * @element lit-material-textarea
 *
 * @csspart container - The outer field container (background/border).
 * @csspart textarea - The native `<textarea>` element.
 * @csspart label - The floating label element.
 * @csspart supporting - The supporting-text / character-counter row.
 *
 * @fires input - Bubbles when the value changes (like a native textarea).
 * @fires change - Bubbles on committed edits (blur).
 */
@customElement("lit-material-textarea")
export class LitMaterialTextarea extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property() variant: TextareaVariant = "filled";
  @property() value = "";
  @property() label = "";
  @property() placeholder = "";
  @property({ attribute: "supporting-text" }) supportingText = "";
  @property({ attribute: "error-text" }) errorText = "";
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean }) required = false;
  @property({ type: Boolean }) readonly = false;
  @property({ type: Number }) minlength: number | undefined;
  @property({ type: Number }) maxlength: number | undefined;
  @property({ type: Number }) rows = 4;
  @property() resize: TextareaResize = "vertical";
  @property() autocomplete = "";
  @property() name = "";
  @property({ reflect: true }) form?: string;

  @query(".textarea") private readonly textareaElement?: HTMLTextAreaElement;

  @state() private focused = false;
  @state() private touched = false;

  private readonly internals: ElementInternals;
  private readonly labelId = `lit-material-textarea-label-${++instanceCount}`;
  private readonly supportingId = `lit-material-textarea-supporting-${instanceCount}`;

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
    if (changed.has("value") || changed.has("required") || changed.has("minlength") || changed.has("maxlength")) {
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
    if (!this.touched || !this.textareaElement) return false;
    return !this.textareaElement.validity.valid;
  }

  /** The message shown in the supporting-text slot. */
  private get supportingMessage(): string {
    if (this.isError) {
      return this.errorText || this.textareaElement?.validationMessage || "";
    }
    return this.supportingText;
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.value);
    if (this.textareaElement) {
      const message = this.isError
        ? this.errorText || this.textareaElement.validationMessage
        : this.textareaElement.validationMessage;
      this.internals.setValidity(this.textareaElement.validity, message, this.textareaElement);
    }
  }

  override render() {
    const floated = this.floated;
    const isError = this.isError;

    return html`
      <div class="textarea-field" part="textarea-field">
        <div class="container ${floated ? "floated" : ""} ${this.focused ? "focused" : ""}" part="container">
          ${this.label
            ? html`<label class="label" part="label" id=${this.labelId} for="textarea">${this.label}</label>`
            : nothing}
          <textarea
            class="textarea"
            part="textarea"
            id="textarea"
            style="resize: ${this.resize}"
            rows=${this.rows}
            .value=${this.value}
            placeholder=${this.placeholder || nothing}
            ?disabled=${this.disabled}
            ?readonly=${this.readonly}
            ?required=${this.required}
            autocomplete=${this.autocomplete || nothing}
            minlength=${this.minlength ?? nothing}
            maxlength=${this.maxlength ?? nothing}
            name=${this.name || nothing}
            aria-labelledby=${this.label ? this.labelId : nothing}
            aria-describedby=${this.supportingMessage ? this.supportingId : nothing}
            aria-invalid=${isError ? "true" : nothing}
            @input=${this.handleInput}
            @change=${this.handleChange}
            @focus=${this.handleFocus}
            @blur=${this.handleBlur}
          ></textarea>
        </div>
        ${this.supportingMessage || this.maxlength != null
          ? html`
              <div class="supporting" part="supporting">
                <span class="supporting-text" id=${this.supportingId}> ${this.supportingMessage} </span>
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
    this.value = (event.target as HTMLTextAreaElement).value;
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

  /** Delegates to the underlying textarea + ElementInternals validity. */
  checkValidity(): boolean {
    return this.internals.checkValidity();
  }

  reportValidity(): boolean {
    return this.internals.reportValidity();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-textarea": LitMaterialTextarea;
  }
}
