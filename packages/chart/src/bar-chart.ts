import { html, LitElement, nothing } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { formatNumber, splitAtValue, VALUE_MARKER } from "./scale.js";
import { styles } from "./bar-chart-styles.js";
import { cssProps } from "@lit-material/core/css-props.js";

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
  @property({ type: Array }) data: BarDatum[] = [];

  /** The chart's accessible name, e.g. "Requests per second, higher is better". Unset, "Bar chart", translated. */
  @property() label = "";

  /** Name of the item to emphasise. */
  @property() highlight = "";

  /** `desc` or `asc` sorts by value; anything else keeps the given order. */
  @property() sort: "" | "desc" | "asc" = "";

  /** A unit appended to values, e.g. "req/s". */
  @property() unit = "";

  /** Formats values. Default: compact numbers in the element's language. */
  @property({ attribute: false }) format?: (n: number) => string;

  private readonly localize = new LocalizeController(this);

  /** The bar whose value the tooltip shows, or -1. */
  @state() private active = -1;

  private get rows(): BarDatum[] {
    const rows = this.data.filter((d) => Number.isFinite(d.value));
    if (this.sort === "desc") rows.sort((a, b) => b.value - a.value);
    else if (this.sort === "asc") rows.sort((a, b) => a.value - b.value);
    return rows;
  }

  private formatValue(n: number): string {
    return this.format ? this.format(n) : formatNumber(n, this.localize.lang);
  }

  /** A value with its unit; `value` is the formatted number (or `VALUE_MARKER`). */
  private withUnit(value: string): string {
    return this.unit ? this.localize.term("chart.valueWithUnit", "{value} {unit}", { value, unit: this.unit }) : value;
  }

  private text(d: BarDatum): string {
    return this.withUnit(this.formatValue(d.value));
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

  /** "name: value unit", translated, with the value (and its unit) in bold. */
  private renderReadout(d: BarDatum) {
    const [before, after] = splitAtValue(this.localize.term("chart.nameValue", "{name}: {value}", { name: d.name, value: VALUE_MARKER }));
    return html`${before}<strong>${this.text(d)}</strong>${after}`;
  }

  override render() {
    const rows = this.rows;
    const name = this.label || this.localize.term("chart.barChart", "Bar chart");
    if (rows.length === 0) {
      const label = this.localize.term("chart.nameNoData", "{name}: no data", { name });
      return html`<div class="empty" role="img" aria-label=${label}>${this.localize.term("chart.noData", "No data")}</div>`;
    }
    const max = Math.max(0, ...rows.map((d) => d.value)) || 1;
    const emphasis = this.highlight !== "" && rows.some((d) => d.name === this.highlight);
    const active = rows[this.active];

    return html`
      <div
        class="chart"
        part="chart"
        role="img"
        aria-label=${this.localize.term("chart.labelSummary", "{label}. {summary}", {
          label: name,
          summary: rows
            .map((d) => this.localize.term("chart.nameValue", "{name}: {value}", { name: d.name, value: this.text(d) }))
            .join(this.localize.term("chart.listSeparator", "; ")),
        })}
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
            <span class="track" style=${cssProps({ "--f": f.toFixed(4) })}>
              <span class="bar"></span>
              ${!emphasis || mine ? html`<span class="value">${this.text(d)}</span>` : nothing}
            </span>
          </div>`;
        })}
        ${active
          ? html`<div class="tooltip" part="tooltip" role="status" style=${cssProps({ top: `calc(${this.active} * var(--row-pitch))` })}>
              ${this.renderReadout(active)}
            </div>`
          : nothing}
      </div>
      <table class="visually-hidden">
        <caption>${name}</caption>
        <thead>
          <tr>
            <th scope="col">${this.localize.term("chart.name", "Name")}</th>
            <th scope="col">${this.unit
              ? this.localize.term("chart.valueInUnit", "Value ({unit})", { unit: this.unit })
              : this.localize.term("chart.value", "Value")}</th>
          </tr>
        </thead>
        <tbody>
          ${rows.map((d) => html`<tr><th scope="row">${d.name}</th><td>${this.formatValue(d.value)}</td></tr>`)}
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
