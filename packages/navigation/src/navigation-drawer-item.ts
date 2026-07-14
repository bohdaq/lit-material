import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./navigation-drawer-item-styles.js";

/**
 * A single destination inside a `lit-material-navigation-drawer` — a
 * pill-shaped row with a leading icon and a label, following the MD3
 * navigation drawer item spec.
 *
 * Renders as a real `<button>` by default, or an `<a>` when `href` is set —
 * both get the same ripple/focus-ring treatment as `lit-material-list-item`.
 * `selected` is normally managed by the parent drawer (see its docs), not
 * set directly.
 *
 * @element lit-material-navigation-drawer-item
 *
 * @slot - The label text.
 * @slot icon - The leading icon.
 * @slot badge - Optional trailing content (a count or dot).
 *
 * @csspart item - The `<button>` or `<a>` row (background/shape).
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-navigation-drawer-item")
export class LitMaterialNavigationDrawerItem extends LitElement {
  static override styles = styles;

  static override shadowRootOptions: ShadowRootInit = {
    ...LitElement.shadowRootOptions,
    delegatesFocus: true,
  };

  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;

  /** If set, renders the item as a link (`<a>`) instead of a `<button>`. */
  @property() href = "";
  @property() target = "";

  @query(".state-layer") private readonly stateLayerElement?: HTMLElement;

  private readonly ripple = new RippleController(this);
  private readonly focusRing = new FocusRingController(this);

  protected override updated(): void {
    if (this.stateLayerElement) this.ripple.attach(this.stateLayerElement);
  }

  private get content() {
    return html`
      <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
      <div class="state-layer" part="ripple"></div>
      <slot name="icon" class="icon"></slot>
      <span class="label"><slot></slot></span>
      <slot name="badge" class="badge"></slot>
    `;
  }

  override render() {
    const ariaCurrent = this.selected ? "page" : nothing;

    if (this.href) {
      return html`
        <a
          class="item"
          part="item"
          href=${this.disabled ? nothing : this.href}
          target=${this.target || nothing}
          rel=${this.target === "_blank" ? "noopener noreferrer" : nothing}
          aria-current=${ariaCurrent}
          aria-disabled=${this.disabled ? "true" : nothing}
          tabindex=${this.disabled ? "-1" : "0"}
          @click=${this.handleLinkClick}
        >
          ${this.content}
        </a>
      `;
    }

    return html`
      <button
        class="item"
        part="item"
        type="button"
        ?disabled=${this.disabled}
        aria-current=${ariaCurrent}
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
    "lit-material-navigation-drawer-item": LitMaterialNavigationDrawerItem;
  }
}
