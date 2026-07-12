import { html, LitElement, nothing, svg } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./checkbox-styles.js";

/**
 * Material Design 3 checkbox.
 *
 * @element lit-material-checkbox
 *
 * @csspart checkbox - The container the state layer, focus ring, and box are rendered in.
 * @csspart icon - The svg containing the box outline and check/indeterminate mark.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 *
 * @fires change - Bubbles when the checked state changes via user interaction.
 */
@customElement("lit-material-checkbox")
export class LitMaterialCheckbox extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property({ type: Boolean }) checked = false;
  /** Visual-only "partially checked" state; cleared on the next user interaction. */
  @property({ type: Boolean }) indeterminate = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean }) required = false;
  @property() name = "";
  @property() value = "on";
  @property({ reflect: true }) form?: string;

  /** Forwarded to the inner control; checkboxes have no visible label so this is often required. */
  @property({ attribute: "aria-label" }) ariaLabel: string | null = null;
  @property({ attribute: "aria-labelledby" }) ariaLabelledBy: string | null = null;

  @query(".native-control") private readonly inputElement?: HTMLInputElement;
  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly internals: ElementInternals;
  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncInternals();
  }

  protected override firstUpdated(): void {
    if (this.stateLayerElement) {
      this.ripple.attach(this.stateLayerElement);
    }
    this.syncInternals();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("checked") || changed.has("required") || changed.has("error")) {
      this.syncInternals();
    }
  }

  private syncInternals(): void {
    this.internals.setFormValue(this.checked ? this.value : null);
    if (this.inputElement) {
      const message = this.error
        ? this.inputElement.validationMessage || "Invalid"
        : this.inputElement.validationMessage;
      this.internals.setValidity(this.inputElement.validity, message, this.inputElement);
    }
  }

  override render() {
    const stateClasses = [
      this.checked ? "checked" : "",
      this.indeterminate ? "indeterminate" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return html`
      <div class="checkbox ${stateClasses}" part="checkbox">
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <div class="state-layer" part="ripple"></div>
        <svg class="icon" part="icon" viewBox="0 0 18 18" aria-hidden="true">
          <rect class="box" x="1" y="1" width="16" height="16" rx="2"></rect>
          ${this.indeterminate
            ? svg`<rect class="mark-indeterminate" x="4.5" y="8" width="9" height="2" rx="1"></rect>`
            : this.checked
              ? svg`<path class="mark-check" d="M4 9.5 L7.2 12.7 L14 5.5"></path>`
              : nothing}
        </svg>
        <input
          class="native-control"
          part="input"
          type="checkbox"
          .checked=${this.checked}
          .indeterminate=${this.indeterminate}
          ?disabled=${this.disabled}
          ?required=${this.required}
          name=${this.name || nothing}
          value=${this.value || nothing}
          aria-invalid=${this.error ? "true" : nothing}
          aria-label=${this.ariaLabel || nothing}
          aria-labelledby=${this.ariaLabelledBy || nothing}
          @change=${this.handleChange}
        />
      </div>
    `;
  }

  private handleChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.checked = input.checked;
    this.indeterminate = false;
    this.syncInternals();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    event.stopPropagation();
  }

  /** Form-associated: restore the default checked state when the form is reset. */
  formResetCallback(): void {
    this.checked = this.hasAttribute("checked");
    this.indeterminate = false;
    this.syncInternals();
  }

  /** Form-associated: restore state after browser back/forward. */
  formStateRestoreCallback(state: string | null): void {
    this.checked = state !== null;
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
    "lit-material-checkbox": LitMaterialCheckbox;
  }
}
