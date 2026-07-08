import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./button-styles.js";

export type ButtonVariant = "filled" | "outlined" | "text" | "elevated" | "tonal";
export type ButtonType = "button" | "submit" | "reset";

let instanceCount = 0;

/**
 * Material Design 3 button.
 *
 * @element lit-material-button
 *
 * @slot - The button's label.
 * @slot icon - An optional leading icon.
 *
 * @csspart button - The native `<button>` or `<a>` element rendered inside the shadow root.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-button")
export class LitMaterialButton extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: lets this button participate in an ancestor `<form>`. */
  static formAssociated = true;

  @property() variant: ButtonVariant = "filled";
  @property() type: ButtonType = "button";
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() name = "";
  @property() value = "";
  @property({ reflect: true }) form?: string;

  /** If set, renders the button as a link (`<a>`) instead of a `<button>`. */
  @property() href = "";
  @property() target = "";

  @query(".button") private readonly buttonElement?: HTMLButtonElement | HTMLAnchorElement;

  private readonly internals: ElementInternals;
  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);
  private readonly labelId = `lit-material-button-label-${++instanceCount}`;

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  protected override firstUpdated(): void {
    if (this.buttonElement) {
      this.ripple.attach(this.buttonElement);
    }
  }

  override render() {
    const content = html`
      <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
      <div class="state-layer" part="ripple"></div>
      <slot name="icon" class="icon"></slot>
      <span class="label" id=${this.labelId}><slot></slot></span>
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
          aria-labelledby=${this.labelId}
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
        aria-labelledby=${this.labelId}
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
    "lit-material-button": LitMaterialButton;
  }
}
