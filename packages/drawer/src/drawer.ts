import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./drawer-styles.js";

export type DrawerPosition = "start" | "end";

let headingCount = 0;

/** The element that really has focus, through shadow roots. */
function deepActive(): HTMLElement | undefined {
  let el = document.activeElement as HTMLElement | null;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement as HTMLElement;
  return el ?? undefined;
}

/**
 * A non-modal, persistent overlay panel — for a notification drawer, an
 * activity feed, or any contextual panel that should stay open alongside
 * the page rather than blocking it. Built on the native Popover API
 * (`popover="manual"`, the same foundation `lit-material-tooltip` uses),
 * not `<dialog>`: there's no scrim and no focus trap, because unlike
 * `lit-material-side-sheet`'s `modal` variant, this component doesn't
 * demand the user deal with it before doing anything else.
 *
 * Keyboard: opening it moves focus into it (its first focusable element,
 * else the drawer itself), Escape inside it closes it, and closing returns
 * focus to where it was. Name it with `label` (or a header with an `id`,
 * which it uses automatically). `popover="manual"` also means it never light-dismisses on an
 * outside click the way an `auto` popover (`lit-material-menu`,
 * `lit-material-speed-dial`) would — "persistent" is the point, so closing
 * it is always an explicit action (a close button in `header`, or setting
 * `open = false` yourself).
 *
 * Being a popover, it renders in the browser's top layer — always above
 * other content, with no z-index bookkeeping required — and is
 * `position: fixed` to the viewport, sized and positioned by `position`
 * rather than by wherever it happens to sit in the DOM.
 *
 * @element lit-material-drawer
 *
 * @slot header - Optional header content — typically a title and a close button, as a single wrapping element.
 * @slot - The drawer's content.
 *
 * @csspart header - The header slot's container.
 * @csspart body - The main content's container.
 *
 * @fires close - Fires after the drawer closes (Escape, `close()`, or `open = false`).
 */
@customElement("lit-material-drawer")
export class LitMaterialDrawer extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;

  /** Which viewport edge the drawer is anchored to. */
  @property({ reflect: true }) position: DrawerPosition = "end";

  /** The drawer's accessible name. Without it, the header slot's element names it. */
  @property() label?: string;

  /** Where focus was before the drawer opened, to return it there on close. */
  private returnFocus?: HTMLElement;

  constructor() {
    super();
    this.addEventListener("keydown", (event: KeyboardEvent) => {
      if (event.key === "Escape" && this.open) {
        event.stopPropagation();
        this.close();
      }
    });
  }

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output (see lit-material-tooltip
    // for the fuller explanation).
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "manual");
    if (!this.hasAttribute("role")) this.setAttribute("role", "complementary");
    if (this.label) this.setAttribute("aria-label", this.label);
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) return;
    if (typeof this.showPopover !== "function") return; // SSR guard
    if (this.open) {
      if (!this.matches(":popover-open")) {
        this.returnFocus = deepActive();
        this.showPopover();
        this.focusFirst();
      }
    } else if (this.matches(":popover-open")) {
      const focusInside = this.contains(deepActive() ?? null) || this.shadowRoot?.contains(deepActive() ?? null);
      this.hidePopover();
      if (focusInside || deepActive() === document.body) this.returnFocus?.focus();
      this.returnFocus = undefined;
      this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
    }
  }

  /** Opens the drawer. Equivalent to setting `.open = true`. */
  show(): void {
    this.open = true;
  }

  /** Closes the drawer. Equivalent to setting `.open = false`. */
  close(): void {
    this.open = false;
  }

  private focusFirst(): void {
    const focusable = [...this.querySelectorAll<HTMLElement>("*")].find(
      (el) => el.tabIndex >= 0 && !el.hasAttribute("disabled") && !el.closest("[inert]") && el.getClientRects().length > 0,
    );
    if (focusable) focusable.focus();
    else {
      if (!this.hasAttribute("tabindex")) this.tabIndex = -1;
      this.focus();
    }
  }

  private readonly handleHeaderSlotChange = (event: Event): void => {
    if (this.label || this.hasAttribute("aria-label")) return;
    const header = (event.target as HTMLSlotElement).assignedElements()[0] as HTMLElement | undefined;
    const heading = header?.matches("h1, h2, h3, h4, h5, h6, [id]") ? header : header?.querySelector<HTMLElement>("h1, h2, h3, h4, h5, h6");
    if (!heading) return;
    if (!heading.id) heading.id = `lit-material-drawer-heading-${++headingCount}`;
    this.setAttribute("aria-labelledby", heading.id);
  };

  override render() {
    return html`
      <div class="header" part="header"><slot name="header" @slotchange=${this.handleHeaderSlotChange}></slot></div>
      <div class="body" part="body"><slot></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-drawer": LitMaterialDrawer;
  }
}
