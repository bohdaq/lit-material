import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./search-view-styles.js";

/**
 * Material Design 3 (docked) search view — a suggestions panel anchored
 * below a `lit-material-search-bar`, built on the native Popover API
 * (top-layer rendering escapes clipping/overflow ancestors) the same way
 * `lit-material-menu` builds on it — but `popover="manual"`, not `"auto"`,
 * like `lit-material-tooltip`/`lit-material-snackbar`: an `auto` popover's
 * native light-dismiss hides it the instant it opens here, because the very
 * click that focuses the anchor (and triggers this view's own JS-driven
 * open, below) isn't a native `popovertarget` invoker relationship the
 * browser recognizes as legitimate — so this view manages its own outside-
 * click and Escape dismissal instead.
 *
 * Unlike Menu, this component doesn't wait for you to call `show()` — like
 * `lit-material-tooltip`, it attaches its own listener (`focus`) to
 * whatever `anchorElement` resolves to and opens itself automatically, since
 * a search view is meant to appear the moment the search bar is
 * interacted with, not on a separate trigger. It also stretches to the
 * anchor's width rather than sizing to its own content, and — because the
 * anchor is a text input the user keeps typing into, not a button — it
 * never moves real focus into itself. Arrow Up/Down instead move a
 * *highlighted* (not focused) suggestion, reusing `lit-material-list-item`'s
 * own `selected` property for the highlight; Enter activates the
 * highlighted item (a real `.click()`, so it participates in whatever
 * click handling the item already has) and Escape closes the view.
 *
 * Suggestions are just `lit-material-list-item` elements (typically
 * `interactive`) slotted in, the same convention `lit-material-menu` uses.
 * This component only adds positioning, open/close lifecycle, the
 * highlight-and-activate keyboard model above, and closing when an item is
 * activated — it has no opinion on filtering/matching suggestions against
 * the anchor's typed value, or on writing a selected suggestion back to it;
 * both are left to your own `input`/`click` listeners.
 *
 * @element lit-material-search-view
 *
 * @slot - `lit-material-list-item` elements (or any other content, e.g. an empty-state message).
 *
 * @csspart view - The popover surface (background, padding, shape, elevation).
 *
 * @fires close - Fires after the view closes, for any reason (item activation,
 *   `close()`, Escape, or an outside click).
 */
