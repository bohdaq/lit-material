import { html, LitElement, nothing } from "lit";
import type { PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { styles } from "./avatar-styles.js";

export type AvatarSize = "small" | "medium" | "large";
export type AvatarShape = "circle" | "square";

/**
 * A user/entity avatar — an image, falling back to `initials` text, falling
 * back to a slotted icon (or a built-in default person icon if nothing's
 * slotted). Only one of those three actually renders at a time; there's no
 * combining them.
 *
 * If `src` fails to load, this falls back to `initials`/icon automatically
 * rather than showing a broken-image glyph.
 *
 * @element lit-material-avatar
 *
 * @slot - A custom icon, shown when there's no `src` (or it failed to load)
 *   and no `initials`. Falls back to a default person icon if left empty.
 *
 * @csspart avatar - The container (background, size, shape).
 * @csspart image - The `<img>` element, when `src` is set and loads.
 * @csspart initials - The initials text, when shown.
 */
@customElement("lit-material-avatar")
export class LitMaterialAvatar extends LitElement {
  static override styles = styles;

  @property() src = "";
  /** Accessible name for what/who this avatar represents — also used as the image's `alt` text. */
  @property() alt = "";
  /** Short fallback text (typically 1-2 characters) shown when there's no image. */
  @property() initials = "";
  @property({ reflect: true }) size: AvatarSize = "medium";
  @property({ reflect: true }) shape: AvatarShape = "circle";

  @state() private imageFailed = false;

  protected override willUpdate(changed: PropertyValues<this>): void {
    if (changed.has("src")) {
      this.imageFailed = false;
    }
  }

  override render() {
    const label = this.alt || this.initials;
    return html`
      <div class="avatar" part="avatar" role=${label ? "img" : nothing} aria-label=${label || nothing}>
        ${this.renderContent()}
      </div>
    `;
  }

  private renderContent() {
    if (this.src && !this.imageFailed) {
      return html`<img class="image" part="image" src=${this.src} alt="" @error=${this.handleImageError} />`;
    }
    if (this.initials) {
      return html`<span class="initials" part="initials" aria-hidden="true">${this.initials}</span>`;
    }
    return html`
      <slot aria-hidden="true">
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          ></path>
        </svg>
      </slot>
    `;
  }

  private readonly handleImageError = (): void => {
    this.imageFailed = true;
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-avatar": LitMaterialAvatar;
  }
}
