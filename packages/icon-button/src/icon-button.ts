import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./icon-button-styles.js";

export type IconButtonVariant = "standard" | "filled" | "tonal" | "outlined";
export type IconButtonType = "button" | "submit" | "reset";

/**
 * Material Design 3 icon button.
 *
 * @element lit-material-icon-button
 *
 * @slot icon - The icon shown when the button is off (or always, when not a toggle).
 * @slot selected-icon - The icon shown when a toggle button is selected.
 *
 * @csspart button - The native `<button>` or `<a>` element rendered inside the shadow root.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-icon-button")
export class LitMaterialIconButton extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: lets this button participate in an ancestor `<form>`. */
  static formAssociated = true;

  @property() variant: IconButtonVariant = "standard";
  @property({ type: Boolean, reflect: true }) toggle = false;
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() type: IconButtonType = "button";
  @property() name = "";
  @property() value = "";
  @property({ reflect: true }) form?: string;

  /** If set, renders the button as a link (`<a>`) instead of a `<button>`. */
  @property() href = "";
  @property() target = "";

  /** Forwarded to the inner control; icon buttons have no visible label so this is required. */
  @property({ attribute: "aria-label" }) ariaLabel: string | null = null;
  @property({ attribute: "aria-labelledby" }) ariaLabelledBy: string | null = null;

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly internals: ElementInternals;
  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  protected override firstUpdated(): void {
    if (this.stateLayerElement) {
      this.ripple.attach(this.stateLayerElement);
    }
  }

  override render() {
    // Off state accepts icon content either way: `slot="icon"` (the documented contract, needed to
    // distinguish it from `selected-icon` on a toggle button) or no slot attribute at all (the simpler
    // form for a plain, non-toggle button, where there's nothing to distinguish it from). Both slot
    // elements can coexist — each child's own `slot` attribute (or lack of one) picks which one it lands
    // in, so a consumer only ever needs one of the two forms, never both at once.
    const icon =
      this.toggle && this.selected
        ? html`<slot name="selected-icon" class="icon"></slot>`
        : html`<slot name="icon" class="icon"></slot><slot class="icon"></slot>`;

    const content = html`
      <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
      <div class="state-layer" part="ripple"></div>
      ${icon}
    `;

    if (this.href) {
      return html`
        <a
          class="button"
          part="button"
          href=${this.disabled ? nothing : this.href}
          target=${this.target || nothing}
          rel=${this.target === "_blank" ? "noopener noreferrer" : nothing}
          aria-disabled=${this.disabled ? "true" : nothing}
          aria-label=${this.ariaLabel || nothing}
          aria-labelledby=${this.ariaLabelledBy || nothing}
          tabindex=${this.disabled ? "-1" : "0"}
          @click=${this.handleLinkClick}
        >
          ${content}
        </a>
      `;
    }

    return html`
      <button
        class="button"
        part="button"
        type="button"
        ?disabled=${this.disabled}
        name=${this.name || nothing}
        value=${this.value || nothing}
        aria-pressed=${this.toggle ? this.selected : nothing}
        aria-label=${this.ariaLabel || nothing}
        aria-labelledby=${this.ariaLabelledBy || nothing}
        @click=${this.handleClick}
      >
        ${content}
      </button>
    `;
  }

  private handleClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.toggle) {
      this.selected = !this.selected;
      this.dispatchEvent(new Event("change", { bubbles: true }));
      return;
    }
    if (this.type === "submit") {
      this.internals.form?.requestSubmit();
    } else if (this.type === "reset") {
      this.internals.form?.reset();
    }
  }

  private handleLinkClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-icon-button": LitMaterialIconButton;
  }
}
