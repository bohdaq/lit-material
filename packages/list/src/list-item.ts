import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./list-item-styles.js";

export type ListItemType = "button" | "submit" | "reset";

/**
 * Material Design 3 list item.
 *
 * By default a list item is a plain, non-interactive row (`role="listitem"`):
 * no hover/press feedback, no keyboard focus. Set `interactive` (or `href`)
 * to make the *whole row* a single clickable/tappable surface instead — it
 * then renders as a real `<button>` or `<a>` with the same ripple/focus-ring
 * treatment as `lit-material-card`.
 *
 * @element lit-material-list-item
 *
 * @slot - The headline text.
 * @slot overline - Optional small text shown above the headline.
 * @slot supporting-text - Optional text shown below the headline.
 * @slot leading - Optional leading content (icon, avatar, image, checkbox…). Sized by its own content — not forced to a fixed icon size, since it can be anything from a 24px icon to a 40px avatar.
 * @slot trailing - Optional trailing content (icon, text, switch…), same sizing note as `leading`.
 *
 * @csspart item - The `<div>`, `<button>`, or `<a>` row (background/padding).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on. Only rendered when interactive.
 * @csspart focus-ring - The focus indicator element. Only rendered when interactive.
 */
@customElement("lit-material-list-item")
export class LitMaterialListItem extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  /** Form-associated custom element: lets an interactive item participate in an ancestor `<form>`. */
  static formAssociated = true;

  /** Makes the whole row a single clickable/tappable surface. Implied by setting `href`. */
  @property({ type: Boolean, reflect: true }) interactive = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** Highlights the row, e.g. for the current selection in a navigation list. */
  @property({ type: Boolean, reflect: true }) selected = false;
  /** Renders a hairline divider below the row. */
  @property({ type: Boolean, reflect: true }) divider = false;
  @property() type: ListItemType = "button";
  @property() name = "";
  @property() value = "";
  @property({ reflect: true }) form?: string;

  /** If set, renders the item as a link (`<a>`) instead of a `<button>`; implies `interactive`. */
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
    const inner = html`
      <slot name="leading" class="leading"></slot>
      <div class="text">
        <slot name="overline" class="overline"></slot>
        <slot class="headline"></slot>
        <slot name="supporting-text" class="supporting-text"></slot>
      </div>
      <slot name="trailing" class="trailing"></slot>
    `;

    const itemClasses = ["item", this.selected ? "selected" : ""].filter(Boolean).join(" ");

    if (!this.isInteractive) {
      return html`<div class=${itemClasses} part="item" role="listitem">${inner}</div>`;
    }

    const content = html`
      <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
      <div class="state-layer" part="ripple"></div>
      ${inner}
    `;

    // `role="list"` requires its children to be `role="listitem"`, but overriding the
    // native button/link element's implicit role to "listitem" would strip its
    // button/link semantics. So it's wrapped in a plain, unstyled `role="listitem"`
    // shell instead of carrying that role itself.
    if (this.href) {
      return html`
        <div class="item-shell" role="listitem">
          <a
            class="${itemClasses} interactive"
            part="item"
            href=${this.disabled ? nothing : this.href}
            target=${this.target || nothing}
            rel=${this.target === "_blank" ? "noopener noreferrer" : nothing}
            aria-disabled=${this.disabled ? "true" : nothing}
            tabindex=${this.disabled ? "-1" : "0"}
            @click=${this.handleLinkClick}
          >
            ${content}
          </a>
        </div>
      `;
    }

    return html`
      <div class="item-shell" role="listitem">
        <button
          class="${itemClasses} interactive"
          part="item"
          type="button"
          ?disabled=${this.disabled}
          name=${this.name || nothing}
          value=${this.value || nothing}
          @click=${this.handleClick}
        >
          ${content}
        </button>
      </div>
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
    "lit-material-list-item": LitMaterialListItem;
  }
}
