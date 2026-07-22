import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./drawer-styles.js";

export type DrawerPosition = "start" | "end";

/**
 * A non-modal, persistent overlay panel — for a notification drawer, an
 * activity feed, or any contextual panel that should stay open alongside
 * the page rather than blocking it. Built on the native Popover API
 * (`popover="manual"`, the same foundation `lit-material-tooltip` uses),
 * not `<dialog>`: there's no scrim, no focus trap, and no Escape-to-close,
 * because unlike `lit-material-side-sheet`'s `modal` variant, this
 * component doesn't demand the user deal with it before doing anything
 * else. `popover="manual"` also means it never light-dismisses on an
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
 */
@customElement("lit-material-drawer")
export class LitMaterialDrawer extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;

  /** Which viewport edge the drawer is anchored to. */
  @property({ reflect: true }) position: DrawerPosition = "end";

  protected override willUpdate(): void {
    // Not connectedCallback(): attribute mutations made there don't make it
    // into SSR's serialized host tag — willUpdate() runs inside the same
    // synchronous pass that produces SSR's output (see lit-material-tooltip
    // for the fuller explanation).
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "manual");
    if (!this.hasAttribute("role")) this.setAttribute("role", "complementary");
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) return;
    if (typeof this.showPopover !== "function") return; // SSR guard
    if (this.open) {
      if (!this.matches(":popover-open")) this.showPopover();
    } else if (this.matches(":popover-open")) {
      this.hidePopover();
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

  override render() {
    return html`
      <div class="header" part="header"><slot name="header"></slot></div>
      <div class="body" part="body"><slot></slot></div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-drawer": LitMaterialDrawer;
  }
}
