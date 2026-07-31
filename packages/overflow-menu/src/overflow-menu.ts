import { html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { styles } from "./overflow-menu-styles.js";

const GAP = 8;
const MORE_BUTTON_WIDTH = 32;

/**
 * A responsive action row: slotted items render inline until they no
 * longer fit the available width, at which point the excess collapses
 * into a "more" (⋮) kebab menu — a native Popover API (`popover="auto"`)
 * dropdown, positioned the same way `lit-material-menu` positions itself.
 *
 * Item widths are measured once (an item already parked in the closed
 * overflow popover has a zero-size layout box, so it can't be
 * re-measured there) and cached; a `ResizeObserver` on the host re-runs
 * the fit calculation whenever available width changes, growing the
 * visible row back out as space returns. This is a native-`ResizeObserver`
 * "does everything fit?" check, not a full responsive layout engine —
 * items are assumed to size themselves independently of each other
 * (`flex: none` on every slotted item), the same simplifying assumption
 * `lit-material-carousel` makes about its own items.
 *
 * @element lit-material-overflow-menu
 *
 * @slot - The action items (buttons, links, icon-buttons — any content), in priority order (first = most important, kept visible longest).
 *
 * @csspart row - The visible row of items.
 * @csspart more - The "more" (⋮) button. Hidden entirely when nothing overflows.
 * @csspart menu - The overflow popover.
 *
 * @fires overflow-change - Fires when items move into or out of the overflow menu, with `detail.overflowing` (the count).
 */
@customElement("lit-material-overflow-menu")
export class LitMaterialOverflowMenu extends LitElement {
  static override styles = styles;

  /** Accessible name for the "more" button. */
  @property() label = "More actions";

  @state() private hasOverflow = false;
  @state() private menuOpen = false;

  @query(".more") private readonly moreButton?: HTMLButtonElement;
  @query(".menu") private readonly menuElement?: HTMLElement;

  private readonly itemWidths = new Map<HTMLElement, number>();
  private resizeObserver?: ResizeObserver;
  private resizeFrame?: number;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver === "undefined") return; // SSR guard
    this.resizeObserver = new ResizeObserver(() => {
      // Not called synchronously from the observer callback: that callback
      // runs inside the browser's own resize-notification cycle, and
      // updateOverflow() both reads layout (getBoundingClientRect) and
      // writes it (slot attribute changes that affect what's rendered) —
      // doing both within that cycle is exactly what triggers "ResizeObserver
      // loop completed with undelivered notifications" (seen concretely on
      // WebKit). Deferring the actual work to the next frame decouples it
      // from the observer's own notification cycle.
      cancelAnimationFrame(this.resizeFrame ?? -1);
      this.resizeFrame = requestAnimationFrame(() => this.updateOverflow());
    });
    this.resizeObserver.observe(this);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    cancelAnimationFrame(this.resizeFrame ?? -1);
  }

  private readonly handleSlotChange = (): void => {
    // Prune cached widths only for items that are genuinely gone, not a
    // wholesale clear: this handler also fires for updateOverflow()'s own
    // internal slot="overflow" reassignment (moving an item between the
    // default and overflow slot both count as a slot change), and blowing
    // away every cached width there would force re-measuring already-
    // overflowing items — which means temporarily toggling their slot
    // attribute back, firing this same handler again, forever.
    const currentItems = new Set(this.items);
    for (const cached of this.itemWidths.keys()) {
      if (!currentItems.has(cached)) this.itemWidths.delete(cached);
    }
    this.updateOverflow();
  };

  private readonly handleMoreClick = (): void => {
    this.menuOpen = !this.menuOpen;
  };

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("menuOpen") || !this.menuElement) return;
    if (this.menuOpen) {
      if (!this.menuElement.matches(":popover-open")) {
        this.menuElement.showPopover();
        this.positionMenu();
      }
    } else if (this.menuElement.matches(":popover-open")) {
      this.menuElement.hidePopover();
    }
  }

  private positionMenu(): void {
    if (!this.menuElement || !this.moreButton) return;
    const anchorRect = this.moreButton.getBoundingClientRect();
    const menuRect = this.menuElement.getBoundingClientRect();
    const gap = 4;

    let top = anchorRect.bottom + gap;
    if (top + menuRect.height > window.innerHeight) {
      const above = anchorRect.top - gap - menuRect.height;
      top = above >= 0 ? above : Math.max(0, window.innerHeight - menuRect.height);
    }

    let left = anchorRect.right - menuRect.width;
    left = Math.max(0, Math.min(left, window.innerWidth - menuRect.width));

    this.menuElement.style.top = `${top}px`;
    this.menuElement.style.left = `${left}px`;
  }

  private readonly handleMenuToggle = (event: Event): void => {
    const isOpen = (event as ToggleEvent).newState === "open";
    this.menuOpen = isOpen;
    if (!isOpen) this.moreButton?.focus();
  };

  private get items(): HTMLElement[] {
    if (typeof this.children === "undefined") return []; // SSR guard
    return Array.from(this.children) as HTMLElement[];
  }

  private updateOverflow(): void {
    const items = this.items;
    if (items.length === 0) return;

    // An item parked in the (closed) overflow popover has a zero-size
    // layout box, so its width can only be trusted while it's in the
    // default slot — measure once per item and cache the result.
    for (const item of items) {
      if (this.itemWidths.has(item)) continue;
      const hadOverflowSlot = item.getAttribute("slot") === "overflow";
      if (hadOverflowSlot) item.removeAttribute("slot");
      this.itemWidths.set(item, item.getBoundingClientRect().width);
      if (hadOverflowSlot) item.setAttribute("slot", "overflow");
    }

    const availableWidth = this.getBoundingClientRect().width;
    let usedWidth = 0;
    let overflowStartIndex = items.length;

    for (let i = 0; i < items.length; i++) {
      const width = this.itemWidths.get(items[i]!) ?? 0;
      const widthWithGap = width + (i > 0 ? GAP : 0);
      const remaining = items.length - i - 1;
      const reserveForMore = remaining > 0 ? GAP + MORE_BUTTON_WIDTH : 0;
      if (usedWidth + widthWithGap + reserveForMore > availableWidth) {
        overflowStartIndex = i;
        break;
      }
      usedWidth += widthWithGap;
    }

    // Only touch the DOM when an item's slot actually needs to change —
    // setAttribute/removeAttribute fire "slotchange" even when the value
    // doesn't change, which would re-trigger handleSlotChange, which calls
    // back into this method: an infinite loop if every call unconditionally
    // reassigns every item's slot regardless of whether anything moved.
    for (let i = 0; i < items.length; i++) {
      const item = items[i]!;
      const shouldOverflow = i >= overflowStartIndex;
      const isOverflowing = item.getAttribute("slot") === "overflow";
      if (shouldOverflow && !isOverflowing) item.setAttribute("slot", "overflow");
      else if (!shouldOverflow && isOverflowing) item.removeAttribute("slot");
    }

    const nextHasOverflow = overflowStartIndex < items.length;
    if (nextHasOverflow !== this.hasOverflow) {
      this.hasOverflow = nextHasOverflow;
      if (!nextHasOverflow) this.menuOpen = false;
      this.dispatchEvent(
        new CustomEvent("overflow-change", {
          bubbles: true,
          detail: { overflowing: items.length - overflowStartIndex },
        }),
      );
    }
  }

  override render() {
    return html`
      <div class="row" part="row">
        <slot @slotchange=${this.handleSlotChange}></slot>
        <button
          class="more"
          part="more"
          type="button"
          aria-label=${this.label}
          aria-haspopup="true"
          aria-expanded=${this.menuOpen ? "true" : "false"}
          ?hidden=${!this.hasOverflow}
          @click=${this.handleMoreClick}
        >
          ⋮
        </button>
      </div>
      <div class="menu" part="menu" popover="auto" @toggle=${this.handleMenuToggle}>
        <slot name="overflow"></slot>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-overflow-menu": LitMaterialOverflowMenu;
  }
}
