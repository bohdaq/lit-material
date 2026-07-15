import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { FocusRingController, RippleController } from "@lit-material/core";
import { styles } from "./navigation-rail-item-styles.js";

/**
 * A single destination inside a `lit-material-navigation-rail` — an icon in
 * a pill-shaped active indicator, with a small label below it, following
 * the MD3 navigation rail item spec.
 *
 * Renders as a real `<button>` by default, or an `<a>` when `href` is set.
 * The ripple/focus-ring are scoped to the icon's indicator pill (not the
 * whole item), matching how the indicator itself is the only part that
 * visibly reacts to press/focus in the spec. `selected` is normally managed
 * by the parent rail (see its docs), not set directly.
 *
 * @element lit-material-navigation-rail-item
 *
 * @slot - The label text.
 * @slot icon - The icon.
 * @slot badge - Optional badge content (a count or dot), positioned over the icon's top-end corner
 *   (top-right in LTR, top-left in RTL).
 *
 * @csspart item - The `<button>` or `<a>` (layout only, no background of its own).
 * @csspart icon-container - The pill-shaped active indicator behind the icon.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 * @csspart focus-ring - The focus indicator element.
 */
@customElement("lit-material-navigation-rail-item")
export class LitMaterialNavigationRailItem extends LitElement {
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
      <span class="icon-container" part="icon-container">
        <div class="focus-ring" part="focus-ring" ?hidden=${!this.focusRing.visible}></div>
        <div class="state-layer" part="ripple"></div>
        <slot name="icon" class="icon"></slot>
        <slot name="badge" class="badge"></slot>
      </span>
      <span class="label"><slot></slot></span>
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
    "lit-material-navigation-rail-item": LitMaterialNavigationRailItem;
  }
}
