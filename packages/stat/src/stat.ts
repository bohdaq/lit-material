import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { styles } from "./stat-styles.js";

export type StatTrend = "up" | "down" | "flat";
export type StatVariant = "outlined" | "filled" | "plain";

/**
 * A stat tile: what is measured, its value large, and an optional caption
 * or trend underneath — the building block of a dashboard's summary row.
 *
 * The value is text you format (`"1,284"`, `"4.2 ms"`, `"99.95%"`), shown in
 * tabular figures so a refreshing number doesn't jitter. A trend shows an
 * arrow *and* its words (`trend-label`), so its direction never rests on
 * colour; whether up is good is yours to say with `trend-sentiment`.
 *
 * The tile is one group for screen readers, read as "label, value, caption".
 *
 * @element lit-material-stat
 *
 * @slot icon - An optional icon beside the label.
 * @slot caption - Rich caption content (replaces the `caption` text).
 *
 * @cssprop --lit-material-stat-value-font - The value's font family, e.g. monospace (default: inherited).
 * @cssprop --lit-material-stat-value-size - The value's font size (default `1.5rem`).
 * @cssprop --lit-material-stat-value-line-height - The value's line height (default `2rem`).
 * @cssprop --lit-material-stat-value-weight - The value's font weight (default `600`).
 *
 * @csspart stat - The tile.
 * @csspart label - The label.
 * @csspart value - The value.
 * @csspart caption - The caption row.
 */
@customElement("lit-material-stat")
export class LitMaterialStat extends LitElement {
  static override styles = styles;

  /** What is measured. */
  @property() label = "";

  /** The value, already formatted. */
  @property() value = "";

  /** A line under the value, e.g. "of 2,000 requests". */
  @property() caption = "";

  /** Direction of change: `up`, `down` or `flat`. */
  @property() trend?: StatTrend;

  /** The change in words, e.g. "+4.1% since yesterday" (required with `trend`, read aloud). */
  @property({ attribute: "trend-label" }) trendLabel = "";

  /** Whether the trend is `positive`, `negative` or `neutral` (default) — colours it. */
  @property({ attribute: "trend-sentiment" }) trendSentiment: "positive" | "negative" | "neutral" = "neutral";

  @property({ reflect: true }) variant: StatVariant = "outlined";

  private arrow() {
    switch (this.trend) {
      case "up":
        return "↑";
      case "down":
        return "↓";
      case "flat":
        return "→";
      default:
        return "";
    }
  }

  override render() {
    const trend = this.trend && this.trendLabel;
    return html`
      <div class="stat ${this.variant}" part="stat" role="group" aria-label=${this.label || nothing}>
        <div class="label" part="label"><slot name="icon"></slot><span>${this.label}</span></div>
        <div class="value" part="value">${this.value}</div>
        <div class="caption" part="caption">
          ${trend
            ? html`<span class="trend ${this.trendSentiment}"><span aria-hidden="true">${this.arrow()}</span> ${this.trendLabel}</span>`
            : nothing}
          <slot name="caption">${this.caption ? html`<span>${this.caption}</span>` : nothing}</slot>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-stat": LitMaterialStat;
  }
}
