import { html, LitElement, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./alert-styles.js";

export type AlertVariant = "info" | "success" | "warning" | "error";

const ICONS: Record<AlertVariant, ReturnType<typeof svg>> = {
  info: svg`
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
      <line x1="12" y1="11" x2="12" y2="16" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="12" cy="7.5" r="1.25" fill="currentColor"></circle>
    </svg>
  `,
  success: svg`
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
      <polyline points="7,12.5 10.5,16 17,8.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></polyline>
    </svg>
  `,
  warning: svg`
    <svg viewBox="0 0 24 24">
      <polygon points="12,3 22,20 2,20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></polygon>
      <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="12" cy="17" r="1.15" fill="currentColor"></circle>
    </svg>
  `,
  error: svg`
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
      <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
      <circle cx="12" cy="16.5" r="1.25" fill="currentColor"></circle>
    </svg>
  `,
};

/**
 * A persistent inline/page-level banner — distinct from
 * `lit-material-snackbar`, which is a transient, Popover-API-based toast
 * that shows up temporarily and floats above content. An alert is a normal
 * part of the page layout: it stays until the user dismisses it (or the
 * consumer removes it), and never auto-dismisses on its own.
 *
 * `warning`/`error` render `role="alert"` (an assertive live region);
 * `info`/`success` render `role="status"` (polite) — reserving the more
 * interruptive announcement for the variants where that's actually
 * warranted, rather than every alert regardless of severity.
 *
 * @element lit-material-alert
 *
 * @slot icon - Overrides the variant's default icon.
 * @slot title - Optional heading, above the description. Slot exactly one element.
 * @slot - The alert's description/body text.
 * @slot action - Optional action buttons/links. For more than one, wrap them in a single element yourself so they end up in one row.
 *
 * @csspart alert - The banner (background, padding, shape).
 * @csspart icon - The icon container.
 * @csspart body - The title/description/action container.
 * @csspart close - The dismiss button. Only rendered when `dismissible`.
 *
 * @fires close - Fires when dismissed via the close button. Not cancelable — see `dismiss()`.
 */
@customElement("lit-material-alert")
export class LitMaterialAlert extends LitElement {
  static override styles = styles;

  @property() variant: AlertVariant = "info";
  @property({ type: Boolean, reflect: true }) dismissible = false;

  // Tracks whether the current "role" attribute is one *we* set (and should
  // keep in sync as `variant` changes) versus one the author supplied in
  // markup (which we never touch again, once seen).
  private roleIsOwn = false;

  protected override willUpdate(): void {
    if (this.hasAttribute("role") && !this.roleIsOwn) return;
    this.setAttribute("role", this.variant === "warning" || this.variant === "error" ? "alert" : "status");
    this.roleIsOwn = true;
  }

  /** Hides the alert (via the native `hidden` attribute) and fires `close`. */
  dismiss(): void {
    this.hidden = true;
    this.dispatchEvent(new Event("close", { bubbles: true }));
  }

  override render() {
    return html`
      <div class="alert" part="alert">
        <span class="icon" part="icon" aria-hidden="true">
          <slot name="icon">${ICONS[this.variant]}</slot>
        </span>
        <div class="body" part="body">
          <slot name="title" class="title"></slot>
          <div class="description" part="description"><slot></slot></div>
          <slot name="action" class="actions"></slot>
        </div>
        ${this.dismissible
          ? html`
              <button class="close" part="close" type="button" aria-label="Dismiss" @click=${this.dismiss}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                  <line x1="6" y1="18" x2="18" y2="6" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
                </svg>
              </button>
            `
          : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-alert": LitMaterialAlert;
  }
}
