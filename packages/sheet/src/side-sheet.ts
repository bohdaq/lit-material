import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styles } from "./side-sheet-styles.js";

export type SideSheetVariant = "standard" | "modal";
export type SideSheetPosition = "start" | "end";

/**
 * Material Design 3 side sheet — a vertical panel of supplementary content
 * (details, filters, a contextual editor…), structurally the same
 * standard/modal split as `lit-material-navigation-drawer` minus the
 * selection model: `standard` renders as a plain, always-in-flow container
 * you place in your own layout; `modal` wraps the same content in a native
 * `<dialog>` (the same foundation `lit-material-dialog` uses), so the
 * scrim, Escape-to-close, and focus trap all come from the browser.
 * `position` picks which edge a `modal` sheet slides in from — `"end"`
 * (the right, in LTR) by default, since a side sheet is typically evoked
 * alongside primary navigation anchored to `"start"`, not on top of it.
 *
 * @element lit-material-side-sheet
 *
 * @slot - The sheet's content.
 * @slot header - Optional header content (a title, a close button…).
 *
 * @csspart dialog - The native `<dialog>` element. Only rendered for `modal`.
 * @csspart sheet - The visible panel (background, width, padding).
 * @csspart header - The header slot's container.
 * @csspart content - The default slot's container.
 *
 * @fires cancel - `modal` only: re-dispatched from the native `cancel` event. Cancelable:
 *   calling `preventDefault()` stops the sheet from closing.
 * @fires close - `modal` only: re-dispatched from the native `close` event.
 */
@customElement("lit-material-side-sheet")
export class LitMaterialSideSheet extends LitElement {
  static override styles = styles;

  @property() variant: SideSheetVariant = "standard";
  @property({ reflect: true }) position: SideSheetPosition = "end";

  /** Whether a `modal` sheet is open. Ignored for `standard`. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** If set, clicking the backdrop does not close a `modal` sheet. */
  @property({ type: Boolean, attribute: "disable-backdrop-close" }) disableBackdropClose = false;

  @query("dialog") private readonly dialogElement?: HTMLDialogElement;
  private reopenOnClose = false;

  /** Opens a `modal` sheet. Equivalent to setting `.open = true`. No visible effect for `standard`. */
  show(): void {
    this.open = true;
  }

  /** Closes a `modal` sheet. Equivalent to setting `.open = false`. No visible effect for `standard`. */
  close(): void {
    this.open = false;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open") || this.variant !== "modal" || !this.dialogElement) return;
    if (this.open && !this.dialogElement.open) {
      this.dialogElement.showModal();
    } else if (!this.open && this.dialogElement.open) {
      this.dialogElement.close();
    }
  }

  private renderSheet() {
    // For `modal`, showModal() auto-focuses the first focusable descendant
    // when nothing has autofocus — without this, that's whatever's first in
    // the default slot, showing its focus ring on every open even though
    // the user never interacted with it (same fix as lit-material-dialog's
    // `container`). Harmless to skip for `standard`, since it's never the
    // target of showModal() in the first place.
    const isModal = this.variant === "modal";
    return html`
      <div class="sheet ${this.variant}" part="sheet" tabindex=${isModal ? "-1" : nothing} ?autofocus=${isModal}>
        <div class="header" part="header"><slot name="header"></slot></div>
        <div class="content" part="content"><slot></slot></div>
      </div>
    `;
  }

  override render() {
    if (this.variant !== "modal") return this.renderSheet();

    return html`
      <dialog
        class="dialog"
        part="dialog"
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
      >
        ${this.renderSheet()}
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
    "lit-material-side-sheet": LitMaterialSideSheet;
  }
}
