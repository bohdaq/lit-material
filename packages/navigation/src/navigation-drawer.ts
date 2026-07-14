import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import type { LitMaterialNavigationDrawerItem } from "./navigation-drawer-item.js";
import { styles } from "./navigation-drawer-styles.js";

export type NavigationDrawerVariant = "standard" | "modal";
export type NavigationDrawerPosition = "start" | "end";

/**
 * Material Design 3 navigation drawer — a vertical panel of primary
 * destinations (`lit-material-navigation-drawer-item` elements).
 *
 * `standard` renders as a plain, always-in-flow `<nav>` (a persistent side
 * panel you place in your own layout). `modal` wraps the same content in a
 * native `<dialog>`, the same foundation `lit-material-dialog` uses — so the
 * scrim, Escape-to-close, and focus trap all come from the browser. `position`
 * picks which edge a `modal` drawer slides in from.
 *
 * Selection is index-based and managed here (like `lit-material-tabs`): set
 * `selected` to reflect your current route/section, and each item's own
 * `selected` is kept in sync automatically. Clicking an item updates
 * `selected` and fires `change` — items themselves don't manage selection.
 *
 * @element lit-material-navigation-drawer
 *
 * @slot - `lit-material-navigation-drawer-item` elements.
 * @slot header - Optional header content (a title, a close button…).
 *
 * @csspart dialog - The native `<dialog>` element. Only rendered for `modal`.
 * @csspart drawer - The visible panel (background, width, padding).
 * @csspart header - The header slot's container.
 * @csspart content - The items slot's container.
 *
 * @fires change - Fires when `selected` changes via an item click.
 * @fires cancel - `modal` only: re-dispatched from the native `cancel` event.
 *   Cancelable: calling `preventDefault()` stops the drawer from closing.
 * @fires close - `modal` only: re-dispatched from the native `close` event.
 */
@customElement("lit-material-navigation-drawer")
export class LitMaterialNavigationDrawer extends LitElement {
  static override styles = styles;

  @property() variant: NavigationDrawerVariant = "standard";
  @property({ reflect: true }) position: NavigationDrawerPosition = "start";

  /** Index of the selected item. `-1` means no selection. */
  @property({ type: Number }) selected = -1;

  /** Whether a `modal` drawer is open. Ignored for `standard`. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** If set, clicking the backdrop does not close a `modal` drawer. */
  @property({ type: Boolean, attribute: "disable-backdrop-close" }) disableBackdropClose = false;

  @query("dialog") private readonly dialogElement?: HTMLDialogElement;
  private reopenOnClose = false;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.syncSelected();
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (changed.has("selected")) this.syncSelected();
    if (changed.has("open") && this.variant === "modal" && this.dialogElement) {
      if (this.open && !this.dialogElement.open) {
        this.dialogElement.showModal();
      } else if (!this.open && this.dialogElement.open) {
        this.dialogElement.close();
      }
    }
  }

  /** Opens a `modal` drawer. Equivalent to setting `.open = true`. */
  show(): void {
    this.open = true;
  }

  /** Closes a `modal` drawer. Equivalent to setting `.open = false`. */
  close(): void {
    this.open = false;
  }

  private get items(): LitMaterialNavigationDrawerItem[] {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelectorAll on
    // the host during connectedCallback — degrade to no items rather than
    // throwing.
    if (typeof this.querySelectorAll !== "function") return [];
    return Array.from(this.querySelectorAll("lit-material-navigation-drawer-item"));
  }

  private syncSelected(): void {
    this.items.forEach((item, index) => {
      item.selected = index === this.selected;
    });
  }

  private readonly handleSlotChange = (): void => this.syncSelected();

  private readonly handleClick = (event: MouseEvent): void => {
    const path = event.composedPath();
    const items = this.items;
    const item = items.find((candidate) => path.includes(candidate));
    if (!item || item.disabled) return;
    const index = items.indexOf(item);
    const isChange = index !== this.selected;
    this.selected = index;
    if (isChange) this.dispatchEvent(new Event("change", { bubbles: true }));
  };

  private renderNav() {
    // For `modal`, showModal() auto-focuses the first focusable descendant
    // when nothing has autofocus — without this, that's the first item's
    // button, showing its focus ring on every open even though the user
    // never interacted with it (same fix as lit-material-dialog's
    // `container`). Harmless to skip for `standard`, since it's never the
    // target of showModal() in the first place.
    const isModal = this.variant === "modal";
    return html`
      <nav
        class="drawer ${this.variant}"
        part="drawer"
        tabindex=${isModal ? "-1" : nothing}
        ?autofocus=${isModal}
      >
        <div class="header" part="header"><slot name="header"></slot></div>
        <div class="content" part="content"><slot @slotchange=${this.handleSlotChange}></slot></div>
      </nav>
    `;
  }

  override render() {
    if (this.variant !== "modal") return this.renderNav();

    return html`
      <dialog
        class="dialog"
        part="dialog"
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
      >
        ${this.renderNav()}
      </dialog>
    `;
  }

  private handleClose(): void {
    if (this.reopenOnClose) {
      // Some browsers don't honor preventDefault() on the native `cancel`
      // event despite documenting it as cancelable — see lit-material-dialog
      // for the same workaround.
      this.reopenOnClose = false;
      this.dialogElement?.showModal();
      return;
    }
    this.open = false;
    this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
  }

  private handleCancel(event: Event): void {
    const proceed = this.dispatchEvent(new Event("cancel", { bubbles: true, cancelable: true, composed: true }));
    if (!proceed) {
      event.preventDefault();
      this.reopenOnClose = true;
    }
  }

  private handleBackdropClick(event: MouseEvent): void {
    if (!this.disableBackdropClose && event.target === this.dialogElement) {
      this.dialogElement?.close();
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-navigation-drawer": LitMaterialNavigationDrawer;
  }
}
