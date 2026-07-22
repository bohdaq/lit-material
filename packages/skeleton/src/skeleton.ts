import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./skeleton-styles.js";

export type SkeletonVariant = "text" | "circular" | "rectangular" | "rounded";
export type SkeletonAnimation = "pulse" | "wave" | "none";

/**
 * A loading placeholder — a plain, animated (or static) block standing in
 * for content that hasn't arrived yet. Purely decorative: it carries no
 * accessible content of its own (`aria-hidden`), since a screen reader
 * announcing a shape that's about to disappear isn't useful. If your UI
 * needs to *tell* assistive tech that something is loading, put
 * `aria-busy="true"` (and, if relevant, an `aria-live` region for the
 * eventual result) on your own container — that's a statement about your
 * page's state, not something this element can make on your behalf.
 *
 * @element lit-material-skeleton
 *
 * @csspart skeleton - The placeholder block (color, size, shape, animation).
 */
@customElement("lit-material-skeleton")
export class LitMaterialSkeleton extends LitElement {
  static override styles = styles;

  @property({ reflect: true }) variant: SkeletonVariant = "text";
  @property({ reflect: true }) animation: SkeletonAnimation = "pulse";
  /** Any CSS length (e.g. "100%", "12rem") — falls back to a per-variant default when unset. */
  @property() width = "";
  /** Any CSS length — falls back to a per-variant default when unset. */
  @property() height = "";

  override render() {
    const style = `${this.width ? `width: ${this.width};` : ""}${this.height ? `height: ${this.height};` : ""}`;
    return html`<span class="skeleton" part="skeleton" style=${style || nothing} aria-hidden="true"></span>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-skeleton": LitMaterialSkeleton;
  }
}
