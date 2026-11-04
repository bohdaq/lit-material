import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";

const checkIcon = html`<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" /></svg>`;

/**
 * One plan: name, price, what it includes and an action. Marks the plan the
 * reader is on (`current`) and the one to suggest (`recommended`) in words,
 * not only by colour. Use it alone, or let `lit-material-plan-picker` lay
 * several out from data.
 *
 * @element lit-material-plan-card
 *
 * @slot - Extra content under the features, e.g. a limits table or a note.
 * @slot action - The plan's button, e.g. "Upgrade" or "Contact sales".
 *
 * @csspart card - The outlined box.
 * @csspart badge - The "Current plan" / "Recommended" label.
 * @csspart price - The price line.
 * @csspart features - The feature list.
 *
 * @cssprop --lit-material-plan-card-shape - Corner radius (default `--md-sys-shape-corner-large`).
 */
@customElement("lit-material-plan-card")
export class LitMaterialPlanCard extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    }
    :host([hidden]) {
      display: none;
    }
    .card {
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
      padding: 24px;
      border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
      border-radius: var(--lit-material-plan-card-shape, var(--md-sys-shape-corner-large, 16px));
      background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
    }
    :host([recommended]) .card {
      border: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    :host([current]) .card {
      background: var(--md-sys-color-secondary-container, light-dark(#e8def8, #4a4458));
      color: var(--md-sys-color-on-secondary-container, light-dark(#1d192b, #e8def8));
    }
    .top {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
    }
    .name {
      margin: 0;
      font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
      font-weight: var(--md-sys-typescale-title-large-weight, 400);
      line-height: 1.3;
    }
    .badge {
      padding: 2px 10px;
      border-radius: 999px;
      font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
      font-weight: 500;
      background: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      color: var(--md-sys-color-on-primary, light-dark(#ffffff, #381e72));
    }
    .description {
      margin: 0;
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    }
    :host([current]) .description {
      color: inherit;
    }
    .price {
      margin: 0;
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 6px;
    }
    .amount {
      font-size: var(--md-sys-typescale-display-small-size, 2.25rem);
      line-height: 1.1;
      font-variant-numeric: tabular-nums;
    }
    .period,
    .note {
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    }
    :host([current]) .period,
    :host([current]) .note {
      color: inherit;
    }
    .note {
      flex-basis: 100%;
    }
    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      display: grid;
      gap: 8px;
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    }
    li {
      display: flex;
      gap: 8px;
      align-items: flex-start;
    }
    svg {
      flex: none;
      width: 18px;
      height: 18px;
      margin-top: 1px;
      fill: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    }
    .action {
      margin-top: auto;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
  `;

  /** The plan's name. */
  @property() name = "";

  /** One line under the name: who it's for. */
  @property() description = "";

  /** The price as it should read, formatted by the app: `"$12"`, `"Free"`, `"Custom"`. */
  @property() price = "";

  /** After the price: `"per seat / month"`. */
  @property() period = "";

  /** A line under the price: `"billed yearly"`, `"2 months free"`. */
  @property({ attribute: "price-note" }) priceNote = "";

  /** What the plan includes, one entry per line. */
  @property({ type: Array }) features: string[] = [];

  /** The plan the reader is on. */
  @property({ type: Boolean, reflect: true }) current = false;

  /** The plan to suggest. `current` wins when both are set. */
  @property({ type: Boolean, reflect: true }) recommended = false;

  /** Level of the name's heading, so cards fit the page's outline. */
  @property({ type: Number, attribute: "heading-level" }) headingLevel = 3;

  private readonly localize = new LocalizeController(this);

  override render() {
    const badge = this.current
      ? this.localize.term("planCard.current", "Current plan")
      : this.recommended
        ? this.localize.term("planCard.recommended", "Recommended")
        : "";
    const level = Math.min(6, Math.max(1, this.headingLevel));
    return html`
      <article class="card" part="card">
        <div class="top">
          <p class="name" role="heading" aria-level=${level}>${this.name}</p>
          ${badge ? html`<span class="badge" part="badge">${badge}</span>` : nothing}
        </div>
        ${this.description ? html`<p class="description">${this.description}</p>` : nothing}
        ${this.price
          ? html`<p class="price" part="price">
              <span class="amount">${this.price}</span>
              ${this.period ? html`<span class="period">${this.period}</span>` : nothing}
              ${this.priceNote ? html`<span class="note">${this.priceNote}</span>` : nothing}
            </p>`
          : nothing}
        ${this.features.length
          ? html`<ul part="features">
              ${this.features.map((feature) => html`<li>${checkIcon}<span>${feature}</span></li>`)}
            </ul>`
          : nothing}
        <slot></slot>
        <div class="action"><slot name="action"></slot></div>
      </article>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-plan-card": LitMaterialPlanCard;
  }
}
