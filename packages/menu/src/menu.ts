import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./menu-styles.js";

/**
 * Material Design 3 menu — a floating list of options anchored to a trigger
 * element, built on the native Popover API (top-layer rendering, light
 * dismiss on outside click/Escape all come from the browser).
 *
 * Menu items are just `lit-material-list-item` elements slotted in: this
 * component only adds positioning, open/close lifecycle, roving-tabindex
 * arrow key navigation (Up/Down/Home/End) across interactive items, and
 * closing when an item is activated. `disabled` items are skipped when
 * navigating.
 *
 * Opening the menu focuses the menu itself, not the first item — a real
 * `.focus()`, so Escape/arrow keys work immediately, but with nothing
 * visibly highlighted (the menu isn't in the tab order and has no ring of
 * its own). Arrow Down/Up from that neutral state still correctly land on
 * the first/last item respectively, so navigation isn't affected.
 *
 * Because items carry `role="listitem"` (not `menuitem`), this host takes
 * `role="list"` rather than the ARIA `menu` role — a floating, keyboard-
 * navigable list rather than a strict ARIA menu/menuitem widget.
 *
 * @element lit-material-menu
 *
 * @slot - `lit-material-list-item` elements (or any other content).
 *
 * @csspart menu - The popover surface (background, padding, shape, elevation).
 *
 * @fires close - Fires after the menu closes, for any reason (item activation,
 *   `close()`, Escape, or an outside click).
 */
@customElement("lit-material-menu")
export class LitMaterialMenu extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** id of the trigger element to position and return focus to. See also `anchorElement`. */
  @property() anchor?: string;

  private explicitAnchorElement?: HTMLElement;

  constructor() {
    super();
    this.addEventListener("toggle", this.handleToggle as EventListener);
    this.addEventListener("keydown", this.handleKeydown);
    this.addEventListener("click", this.handleItemClick);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("popover", "auto");
    // Slotted lit-material-list-item children carry role="listitem", which
    // requires a role="list" ancestor — same as lit-material-list itself.
    this.setAttribute("role", "list");
    // Not in the tab order, but a valid `focus()` target: see `updated()`.
    this.tabIndex = -1;
  }

  /** The element the menu is positioned against and returns focus to on close. */
  get anchorElement(): HTMLElement | undefined {
    if (this.explicitAnchorElement) return this.explicitAnchorElement;
    if (this.anchor) {
      return (this.getRootNode() as Document | ShadowRoot).getElementById(this.anchor) ?? undefined;
    }
    return undefined;
  }

  set anchorElement(element: HTMLElement | undefined) {
    this.explicitAnchorElement = element;
  }

  /** Opens the menu, optionally anchoring to `anchorElement` instead of `anchor`/a previous anchorElement. */
  show(anchorElement?: HTMLElement): void {
    if (anchorElement) this.explicitAnchorElement = anchorElement;
    this.open = true;
  }

  close(): void {
    this.open = false;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) return;
    if (this.open) {
      if (!this.matches(":popover-open")) {
        this.showPopover();
        this.updatePosition();
        this.focus();
      }
    } else if (this.matches(":popover-open")) {
      this.hidePopover();
    }
  }

  override render() {
    return html`<slot part="menu"></slot>`;
  }

  /** Interactive, non-disabled `lit-material-list-item` children, in document order. */
  private get items(): HTMLElement[] {
    return Array.from(this.querySelectorAll("lit-material-list-item")).filter(
      (el) => !el.hasAttribute("disabled") && (el.hasAttribute("interactive") || el.hasAttribute("href")),
    ) as HTMLElement[];
  }

  private updatePosition(): void {
    const anchorEl = this.anchorElement;
    if (!anchorEl) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const menuRect = this.getBoundingClientRect();
    const gap = 4;

    let top = anchorRect.bottom + gap;
    if (top + menuRect.height > window.innerHeight) {
      const above = anchorRect.top - gap - menuRect.height;
      top = above >= 0 ? above : Math.max(0, window.innerHeight - menuRect.height);
    }

    let left = anchorRect.left;
    if (left + menuRect.width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - menuRect.width);
    }

    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  private readonly handleKeydown = (event: KeyboardEvent): void => {
    const forward = event.key === "ArrowDown";
    const backward = event.key === "ArrowUp";
    const home = event.key === "Home";
    const end = event.key === "End";
    if (!forward && !backward && !home && !end) return;

    const items = this.items;
    if (items.length === 0) return;
    event.preventDefault();

    const currentIndex = items.indexOf(document.activeElement as HTMLElement);
    let nextIndex: number;
    if (home) nextIndex = 0;
    else if (end) nextIndex = items.length - 1;
    else if (forward) nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % items.length;
    else nextIndex = currentIndex < 0 ? items.length - 1 : (currentIndex - 1 + items.length) % items.length;

    items[nextIndex]?.focus();
  };

  private readonly handleItemClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    if (this.items.some((item) => path.includes(item))) {
      this.close();
    }
  };

  private readonly handleToggle = (event: ToggleEvent): void => {
    const isOpen = event.newState === "open";
    this.open = isOpen;
    if (!isOpen) {
      this.anchorElement?.focus();
      this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-menu": LitMaterialMenu;
  }
}
