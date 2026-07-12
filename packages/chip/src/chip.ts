import { html, LitElement, nothing } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { RippleController } from "@lit-material/core";
import { styles } from "./chip-styles.js";

export type ChipVariant = "assist" | "filter" | "input" | "suggestion";

/**
 * Material Design 3 chip.
 *
 * Unlike checkbox/radio/switch, chips are not form-associated: they're
 * auxiliary UI (filters, action triggers, removable tags) rather than a
 * value a `<form>` submits, matching how Material Design itself treats
 * chips. A `filter` chip's `selected` state and an `input` chip's removal
 * are communicated via `change`/`remove` events instead.
 *
 * @element lit-material-chip
 *
 * @slot - The chip's label.
 * @slot leading-icon - An optional icon before the label. Ignored on a
 *   selected `filter` chip, which shows a checkmark in its place.
 *
 * @csspart chip - The outer container (background/border/elevation).
 * @csspart action - The main clickable `<button>` or `<a>` (icon + label).
 * @csspart remove-button - The trailing remove `<button>`, when `removable`.
 * @csspart ripple - The state-layer element the hover/press feedback is drawn on.
 *
 * @fires change - Bubbles when a `filter` chip's `selected` state toggles via user interaction.
 * @fires remove - Cancelable; fires when the remove button is activated. Unless
 *   `event.preventDefault()` is called, the chip removes itself from the DOM afterward.
 */
@customElement("lit-material-chip")
export class LitMaterialChip extends LitElement {
  static override styles = styles;

  @property() variant: ChipVariant = "assist";
  @property({ type: Boolean, reflect: true }) selected = false;
  @property({ type: Boolean, reflect: true }) disabled = false;
  @property({ type: Boolean, reflect: true }) elevated = false;
  @property({ type: Boolean }) removable = false;

  /** If set, renders the main action as a link (`<a>`) instead of a `<button>`. */
  @property() href = "";
  @property() target = "";

  @query(".action") private readonly actionElement?: HTMLButtonElement | HTMLAnchorElement;

  private readonly ripple = new RippleController(this);

  protected override firstUpdated(): void {
    if (this.actionElement) {
      this.ripple.attach(this.actionElement);
    }
  }

  override render() {
    const isFilter = this.variant === "filter";
    const showCheckmark = isFilter && this.selected;

    const chipClasses = [
      "chip",
      this.variant,
      showCheckmark ? "selected" : "",
      this.elevated ? "elevated" : "",
    ]
      .filter(Boolean)
      .join(" ");

    const leading = showCheckmark
      ? html`
          <svg class="checkmark" viewBox="0 0 18 18" aria-hidden="true">
            <path d="M4 9.5 L7.2 12.7 L14 5.5"></path>
          </svg>
        `
      : html`<slot name="leading-icon" class="leading-icon"></slot>`;

    const actionContent = html`
      <div class="state-layer" part="ripple"></div>
      ${leading}
      <span class="label"><slot></slot></span>
    `;

    const action = this.href
      ? html`
          <a
            class="action"
            part="action"
            href=${this.disabled ? nothing : this.href}
            target=${this.target || nothing}
            rel=${this.target === "_blank" ? "noopener noreferrer" : nothing}
            aria-disabled=${this.disabled ? "true" : nothing}
            tabindex=${this.disabled ? "-1" : "0"}
            @click=${this.handleLinkClick}
          >
            ${actionContent}
          </a>
        `
      : html`
          <button
            class="action"
            part="action"
            type="button"
            ?disabled=${this.disabled}
            aria-pressed=${isFilter ? String(this.selected) : nothing}
            @click=${this.handleActionClick}
          >
            ${actionContent}
          </button>
        `;

    return html`
      <div class=${chipClasses} part="chip">
        ${action}
        ${this.removable
          ? html`
              <button
                class="remove"
                part="remove-button"
                type="button"
                ?disabled=${this.disabled}
                aria-label="Remove"
                @click=${this.handleRemoveClick}
              >
                <svg class="remove-icon" viewBox="0 0 18 18" aria-hidden="true">
                  <path d="M5 5 L13 13 M13 5 L5 13"></path>
                </svg>
              </button>
            `
          : nothing}
      </div>
    `;
  }

  private handleActionClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }
    if (this.variant === "filter") {
      this.selected = !this.selected;
      this.dispatchEvent(new Event("change", { bubbles: true }));
    }
  }

  private handleLinkClick(event: MouseEvent): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }

  private handleRemoveClick(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled) return;
    const proceed = this.dispatchEvent(
      new Event("remove", { bubbles: true, cancelable: true, composed: true }),
    );
    if (proceed) this.remove();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-chip": LitMaterialChip;
  }
}
