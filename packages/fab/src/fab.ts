import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./fab-styles.js";

export type FabSize = "small" | "regular" | "large";
export type FabColor = "primary" | "secondary" | "tertiary" | "surface";
export type FabType = "button" | "submit" | "reset";

/**
 * Material Design 3 floating action button (FAB) — the primary action for a
 * screen, built on the same button/ripple/focus-ring/form-association
 * pattern as `lit-material-button` and `lit-material-icon-button`.
 *
 * `size` picks the icon-only container size (`small`/`regular`/`large`);
 * `extended` instead renders a pill-shaped, regular-height button with a
 * label next to the icon — `size` is ignored while `extended` is set, since
 * per the MD3 spec an extended FAB is always regular-height. The label is
 * always mounted in the DOM (not conditionally rendered) so toggling
 * `extended` on and off animates its width smoothly instead of popping the
 * text in and out — handy for the common "collapse to icon-only while the
 * user scrolls" pattern, though this component only renders the two states;
 * driving `extended` from scroll direction is left to your own listener,
 * the same scope cut `lit-material-top-app-bar` makes for its own
 * scroll-linked behavior.
 *
 * MD3 guidance is that FABs stay visible and enabled at all times (hide the
 * whole button rather than disabling it) — `disabled` is still supported
 * for API consistency with the rest of the library, but reach for it
 * sparingly.
 *
 * @element lit-material-fab
 *
 * @slot icon - The action's icon.
 * @slot - The label text, shown only while `extended` is set.
 *
 * @csspart button - The native `<button>` or `<a>` element.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-fab")
export class LitMaterialFab extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: lets this button participate in an ancestor `<form>`. */
  static formAssociated = true;

  @property({ reflect: true }) size: FabSize = "regular";
  @property({ reflect: true }) color: FabColor = "primary";
  @property({ type: Boolean, reflect: true }) extended = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() type: FabType = "button";
  @property() name = "";
  @property() value = "";
  @property({ reflect: true }) form?: string;

  /** If set, renders the FAB as a link (`<a>`) instead of a `<button>`. */
  @property() href = "";
  @property() target = "";

  /** Forwarded to the inner control. Required unless `extended`'s visible label is enough on its own. */
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

  private get content() {
    return html`
      <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
      <div class="state-layer" part="ripple"></div>
      <slot name="icon" class="icon"></slot>
      <span class="label"><slot></slot></span>
    `;
  }

  override render() {
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
          ${this.content}
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
        aria-label=${this.ariaLabel || nothing}
        aria-labelledby=${this.ariaLabelledBy || nothing}
        @click=${this.handleClick}
      >
        ${this.content}
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
    "lit-material-fab": LitMaterialFab;
  }
}
