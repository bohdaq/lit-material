import { html, LitElement, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { copyText } from "@lit-material/clipboard/copy-text.js";
import { styles } from "./error-card-styles.js";

export type ErrorCardVariant = "error" | "warning";

const ICONS = {
  warning: svg`<svg viewBox="0 0 24 24" aria-hidden="true">
    <polygon points="12,3 22,20 2,20" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></polygon>
    <line x1="12" y1="9" x2="12" y2="14" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
    <circle cx="12" cy="17" r="1.15" fill="currentColor"></circle>
  </svg>`,
  error: svg`<svg viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"></circle>
    <line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="2" stroke-linecap="round"></line>
    <circle cx="12" cy="16.5" r="1.25" fill="currentColor"></circle>
  </svg>`,
};

const COPY_ICON = svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"></path></svg>`;
const CHECK_ICON = svg`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"></path></svg>`;
/** How long "Copied" stays up. */
const FEEDBACK_MS = 2000;

let nextId = 0;

/**
 * A failure explained: a short headline ("Connection refused"), what to try
 * next, optional actions (Retry, Open settings), and the raw error text —
 * an engine message, a stack, a response body — under a collapsible
 * Details block with a copy button, so people can report it.
 *
 * The headline and details are attributes, so the card renders on the
 * server. `variant="warning"` is for something that worked partly or may
 * fail. The card isn't announced by default (it often shows on a page
 * that just loaded); add `alert` when it appears in response to what
 * someone just did, and it becomes an assertive live region (`role="alert"`).
 *
 * @element lit-material-error-card
 *
 * @slot - What to try next.
 * @slot actions - Buttons or links (Retry, Open settings…).
 *
 * @csspart card - The container.
 * @csspart icon - The error or warning icon.
 * @csspart headline - The headline.
 * @csspart toggle - The Details button.
 * @csspart details - The raw text.
 * @csspart copy - The Copy details button.
 *
 * @cssprop --lit-material-error-card-warning-color - Warning icon and border colour.
 * @cssprop --lit-material-error-card-warning-container - Warning background.
 * @cssprop --lit-material-error-card-details-max-height - The Details block scrolls past this height (default `16rem`).
 *
 * @fires toggle - The Details block opened or closed; `detail: { open }`.
 */
@customElement("lit-material-error-card")
export class LitMaterialErrorCard extends LitElement {
  static override styles = styles;

  /** What went wrong, in a few words ("Host not found"). */
  @property() headline = "";
  /** The raw text (an engine message, a stack trace). Shown under Details with a copy button; none, no Details. */
  @property() details = "";
  /** `error` or `warning`. */
  @property({ reflect: true }) variant: ErrorCardVariant = "error";
  /** Announce the card as it appears (`role="alert"`). */
  @property({ type: Boolean, reflect: true }) alert = false;
  /** Whether the Details block is open. */
  @property({ type: Boolean, reflect: true }) open = false;

  // Empty slot areas collapse once known (after hydration on the server path, which can't see light DOM).
  @state() private emptyBody = false;
  @state() private emptyActions = false;
  @state() private copied: "" | "ok" | "failed" = "";
  private copyTimer?: ReturnType<typeof setTimeout>;

  private readonly localize = new LocalizeController(this);
  private readonly detailsId = `lit-material-error-card-${++nextId}`;

  protected override willUpdate(): void {
    if (this.alert) this.setAttribute("role", "alert");
    else if (this.getAttribute("role") === "alert") this.removeAttribute("role");
  }

  protected override firstUpdated(): void {
    for (const slot of this.renderRoot.querySelectorAll<HTMLSlotElement>("slot")) slot.dispatchEvent(new Event("slotchange"));
  }

  private onSlotChange(event: Event): void {
    const slot = event.target as HTMLSlotElement;
    const empty = slot
      .assignedNodes({ flatten: true })
      .every((n) => n.nodeType === Node.COMMENT_NODE || (n.nodeType === Node.TEXT_NODE && !n.textContent?.trim()));
    if (slot.name === "actions") this.emptyActions = empty;
    else this.emptyBody = empty;
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    clearTimeout(this.copyTimer);
  }

  /** Copies the details text; resolves whether it worked. */
  async copyDetails(): Promise<boolean> {
    const ok = await copyText(this.details);
    this.copied = ok ? "ok" : "failed";
    clearTimeout(this.copyTimer);
    this.copyTimer = setTimeout(() => (this.copied = ""), FEEDBACK_MS);
    return ok;
  }

  private toggleDetails(): void {
    this.open = !this.open;
    this.dispatchEvent(new CustomEvent("toggle", { bubbles: true, composed: true, detail: { open: this.open } }));
  }

  override render() {
    const warning = this.variant === "warning";
    const kind = warning ? this.localize.term("errorCard.warning", "Warning") : this.localize.term("errorCard.error", "Error");
    return html`
      <div class="card" part="card">
        <span class="icon" part="icon">${warning ? ICONS.warning : ICONS.error}</span>
        <div class="main">
          <div class="headline" part="headline"><span class="visually-hidden">${kind}: </span>${this.headline}</div>
          <div class="body ${this.emptyBody ? "empty" : ""}"><slot @slotchange=${this.onSlotChange}></slot></div>
          <div class="actions ${this.emptyActions ? "empty" : ""}"><slot name="actions" @slotchange=${this.onSlotChange}></slot></div>
          ${this.details
            ? html`
                <div class="details-row">
                  <button
                    class="toggle"
                    part="toggle"
                    type="button"
                    aria-expanded=${this.open ? "true" : "false"}
                    aria-controls=${this.detailsId}
                    @click=${this.toggleDetails}
                  >
                    <svg class="chevron" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6l6 6-6 6"></path></svg>
                    ${this.localize.term("errorCard.details", "Details")}
                  </button>
                  ${this.open
                    ? html`<button class="copy" part="copy" type="button" @click=${() => void this.copyDetails()}>
                        <span class="copy-icon">${this.copied === "ok" ? CHECK_ICON : COPY_ICON}</span>
                        ${this.localize.term("errorCard.copyDetails", "Copy details")}
                      </button>`
                    : nothing}
                  <span class="visually-hidden" role="status"
                    >${this.copied === "ok"
                      ? this.localize.term("errorCard.copied", "Copied")
                      : this.copied === "failed"
                        ? this.localize.term("errorCard.copyFailed", "Couldn't copy")
                        : nothing}</span
                  >
                </div>
                <pre class="details" part="details" id=${this.detailsId} ?hidden=${!this.open}>${this.details}</pre>
              `
            : nothing}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-error-card": LitMaterialErrorCard;
  }
}
