import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styles } from "./bottom-sheet-styles.js";

export type BottomSheetVariant = "standard" | "modal";

/**
 * Material Design 3 bottom sheet — a full-width panel of supplementary
 * content anchored to the bottom edge, the same standard/modal split as
 * `lit-material-side-sheet`/`lit-material-navigation-drawer`: `standard`
 * renders as a plain, always-in-flow container (e.g. a persistent player
 * bar docked at the bottom of your layout); `modal` (the default — a
 * bottom sheet is far more commonly a temporary, dismissible surface than
 * a persistent one) wraps the same content in a native `<dialog>`, so the
 * scrim, Escape-to-close, and focus trap all come from the browser.
 *
 * Shows a small drag-handle bar at the top by default (`showDragHandle`) —
 * purely decorative here, a visual affordance only. Dragging the sheet
 * itself to dismiss it is deliberately out of scope for this first pass;
 * see the README.
 *
 * @element lit-material-bottom-sheet
 *
 * @slot - The sheet's content.
 * @slot header - Optional header content (a title, a close button…), below the drag handle.
 *
 * @csspart dialog - The native `<dialog>` element. Only rendered for `modal`.
 * @csspart sheet - The visible panel (background, shape, padding).
 * @csspart drag-handle - The decorative handle bar, only rendered while `showDragHandle` is set.
 * @csspart header - The header slot's container.
 * @csspart content - The default slot's container.
 *
 * @fires cancel - `modal` only: re-dispatched from the native `cancel` event. Cancelable:
 *   calling `preventDefault()` stops the sheet from closing.
 * @fires close - `modal` only: re-dispatched from the native `close` event.
 */
@customElement("lit-material-bottom-sheet")
export class LitMaterialBottomSheet extends LitElement {
  static override styles = styles;

  @property() variant: BottomSheetVariant = "modal";

  /** Whether a `modal` sheet is open. Ignored for `standard`. */
  @property({ type: Boolean, reflect: true }) open = false;

  /** If set, clicking the backdrop does not close a `modal` sheet. */
  @property({ type: Boolean, attribute: "disable-backdrop-close" }) disableBackdropClose = false;

  /** Shows the decorative drag-handle bar at the top of the sheet. */
  @property({ type: Boolean, attribute: "show-drag-handle" }) showDragHandle = true;

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
        ${this.showDragHandle ? html`<div class="drag-handle" part="drag-handle"></div>` : nothing}
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
    "lit-material-bottom-sheet": LitMaterialBottomSheet;
  }
}
