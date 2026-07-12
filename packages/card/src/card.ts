import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./card-styles.js";

export type CardVariant = "elevated" | "filled" | "outlined";
export type CardType = "button" | "submit" | "reset";

/**
 * Material Design 3 card.
 *
 * A card is primarily a content container: by default it renders as a plain
 * `<div>` around arbitrary slotted content (media, text, its own buttons),
 * with no interaction feedback of its own. Set `interactive` (or `href`) to
 * make the *whole card* a single clickable/tappable surface instead — then
 * it renders as a real `<button>` or `<a>` with the same ripple/focus-ring
 * treatment as `lit-material-button`.
 *
 * @element lit-material-card
 *
 * @slot - The card's content.
 *
 * @csspart card - The `<div>`, `<button>`, or `<a>` surface (background/border/elevation).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on. Only rendered when interactive.
 * @csspart focus-ring - The focus indicator element. Only rendered when interactive.
 */
@customElement("lit-material-card")
export class LitMaterialCard extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: lets an interactive card participate in an ancestor `<form>`. */
  static formAssociated = true;

  @property() variant: CardVariant = "elevated";
  /** Makes the whole card a single clickable/tappable surface. Implied by setting `href`. */
  @property({ type: Boolean, reflect: true }) interactive = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property() type: CardType = "button";
  @property() name = "";
  @property() value = "";
  @property({ reflect: true }) form?: string;

  /** If set, renders the card as a link (`<a>`) instead of a `<button>`; implies `interactive`. */
  @property() href = "";
  @property() target = "";

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly internals: ElementInternals;
  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  constructor() {
    super();
    this.internals = this.attachInternals();
  }

  protected override updated(): void {
    if (this.isInteractive && this.stateLayerElement) {
      this.ripple.attach(this.stateLayerElement);
    }
  }

  private get isInteractive(): boolean {
    return this.interactive || !!this.href;
  }

  override render() {
    if (!this.isInteractive) {
      return html`<div class="card ${this.variant}" part="card"><slot></slot></div>`;
    }

    const content = html`
      <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
      <div class="state-layer" part="ripple"></div>
      <slot></slot>
    `;

    if (this.href) {
      return html`
        <a
          class="card ${this.variant} interactive"
          part="card"
          href=${this.disabled ? nothing : this.href}
          target=${this.target || nothing}
          rel=${this.target === "_blank" ? "noopener noreferrer" : nothing}
          aria-disabled=${this.disabled ? "true" : nothing}
          tabindex=${this.disabled ? "-1" : "0"}
          @click=${this.handleLinkClick}
        >
          ${content}
        </a>
      `;
    }

    return html`
      <button
        class="card ${this.variant} interactive"
        part="card"
        type="button"
        ?disabled=${this.disabled}
        name=${this.name || nothing}
        value=${this.value || nothing}
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
    "lit-material-card": LitMaterialCard;
  }
}
