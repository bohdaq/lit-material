import { html, LitElement, nothing } from "lit";
import { customElement } from "lit/decorators.js";
import { styles } from "./carousel-item-styles.js";

/**
 * A single slide inside `lit-material-carousel` — purely presentational: it
 * just sizes itself (via the `--lit-material-carousel-item-width` custom
 * property the parent sets) and opts into scroll-snap, the same "container
 * drives everything, item just renders" split `lit-material-tab` and
 * `lit-material-segmented-button` use for their own parents.
 *
 * The default slot is sized to fill the item and, for an `<img>` or
 * `<video>`, cropped with `object-fit: cover` — cover art is the common
 * case, but any content works. An optional `label` slot renders as a
 * bottom-anchored overlay with a scrim gradient behind it, so light text
 * stays readable over an image; omit it and neither the scrim nor its
 * space are rendered. Whether it's present is checked directly against the
 * light DOM (there's no CSS-only way to tell whether a *named* slot has
 * anything assigned to it), which only works in a real browser — SSR's
 * light-DOM shim can't answer that question, so the overlay never renders
 * server-side, the same accepted gap `lit-material-tabs` documents for its
 * own light-DOM queries.
 *
 * `role="group"`/`aria-roledescription="slide"` are set here; the parent
 * fills in `aria-label` ("2 of 5") once it knows this item's position, the
 * same way `lit-material-navigation-rail` manages its items' `selected`.
 *
 * @element lit-material-carousel-item
 *
 * @slot - The slide's content (typically an image).
 * @slot label - Optional caption, overlaid at the bottom with a scrim.
 *
 * @csspart item - The slide's container (background, shape, overflow clipping).
 * @csspart label - The caption overlay, when the `label` slot has content.
 */
@customElement("lit-material-carousel-item")
export class LitMaterialCarouselItem extends LitElement {
  static override styles = styles;

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output (see lit-material-tooltip
    // for the fuller explanation). The guards keep this idempotent.
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-roledescription")) this.setAttribute("aria-roledescription", "slide");
  }

  override render() {
    // A named slot's assignment can't be read via CSS (`:empty` only ever
    // sees a slot's own fallback content, never what's actually assigned to
    // it), so the scrim/label container is only rendered at all when there's
    // a real `slot="label"` light-DOM child, checked directly against the
    // light DOM. @lit-labs/ssr's light-DOM shim doesn't implement
    // querySelector on the host at all (same reasoning as
    // lit-material-tabs's querySelectorAll guard) — degrade to "no label"
    // rather than throwing; a real browser render (the overwhelming
    // majority of usage) always has it.
    const hasLabel = typeof this.querySelector === "function" && !!this.querySelector('[slot="label"]');
    return html`
      <div class="item" part="item">
        <slot></slot>
        ${hasLabel ? html`<div class="label" part="label"><slot name="label"></slot></div>` : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-carousel-item": LitMaterialCarouselItem;
  }
}
