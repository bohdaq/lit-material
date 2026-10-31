import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatNumber } from "./scale.js";
import { styles } from "./bar-chart-styles.js";

export interface BarDatum {
  name: string;
  value: number;
}

/**
 * A horizontal bar chart comparing one value across named items, e.g.
 * requests per second per server.
 *
 * Bars start at zero and share one scale. Set `highlight` to an item's name
 * to emphasise it: that bar gets the accent colour and the only direct
 * value label, the rest go grey and show their value on hover or focus.
 * Without `highlight` every bar is the first series colour and labelled.
 *
 * Focus the chart and use ↑ ↓ (Home / End) to read the bars one by one.
 * Screen readers get the chart's `label`, and a data table after it.
 * Rendered in HTML with percentage widths, so it lays out on the server
 * with no measuring.
 *
 * @element lit-material-bar-chart
 *
 * @csspart chart - The rows container.
 * @csspart tooltip - The hover/focus readout.
 *
 * @cssprop --lit-material-chart-series-1 - Bar colour without `highlight`, and the highlighted bar's colour by default.
 * @cssprop --lit-material-bar-chart-highlight - The highlighted bar's colour.
 * @cssprop --lit-material-bar-chart-muted - The other bars' colour when `highlight` is set.
 * @cssprop --lit-material-bar-chart-name-width - Width of the name column (112px).
 */
@customElement("lit-material-bar-chart")
export class LitMaterialBarChart extends LitElement {
  static override styles = styles;

  /** The bars, drawn in this order unless `sort` is set. Non-finite values are skipped; negatives draw as zero. */
  @property({ attribute: false }) data: BarDatum[] = [];

  /** The chart's accessible name, e.g. "Requests per second, higher is better". */
  @property() label = "";

  /** Name of the item to emphasise. */
  @property() highlight = "";

  /** `desc` or `asc` sorts by value; anything else keeps the given order. */
  @property() sort: "" | "desc" | "asc" = "";

  /** A unit appended to values, e.g. "req/s". */
  @property() unit = "";

  /** Formats values (default: compact numbers). */
  @property({ attribute: false }) format: (n: number) => string = formatNumber;

  /** The bar whose value the tooltip shows, or -1. */
  @state() private active = -1;

  private get rows(): BarDatum[] {
    const rows = this.data.filter((d) => Number.isFinite(d.value));
    if (this.sort === "desc") rows.sort((a, b) => b.value - a.value);
    else if (this.sort === "asc") rows.sort((a, b) => a.value - b.value);
    return rows;
  }

  private text(d: BarDatum): string {
    return `${this.format(d.value)}${this.unit ? ` ${this.unit}` : ""}`;
  }

  private onKey(event: KeyboardEvent, count: number): void {
    if (event.key === "Escape") {
      this.active = -1;
      return;
    }
    const moves: Record<string, (i: number) => number> = {
      ArrowDown: (i) => i + 1,
      ArrowUp: (i) => (i < 0 ? count - 1 : i - 1),
      Home: () => 0,
      End: () => count - 1,
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    this.active = Math.min(count - 1, Math.max(0, move(this.active)));
  }

  override render() {
    const rows = this.rows;
    const name = this.label || "Bar chart";
    if (rows.length === 0) {
      return html`<div class="empty" role="img" aria-label="${name}: no data">No data</div>`;
    }
    const max = Math.max(0, ...rows.map((d) => d.value)) || 1;
    const emphasis = this.highlight !== "" && rows.some((d) => d.name === this.highlight);
    const active = rows[this.active];

    return html`
      <div
        class="chart"
        part="chart"
        role="img"
        aria-label="${name}. ${rows.map((d) => `${d.name}: ${this.text(d)}`).join("; ")}"
        tabindex="0"
        @keydown=${(e: KeyboardEvent) => this.onKey(e, rows.length)}
        @pointerleave=${() => (this.active = -1)}
        @blur=${() => (this.active = -1)}
      >
        ${rows.map((d, i) => {
          const mine = emphasis && d.name === this.highlight;
          const f = Math.max(0, d.value) / max;
          const classes = ["row", mine ? "highlight" : "", emphasis && !mine ? "muted" : "", i === this.active ? "active" : ""].join(" ");
          return html`<div class=${classes} aria-hidden="true" @pointerenter=${() => (this.active = i)} @pointerdown=${() => (this.active = i)}>
            <span class="name">${d.name}</span>
            <span class="track" style="--f: ${f.toFixed(4)}">
              <span class="bar"></span>
              ${!emphasis || mine ? html`<span class="value">${this.text(d)}</span>` : nothing}
            </span>
          </div>`;
        })}
        ${active
          ? html`<div class="tooltip" part="tooltip" role="status" style="top: calc(${this.active} * var(--row-pitch))">
              ${active.name}: <strong>${this.text(active)}</strong>
            </div>`
          : nothing}
      </div>
      <table class="visually-hidden">
        <caption>${name}</caption>
        <thead>
          <tr>
            <th scope="col">Name</th>
            <th scope="col">Value${this.unit ? ` (${this.unit})` : ""}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((d) => html`<tr><th scope="row">${d.name}</th><td>${this.format(d.value)}</td></tr>`)}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-bar-chart": LitMaterialBarChart;
  }
}
