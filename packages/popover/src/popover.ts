import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./popover-styles.js";

let instanceCount = 0;

/**
 * A richer, click-triggered overlay — a title, body content (arbitrary
 * HTML, not just plain text), and optional footer actions — anchored to a
 * trigger element. Distinct from `lit-material-tooltip`: that's
 * hover/focus-triggered, plain text, and never gets a close button or
 * interactive content of its own; this is deliberately closer to
 * `lit-material-menu`'s foundation (native Popover API, `popover="auto"`
 * so outside-click/Escape light-dismiss come from the browser) than to
 * tooltip's `manual` popover.
 *
 * Positioning mirrors `lit-material-menu`'s: below the anchor by default,
 * flipping above if there's no room, clamped horizontally to the viewport
 * — a placement engine with more than two directions is a reasonable
 * follow-up rather than something to half-build here.
 *
 * `role="dialog"` needs an accessible name, which `aria-labelledby` supplies
 * by pointing at the slotted `header` element once one's assigned — unlike
 * `lit-material-dialog`'s equivalent wiring, that ID has to live in this
 * component's own *light* DOM (a direct child), not its shadow root:
 * `aria-labelledby` is set on the host itself here (role="dialog" lives on
 * the host, not an internal wrapper), and IDREF attributes only resolve
 * within the referencing element's own tree scope. A popover with no
 * `header` has no accessible name from this mechanism — give it one
 * yourself (`aria-label`) if you skip the header slot.
 *
 * @element lit-material-popover
 *
 * @slot header - Optional heading, next to the close button. Slot exactly one element.
 * @slot - The popover's body content.
 * @slot footer - Optional footer actions. For more than one, wrap them in a single element yourself so they end up in one row.
 *
 * @csspart popover - The popover surface (background, padding, shape, elevation).
 * @csspart header - The header row. Always rendered; see `dismissible`.
 * @csspart close - The close button. Only rendered when `dismissible`.
 * @csspart content - The body content container.
 *
 * @fires close - Fires after the popover closes, for any reason (the close button,
 *   `close()`, Escape, or an outside click).
 */
@customElement("lit-material-popover")
export class LitMaterialPopover extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** id of the trigger element to position and return focus to. See also `anchorElement`. */
  @property() anchor?: string;
  /** Shows a close button in the header. */
  @property({ type: Boolean }) dismissible = true;

  private explicitAnchorElement?: HTMLElement;

  constructor() {
    super();
    this.addEventListener("toggle", this.handleToggle as EventListener);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("popover", "auto");
    this.setAttribute("role", "dialog");
    this.tabIndex = -1;
  }

  /** The element the popover is positioned against and returns focus to on close. */
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

  /** Opens the popover, optionally anchoring to `anchorElement` instead of `anchor`/a previous anchorElement. */
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

  private updatePosition(): void {
    const anchorEl = this.anchorElement;
    if (!anchorEl) return;
    const anchorRect = anchorEl.getBoundingClientRect();
    const popoverRect = this.getBoundingClientRect();
    const gap = 8;

    let top = anchorRect.bottom + gap;
    if (top + popoverRect.height > window.innerHeight) {
      const above = anchorRect.top - gap - popoverRect.height;
      top = above >= 0 ? above : Math.max(0, window.innerHeight - popoverRect.height);
    }

    let left = anchorRect.left;
    if (left + popoverRect.width > window.innerWidth) {
      left = Math.max(0, window.innerWidth - popoverRect.width);
    }

    this.style.top = `${top}px`;
    this.style.left = `${left}px`;
  }

  private readonly handleToggle = (event: ToggleEvent): void => {
    const isOpen = event.newState === "open";
    this.open = isOpen;
    if (!isOpen) {
      this.anchorElement?.focus();
      this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
    }
  };

  private readonly handleHeaderSlotChange = (event: Event): void => {
    const assigned = (event.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
    if (!assigned) {
      this.removeAttribute("aria-labelledby");
      return;
    }
    if (!assigned.id) assigned.id = `lit-material-popover-header-${++instanceCount}`;
    this.setAttribute("aria-labelledby", assigned.id);
  };

  override render() {
    return html`
      <div class="header" part="header">
        <slot name="header" class="header-slot" @slotchange=${this.handleHeaderSlotChange}></slot>
        ${this.dismissible
          ? html`
              <button class="close" part="close" type="button" aria-label="Close" @click=${this.close}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                  <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                </svg>
              </button>
            `
          : nothing}
      </div>
      <div class="content" part="content"><slot></slot></div>
      <slot name="footer" class="footer"></slot>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-popover": LitMaterialPopover;
  }
}
