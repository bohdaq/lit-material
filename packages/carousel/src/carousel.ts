import { html, LitElement, nothing } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import type { LitMaterialCarouselItem } from "./carousel-item.js";
import { styles } from "./carousel-styles.js";

/**
 * Material Design 3 carousel — a horizontally scrolling, scroll-snapping
 * row of `lit-material-carousel-item` slides. No prior pattern in this
 * repo to build on (there's no existing horizontal-scroll component), so
 * this one is a fresh design: a native CSS scroll-snap track does the
 * actual scrolling/snapping, and this component only adds item sizing (via
 * the `--lit-material-carousel-item-width` custom property it sets, read
 * by each item), optional prev/next buttons, and ArrowLeft/ArrowRight
 * keyboard navigation across items.
 *
 * "Which item is current" (for disabling the prev/next buttons at the
 * ends, and for `next()`/`prev()` to know which item is adjacent) is
 * tracked with an `IntersectionObserver` against the track, not scroll
 * position math — deliberately, since `scrollLeft` is measured
 * inconsistently across browsers under `dir="rtl"`, while intersection
 * ratios aren't direction-sensitive at all.
 *
 * Deliberately out of scope for this first pass: dragging/swiping to
 * scroll (the track is natively scrollable — touch/trackpad/click-drag-to-
 * scroll all already work exactly as they would on any scrollable element,
 * this just doesn't add its *own* pointer-drag handling on top), and the
 * MD3 spec's multiple carousel layouts (multi-browse, hero, etc., which
 * vary item sizes *within* one carousel) — every item is the same
 * `--lit-material-carousel-item-width` here.
 *
 * @element lit-material-carousel
 *
 * @slot - `lit-material-carousel-item` elements.
 *
 * @csspart track - The scrollable, scroll-snapping row.
 * @csspart prev-button - The previous-slide button. Only rendered while `showNavButtons` is set.
 * @csspart next-button - The next-slide button. Only rendered while `showNavButtons` is set.
 */
@customElement("lit-material-carousel")
export class LitMaterialCarousel extends LitElement {
  static override styles = styles;

  /** CSS length applied to every item's width (the `--lit-material-carousel-item-width` custom property). */
  @property({ attribute: "item-width" }) itemWidth = "280px";
  /** Shows the overlaid previous/next buttons. */
  @property({ type: Boolean, attribute: "show-nav-buttons" }) showNavButtons = true;

  @state() private currentIndex = 0;
  @state() private canScrollPrev = false;
  @state() private canScrollNext = false;

  @query(".track") private readonly trackElement?: HTMLElement;

  private observer?: IntersectionObserver;

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output (see lit-material-tooltip
    // for the fuller explanation).
    if (!this.hasAttribute("role")) this.setAttribute("role", "region");
    if (!this.hasAttribute("aria-roledescription")) this.setAttribute("aria-roledescription", "carousel");
  }

  protected override updated(changed: Map<string, unknown>): void {
    // Fires on the first update too (Lit's changed-properties map includes
    // every @property on that first pass), so this also covers the initial
    // value — no need to additionally set it in connectedCallback(). CSS
    // custom property inheritance is resolved at style-computation time,
    // not at DOM-insertion time, so setting it here (after first render)
    // rather than before is no less correct.
    if (changed.has("itemWidth")) {
      this.style.setProperty("--lit-material-carousel-item-width", this.itemWidth);
    }
  }

  protected override firstUpdated(): void {
    this.setUpObserver();
    this.syncItemLabels();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  private get items(): LitMaterialCarouselItem[] {
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-carousel-item"));
  }

  /** Scrolls a specific item (by index) into view, clamped to the item range. */
  scrollToIndex(index: number): void {
    const items = this.items;
    if (items.length === 0) return;
    const clamped = Math.max(0, Math.min(index, items.length - 1));
    items[clamped]!.scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
  }

  /** Scrolls to the item after the current one, if any. */
  next(): void {
    this.scrollToIndex(this.currentIndex + 1);
  }

  /** Scrolls to the item before the current one, if any. */
  prev(): void {
    this.scrollToIndex(this.currentIndex - 1);
  }

  private setUpObserver(): void {
    this.observer?.disconnect();
    if (!this.trackElement || typeof IntersectionObserver === "undefined") return;

    const ratios = new Map<Element, number>();
    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) ratios.set(entry.target, entry.intersectionRatio);
        this.syncFromRatios(ratios);
      },
      { root: this.trackElement, threshold: [0, 0.25, 0.5, 0.75, 0.95, 1] },
    );
    for (const item of this.items) this.observer.observe(item);
  }

  private syncFromRatios(ratios: Map<Element, number>): void {
    const items = this.items;
    if (items.length === 0) return;

    let bestIndex = 0;
    let bestRatio = -1;
    items.forEach((item, index) => {
      const ratio = ratios.get(item) ?? 0;
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestIndex = index;
      }
    });
    this.currentIndex = bestIndex;
    this.canScrollPrev = (ratios.get(items[0]!) ?? 0) < 0.95;
    this.canScrollNext = (ratios.get(items[items.length - 1]!) ?? 0) < 0.95;
  }

  private syncItemLabels(): void {
    const items = this.items;
    items.forEach((item, index) => {
      if (!item.hasAttribute("aria-label")) {
        item.setAttribute("aria-label", `${index + 1} of ${items.length}`);
      }
    });
  }

  private readonly handleSlotChange = (): void => {
    this.setUpObserver();
    this.syncItemLabels();
  };

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.next();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.prev();
    }
  };

  override render() {
    return html`
      <div class="track" part="track" tabindex="0" @keydown=${this.handleKeydown}>
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
      ${this.showNavButtons ? this.renderNavButtons() : nothing}
    `;
  }

  private renderNavButtons() {
    return html`
      <button
        class="nav-button prev"
        part="prev-button"
        type="button"
        aria-label="Previous"
        ?disabled=${!this.canScrollPrev}
        @click=${this.prev}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6 L9 12 L15 18"></path></svg>
      </button>
      <button
        class="nav-button next"
        part="next-button"
        type="button"
        aria-label="Next"
        ?disabled=${!this.canScrollNext}
        @click=${this.next}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6 L15 12 L9 18"></path></svg>
      </button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-carousel": LitMaterialCarousel;
  }
}