@customElement("lit-material-search-view")
export class LitMaterialSearchView extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** id of the anchor element (typically a `lit-material-search-bar`) to position against and bind to. See also `anchorElement`. */
  @property() anchor?: string;

  private explicitAnchorElement?: HTMLElement;
  private boundAnchor?: HTMLElement;
  private highlightedIndex = -1;

  constructor() {
    super();
    this.addEventListener("click", this.handleItemClick);
    // SSR guard: @lit-labs/ssr's global DOM shim doesn't implement a real
    // `document.addEventListener`.
    if (typeof document !== "undefined" && typeof document.addEventListener === "function") {
      document.addEventListener("click", this.handleDocumentClick);
    }
  }

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output (see lit-material-tooltip
    // for the fuller explanation). The guard keeps this idempotent.
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "manual");
    // Slotted lit-material-list-item children carry role="listitem", which
    // requires a role="list" ancestor — same reasoning as lit-material-menu.
    if (!this.hasAttribute("role")) this.setAttribute("role", "list");
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.unbindAnchor();
    document.removeEventListener("click", this.handleDocumentClick);
  }

  protected override firstUpdated(): void {
    // Not connectedCallback(): if the anchor element appears *after* this
    // one in markup, its id wouldn't be resolvable via getElementById() yet
    // at that point — firstUpdated() runs after Lit's first render, by
    // which point the whole initial parse has completed (same reasoning as
    // lit-material-tooltip's identical choice here).
    this.bindAnchor();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("anchor")) this.bindAnchor();
    if (changed.has("open")) this.syncOpenState();
  }

  /** The element this view is positioned against and bound to. */
  get anchorElement(): HTMLElement | undefined {
    if (this.explicitAnchorElement) return this.explicitAnchorElement;
    if (this.anchor && typeof this.getRootNode === "function") {
      const root = this.getRootNode() as Document | ShadowRoot;
      return typeof root.getElementById === "function" ? (root.getElementById(this.anchor) ?? undefined) : undefined;
    }
    return undefined;
  }

  set anchorElement(element: HTMLElement | undefined) {
    this.explicitAnchorElement = element;
    this.bindAnchor();
  }

  /** Opens the view, optionally anchoring to `anchorElement` instead of `anchor`/a previous anchorElement. */
  show(anchorElement?: HTMLElement): void {
    if (anchorElement) {
      this.explicitAnchorElement = anchorElement;
      this.bindAnchor();
    }
    this.open = true;
  }

  /** Closes the view (`open = false`) and fires `close`. A no-op if already closed. */
  close(): void {
    if (!this.open) return;
    this.open = false;
    this.setHighlighted(-1);
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  private get items(): HTMLElement[] {
    return Array.from(this.querySelectorAll("lit-material-list-item")).filter(
      (el) => !el.hasAttribute("disabled") && (el.hasAttribute("interactive") || el.hasAttribute("href")),
    ) as HTMLElement[];
  }

  private syncOpenState(): void {
    if (typeof this.showPopover !== "function") return; // SSR guard
    if (this.open) {
      if (!this.matches(":popover-open")) {
        this.showPopover();
        this.updatePosition();
      }
    } else if (this.matches(":popover-open")) {
      this.hidePopover();
    }
  }

  private bindAnchor(): void {
    const next = this.anchorElement;
    if (next === this.boundAnchor) return;
    this.unbindAnchor();
    this.boundAnchor = next;
    if (!next) return;
    next.addEventListener("focus", this.handleAnchorFocus);
    next.addEventListener("keydown", this.handleAnchorKeydown);
  }

  private unbindAnchor(): void {
    if (!this.boundAnchor) return;
    this.boundAnchor.removeEventListener("focus", this.handleAnchorFocus);
    this.boundAnchor.removeEventListener("keydown", this.handleAnchorKeydown);
    this.boundAnchor = undefined;
  }

  private updatePosition(): void {
    const anchorEl = this.anchorElement;
    if (!anchorEl) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const gap = 4;
    // Stretch to the anchor's width before measuring height — width
    // affects how the slotted content wraps/reflows.
    this.style.width = `${anchorRect.width}px`;

    const viewRect = this.getBoundingClientRect();
    let top = anchorRect.bottom + gap;
    if (top + viewRect.height > window.innerHeight) {
      top = Math.max(0, window.innerHeight - viewRect.height);
    }
    let left = anchorRect.left;
    if (left + viewRect.width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - viewRect.width);
    }
    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  private setHighlighted(index: number): void {
    this.highlightedIndex = index;
    this.items.forEach((item, i) => {
      if (i === index) item.setAttribute("selected", "");
      else item.removeAttribute("selected");
    });
    if (index !== -1) this.items[index]?.scrollIntoView({ block: "nearest" });
  }

  private readonly handleAnchorFocus = (): void => {
    this.setHighlighted(-1);
    this.show();
  };

  private readonly handleAnchorKeydown = (event: KeyboardEvent): void => {
    if (!this.open) return;
    const items = this.items;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (items.length === 0) return;
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      const next =
        this.highlightedIndex === -1
          ? delta === 1
            ? 0
            : items.length - 1
          : (this.highlightedIndex + delta + items.length) % items.length;
      this.setHighlighted(next);
    } else if (event.key === "Enter") {
      if (this.highlightedIndex === -1) return;
      event.preventDefault();
      items[this.highlightedIndex]?.click();
    } else if (event.key === "Escape") {
      this.close();
    }
  };

  private readonly handleItemClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    if (this.items.some((item) => path.includes(item))) {
      this.close();
    }
  };

  /** Manual dismissal for `popover="manual"`: closes when a click lands outside both this view and its anchor. */
  private readonly handleDocumentClick = (event: MouseEvent): void => {
    if (!this.open) return;
    const path = event.composedPath();
    if (path.includes(this)) return;
    if (this.boundAnchor && path.includes(this.boundAnchor)) return;
    this.close();
  };

  override render() {
    return html`<slot part="view"></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-search-view": LitMaterialSearchView;
  }
}
