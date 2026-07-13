import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./snackbar-styles.js";

/**
 * Material Design 3 snackbar — a brief, non-modal status message, built on
 * the native Popover API in `manual` mode for top-layer rendering without
 * any of the automatic light-dismiss behavior `auto` mode has (a snackbar
 * shouldn't disappear just because the user clicked elsewhere on the page).
 *
 * Unlike `lit-material-dialog`/`lit-material-menu`, opening a snackbar never
 * steals focus — it's a passive notification, not something the user is
 * expected to interact with immediately.
 *
 * Only one snackbar instance is meant to be visible at a time; for a queue of
 * messages, reuse a single instance and update its slotted content before
 * each `show()` rather than stacking multiple instances.
 *
 * @element lit-material-snackbar
 *
 * @slot - The message text.
 * @slot action - An optional action (e.g. a `lit-material-button variant="text"`).
 *   Activating it closes the snackbar, same as `closable`'s dismiss button.
 *
 * @csspart snackbar - The surface (background, padding, shape, elevation).
 * @csspart close-button - The trailing dismiss button, when `closable`.
 *
 * @fires close - Fires after the snackbar closes, for any reason (timeout,
 *   the action, the close button, or `close()`).
 */
@customElement("lit-material-snackbar")
export class LitMaterialSnackbar extends LitElement {
  static override styles = styles;

  @property({ type: Boolean, reflect: true }) open = false;
  /** Auto-dismiss timeout in ms. Set to 0 to disable auto-dismiss entirely. */
  @property({ type: Number }) duration = 5000;
  /** Shows a trailing "×" button that dismisses the snackbar. */
  @property({ type: Boolean }) closable = false;

  private timeoutId?: number;

  constructor() {
    super();
    this.addEventListener("click", this.handleClick);
    this.addEventListener("pointerenter", this.pauseTimer);
    this.addEventListener("pointerleave", this.resumeTimer);
    this.addEventListener("focusin", this.pauseTimer);
    this.addEventListener("focusout", this.resumeTimer);
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute("popover", "manual");
    this.setAttribute("role", "status");
    this.setAttribute("aria-live", "polite");
    this.setAttribute("aria-atomic", "true");
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.clearTimer();
  }

  /** Opens the snackbar and (re)starts its auto-dismiss timer. */
  show(): void {
    this.open = true;
  }

  /** Closes the snackbar and cancels its auto-dismiss timer. */
  close(): void {
    this.open = false;
  }

  protected override updated(changed: Map<string, unknown>): void {
    if (!changed.has("open")) return;
    if (this.open) {
      if (!this.matches(":popover-open")) {
        this.showPopover();
      }
      this.startTimer();
    } else if (this.matches(":popover-open")) {
      this.clearTimer();
      this.hidePopover();
      this.dispatchEvent(new Event("close", { bubbles: true, composed: true }));
    }
  }

  override render() {
    return html`
      <div class="content" part="snackbar">
        <slot></slot>
      </div>
      <slot name="action" class="action"></slot>
      ${this.closable
        ? html`
            <button class="close" part="close-button" type="button" aria-label="Dismiss" @click=${this.close}>
              <svg viewBox="0 0 18 18" aria-hidden="true">
                <path d="M5 5 L13 13 M13 5 L5 13"></path>
              </svg>
            </button>
          `
        : nothing}
    `;
  }

  private startTimer(): void {
    this.clearTimer();
    if (this.duration > 0) {
      this.timeoutId = window.setTimeout(() => this.close(), this.duration);
    }
  }

  private clearTimer(): void {
    if (this.timeoutId !== undefined) {
      window.clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }
  }

  private readonly pauseTimer = (): void => {
    if (this.open) this.clearTimer();
  };

  private readonly resumeTimer = (): void => {
    if (this.open) this.startTimer();
  };

  private readonly handleClick = (event: MouseEvent): void => {
    const target = event.target as HTMLElement;
    if (target.closest('[slot="action"]')) {
      this.close();
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-snackbar": LitMaterialSnackbar;
  }
}
