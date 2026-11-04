import { html, LitElement } from "lit";
import { customElement, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
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

  private readonly localize = new LocalizeController(this);
  private roleDescriptionIsOwn = false;

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output (see lit-material-tooltip
    // for the fuller explanation). The guards keep this idempotent.
    if (!this.hasAttribute("role")) this.setAttribute("role", "group");
    if (!this.hasAttribute("aria-roledescription") || this.roleDescriptionIsOwn) {
      this.setAttribute("aria-roledescription", this.localize.term("carousel.slideRoleDescription", "slide"));
      this.roleDescriptionIsOwn = true;
    }
  }

  /**
   * Whether a `slot="label"` child is present. Starts false and follows the
   * label slot, so the first browser render matches the server's (which can't
   * see light DOM children); reading them during render broke hydration.
   */
  @state() private hasLabel = false;

  override render() {
    // The label container is always rendered, and hidden while empty: a named
    // slot's content can't be detected from CSS.
    return html`
      <div class="item" part="item">
        <slot></slot>
        <div class="label" part="label" ?hidden=${!this.hasLabel}>
          <slot name="label" @slotchange=${(e: Event) => (this.hasLabel = (e.target as HTMLSlotElement).assignedNodes().length > 0)}></slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-carousel-item": LitMaterialCarouselItem;
  }
}
