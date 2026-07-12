import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./switch-styles.js";

/**
 * Material Design 3 switch.
 *
 * @element lit-material-switch
 *
 * @slot icon - An optional icon shown in the thumb when unselected.
 * @slot selected-icon - An optional icon shown in the thumb when selected.
 *
 * @csspart switch - The container the track, thumb, state layer, and focus ring are rendered in.
 * @csspart track - The pill-shaped track element.
 * @csspart thumb - The circular thumb element that slides within the track.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 *
 * @fires change - Bubbles when the checked state changes via user interaction.
 */
@customElement("lit-material-switch")
export class LitMaterialSwitch extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: participates in ancestor `<form>` + validation. */
  static formAssociated = true;

  @property({ type: Boolean }) checked = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) error = false;
  @property({ type: Boolean }) required = false;
  @property() name = "";
  @property() value = "on";
  @property({ reflect: true }) form?: string;

  /** Forwarded to the inner control; switches have no visible label so this is often required. */
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
    return html`
      <div class="switch ${this.checked ? "checked" : ""}" part="switch">
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <div class="track" part="track">
          <div class="thumb-wrap">
            <div class="state-layer" part="ripple"></div>
            <div class="thumb" part="thumb">
              ${this.checked
                ? html`<slot name="selected-icon" class="icon"></slot>`
                : html`<slot name="icon" class="icon"></slot>`}
            </div>
          </div>
        </div>
        <input
          class="native-control"
          part="input"
          type="checkbox"
          role="switch"
          .checked=${this.checked}
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
    this.syncInternals();
    this.dispatchEvent(new Event("change", { bubbles: true, composed: true }));
    event.stopPropagation();
  }

  /** Form-associated: restore the default checked state when the form is reset. */
  formResetCallback(): void {
    this.checked = this.hasAttribute("checked");
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
    "lit-material-switch": LitMaterialSwitch;
  }
}
