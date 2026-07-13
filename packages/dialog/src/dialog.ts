import { html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { styles } from "./dialog-styles.js";

/**
 * Material Design 3 (basic) dialog, built on the native `<dialog>` element —
 * so focus trapping, initial focus, top-layer stacking, and Escape-to-close
 * all come from the browser rather than reimplemented JS.
 *
 * Native `close`/`cancel` events on `<dialog>` don't bubble or cross the
 * shadow boundary (per spec they're `bubbles: false`, and not composed), so
 * this re-dispatches its own bubbling, composed `close`/`cancel` events.
 *
 * @element lit-material-dialog
 *
 * @slot icon - An optional small icon shown centered above the headline.
 * @slot headline - The dialog's title.
 * @slot - The dialog's body content (supporting text, form fields, etc.).
 * @slot actions - Action buttons, right-aligned. A `<form method="dialog">`
 *   submit button inside this slot closes the dialog natively and sets
 *   `returnValue`, without any extra JS.
 *
 * @csspart dialog - The native `<dialog>` element. Transparent and sized to
 *   the viewport so clicks outside `container` can be detected as backdrop
 *   clicks; style the visible card via `container` instead.
 * @csspart container - The visible card (background, padding, shape, elevation).
 *
 * @fires cancel - Re-dispatched from the native `cancel` event (fired on Escape,
 *   before `close`). Cancelable: calling `preventDefault()` stops the dialog from closing.
 * @fires close - Re-dispatched from the native `close` event, after the dialog has closed.
 */
@customElement("lit-material-dialog")
export class LitMaterialDialog extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** If set, clicking the backdrop (outside the visible card) does not close the dialog. */
  @property({ type: Boolean, attribute: "disable-backdrop-close" }) disableBackdropClose = false;

  @query("dialog") private readonly dialogElement?: HTMLDialogElement;
  private reopenOnClose = false;

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open") || !this.dialogElement) return;
    if (this.open && !this.dialogElement.open) {
      this.dialogElement.showModal();
    } else if (!this.open && this.dialogElement.open) {
      this.dialogElement.close();
    }
  }

  /** Opens the dialog. Equivalent to setting `.open = true`. */
  show(): void {
    this.open = true;
  }

  /** Closes the dialog. Equivalent to setting `.open = false`. */
  close(returnValue?: string): void {
    this.open = false;
    if (returnValue !== undefined && this.dialogElement) {
      this.dialogElement.returnValue = returnValue;
    }
  }

  /** The value the dialog was closed with (via `close()` or a `method="dialog"` form submit). */
  get returnValue(): string {
    return this.dialogElement?.returnValue ?? "";
  }

  override render() {
    return html`
      <dialog
        class="dialog"
        part="dialog"
        aria-labelledby="headline"
        @close=${this.handleClose}
        @cancel=${this.handleCancel}
        @click=${this.handleBackdropClick}
      >
        <div class="container" part="container">
          <slot name="icon" class="icon"></slot>
          <slot name="headline" class="headline" id="headline"></slot>
          <div class="content"><slot></slot></div>
          <div class="actions"><slot name="actions"></slot></div>
        </div>
      </dialog>
    `;
  }

  private handleClose(): void {
    if (this.reopenOnClose) {
      // Some browsers don't actually honor `preventDefault()` on the native
      // `cancel` event (despite documenting it as cancelable), so the dialog
      // closes anyway — immediately reopening it makes `cancel` prevention
      // work regardless of that inconsistency.
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
    "lit-material-dialog": LitMaterialDialog;
  }
}
