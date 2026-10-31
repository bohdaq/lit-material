import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
import { ICONS_CHANGED, getIcon, iconRegistry, warnMissing } from "./registry.js";
import { styles } from "./icon-styles.js";

export type IconSize = "small" | "medium" | "large";
export type IconColor = "inherit" | "info" | "success" | "warning" | "error";

/**
 * A consistent sizing/color wrapper for icon content — an inline `<svg>`,
 * an `<img>`, or an emoji/font-glyph character — ships no icon set of its
 * own. Distinct from `lit-material-icon-button`: that's a clickable button
 * that happens to contain an icon; this is the icon itself, usable
 * anywhere (inline with text, inside a card, standing alone as a status
 * indicator).
 *
 * Accessibility is decided by whether `label` is set: with one, the icon
 * gets `role="img"` and that `aria-label` (it's conveying information no
 * text nearby already does); without one, it's `aria-hidden="true"` (the
 * common case — decorative, or redundant with adjacent visible text).
 *
 * @element lit-material-icon
 *
 * Set `name` to show an icon registered with `registerIcons()` instead of
 * slotting one; it updates when icons are registered later.
 *
 * @slot - The icon content (an `<svg>`, an `<img>`, or a character); not used with `name`.
 *
 * @csspart icon - The host itself (size, color).
 */
@customElement("lit-material-icon")
export class LitMaterialIcon extends LitElement {
  static override styles = styles;

  @property({ reflect: true }) size: IconSize = "medium";
  @property({ reflect: true }) color: IconColor = "inherit";
  /** An accessible name — set only when the icon conveys information no nearby text already does. */
  @property() label = "";
  /** A name registered with `registerIcons()`; replaces the slotted content. */
  @property({ reflect: true }) name = "";

  private readonly onIconsChanged = (): void => {
    if (this.name) this.requestUpdate();
  };

  override connectedCallback(): void {
    super.connectedCallback();
    iconRegistry.addEventListener(ICONS_CHANGED, this.onIconsChanged);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    iconRegistry.removeEventListener(ICONS_CHANGED, this.onIconsChanged);
  }

  protected override willUpdate(): void {
    if (this.label) {
      this.setAttribute("role", "img");
      this.setAttribute("aria-label", this.label);
      this.removeAttribute("aria-hidden");
    } else {
      this.removeAttribute("role");
      this.removeAttribute("aria-label");
      this.setAttribute("aria-hidden", "true");
    }
  }

  override render(): unknown {
    if (!this.name) return html`<slot part="icon"></slot>`;
    const svg = getIcon(this.name);
    if (svg === undefined) {
      // Give a set registered in the same tick a chance before warning.
      const name = this.name;
      queueMicrotask(() => getIcon(name) === undefined && warnMissing(name));
      return html``;
    }
    return unsafeSVG(svg);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-icon": LitMaterialIcon;
  }
}
