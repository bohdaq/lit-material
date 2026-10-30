import { html, LitElement, nothing, svg } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { formatNumber, linearTicks, niceTicks, spread } from "./scale.js";
import { styles } from "./line-chart-styles.js";

export interface ChartPoint {
  /** A number, or a time in milliseconds (format it with `formatX`). */
  x: number;
  y: number;
}

export interface ChartSeries {
  name: string;
  points: ChartPoint[];
}

/** Series past this are not drawn: fold the rest into "Other" or use small multiples. */
export const MAX_SERIES = 8;
/** Direct end-of-line labels are drawn up to this many series. */
const MAX_DIRECT_LABELS = 4;
const PAD_TOP = 8;
const PAD_BOTTOM = 28;
const PAD_LEFT_MIN = 40;
const TABLE_ROWS = 200;

/**
 * A line chart for one to eight series over a shared x axis (numbers or
 * times).
 *
 * Marks follow plain data-visualisation rules: 2px lines, a recessive grid, one y axis
 * starting at zero unless `y-min` says otherwise, colours in a fixed order
 * (`--lit-material-chart-series-1` … `-8`, never cycled). Two or more series
 * get a legend; up to four are also labelled at the end of their line, so
 * identity never rests on colour.
 *
 * Hover, touch, or focus the chart and use ← → to move a crosshair that
 * reads every series at that x. Screen readers get the chart's `label` and
 * a summary, and a data table (up to 200 rows) after it.
 *
 * Sized by its container's width; set the height with `height` (px).
 *
 * @element lit-material-line-chart
 *
 * @csspart chart - The chart area.
 * @csspart legend - The legend.
 * @csspart tooltip - The hover/focus readout.
 *
 * @cssprop --lit-material-chart-series-1 - First series colour (… through `-8`).
 */
@customElement("lit-material-line-chart")
export class LitMaterialLineChart extends LitElement {
  static override styles = styles;

  @property({ attribute: false }) series: ChartSeries[] = [];

  /** The chart's accessible name, e.g. "Requests per second, last 10 minutes". */
  @property() label = "";

  /** Height in px. */
  @property({ type: Number }) height = 240;

  /** Lower bound of the y axis (default 0, or the data's minimum if it's negative). */
  @property({ type: Number, attribute: "y-min" }) yMin?: number;

  /** Formats x values for the axis, tooltip and table (default: numbers). */
  @property({ attribute: false }) formatX: (x: number) => string = formatNumber;

  /** Formats y values (default: compact numbers). */
  @property({ attribute: false }) formatY: (y: number) => string = formatNumber;

  /** A unit appended to y values in the tooltip and table, e.g. "req/s". */
  @property() unit = "";

  /** The width the chart is laid out at; measured, 640 until then (and on the server). */
  @state() private width = 640;

  /** The crosshair's position in `xs`, or -1. */
  @state() private active = -1;

  private observer?: ResizeObserver;

  override connectedCallback(): void {
    super.connectedCallback();
    if (typeof ResizeObserver !== "undefined") {
      // Re-laying out inside the callback would resize the chart within the
      // same frame (a ResizeObserver loop): apply the width on the next one.
      this.observer = new ResizeObserver((entries) => {
        const w = Math.round(entries[0]?.contentRect.width ?? 0);
        if (w > 0 && w !== this.width) requestAnimationFrame(() => (this.width = w));
      });
      this.observer.observe(this);
    }
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.observer?.disconnect();
  }

  private get drawn(): ChartSeries[] {
    if (this.series.length > MAX_SERIES) {
      console.warn(`lit-material-line-chart: ${this.series.length} series; only the first ${MAX_SERIES} are drawn`);
    }
    return this.series.slice(0, MAX_SERIES).map((s) => ({
      name: s.name,
      points: s.points.filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y)).sort((a, b) => a.x - b.x),
    }));
  }

  /** Every x in the data, ascending, without repeats. */
  private xsOf(series: ChartSeries[]): number[] {
    const set = new Set<number>();
    for (const s of series) for (const p of s.points) set.add(p.x);
    return [...set].sort((a, b) => a - b);
  }

  private nearest(points: ChartPoint[], x: number): ChartPoint | undefined {
    let best: ChartPoint | undefined;
    for (const p of points) if (!best || Math.abs(p.x - x) < Math.abs(best.x - x)) best = p;
    return best;
  }

  private onPointer(event: PointerEvent, xs: number[], xOf: (x: number) => number): void {
    const box = (event.currentTarget as SVGElement).getBoundingClientRect();
    const px = ((event.clientX - box.left) / Math.max(1, box.width)) * this.width;
    let best = 0;
    for (let i = 1; i < xs.length; i++) if (Math.abs(xOf(xs[i]!) - px) < Math.abs(xOf(xs[best]!) - px)) best = i;
    this.active = best;
  }

  private onKey(event: KeyboardEvent, count: number): void {
    const keys: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, Home: -Infinity, End: Infinity };
    if (event.key === "Escape") {
      this.active = -1;
      return;
    }
    if (!(event.key in keys)) return;
    event.preventDefault();
    const step = keys[event.key]!;
    const from = this.active < 0 ? count - 1 : this.active;
    this.active = Math.min(count - 1, Math.max(0, Number.isFinite(step) ? from + step : step < 0 ? 0 : count - 1));
  }

  private summary(series: ChartSeries[]): string {
    const parts = series.map((s) => {
      const ys = s.points.map((p) => p.y);
      if (!ys.length) return `${s.name}: no data`;
      const last = ys[ys.length - 1]!;
      return `${s.name}: latest ${this.formatY(last)}${this.unit ? ` ${this.unit}` : ""}, range ${this.formatY(Math.min(...ys))} to ${this.formatY(Math.max(...ys))}`;
    });
    return parts.join("; ");
  }

  override render() {
    const series = this.drawn;
    const xs = this.xsOf(series);
    const name = this.label || "Line chart";
    if (xs.length === 0) {
      return html`<div class="empty" role="img" aria-label="${name}: no data">No data</div>`;
    }

    const allY = series.flatMap((s) => s.points.map((p) => p.y));
    const dataMin = Math.min(...allY);
    const floor = this.yMin ?? Math.min(0, dataMin);
    const { ticks, min: y0, max: y1 } = niceTicks(Math.min(floor, dataMin), Math.max(...allY), 4);
    const labelled = series.length > 1 && series.length <= MAX_DIRECT_LABELS;
    const longestName = Math.max(0, ...series.map((s) => s.name.length));
    const padRight = labelled ? Math.min(160, 12 + longestName * 7) : 12;
    const yTickText = ticks.map((t) => this.formatY(t));
    const padLeft = Math.max(PAD_LEFT_MIN, 12 + Math.max(...yTickText.map((t) => t.length)) * 7);
    const w = this.width;
    const h = Math.max(80, this.height);
    const plotW = Math.max(1, w - padLeft - padRight);
    const plotH = Math.max(1, h - PAD_TOP - PAD_BOTTOM);
    const xMin = xs[0]!;
    const xMax = xs[xs.length - 1]!;
    const xOf = (x: number) => padLeft + (xMax === xMin ? plotW / 2 : ((x - xMin) / (xMax - xMin)) * plotW);
    const yOf = (y: number) => PAD_TOP + (1 - (y - y0) / (y1 - y0 || 1)) * plotH;
    const xTicks = linearTicks(xMin, xMax, Math.max(2, Math.min(6, Math.floor(plotW / 110) + 1)));

    const ends = series.map((s) => (s.points.length ? yOf(s.points[s.points.length - 1]!.y) : PAD_TOP));
    const endLabels = labelled ? spread(ends, 14, PAD_TOP + 6, PAD_TOP + plotH) : [];

    const activeX = this.active >= 0 && this.active < xs.length ? xs[this.active] : undefined;
    const readout =
      activeX === undefined
        ? []
        : series.map((s, i) => ({ i, name: s.name, point: this.nearest(s.points, activeX) })).filter((r) => r.point);
    const tipLeft = activeX === undefined ? 0 : (xOf(activeX) / w) * 100;

    return html`
      ${series.length > 1
        ? html`<ul class="legend" part="legend" aria-hidden="true">
            ${series.map((s, i) => html`<li><span class="swatch s${i + 1}"></span>${s.name}</li>`)}
          </ul>`
        : nothing}
      <div class="chart" part="chart">
        <svg
          viewBox="0 0 ${w} ${h}"
          width=${w}
          height=${h}
          role="img"
          aria-label="${name}. ${this.summary(series)}"
          tabindex="0"
          @pointermove=${(e: PointerEvent) => this.onPointer(e, xs, xOf)}
          @pointerdown=${(e: PointerEvent) => this.onPointer(e, xs, xOf)}
          @pointerleave=${() => (this.active = -1)}
          @keydown=${(e: KeyboardEvent) => this.onKey(e, xs.length)}
          @blur=${() => (this.active = -1)}
        >
          ${ticks.map(
            (t, i) => svg`
              <line class="grid" x1=${padLeft} x2=${padLeft + plotW} y1=${yOf(t)} y2=${yOf(t)}></line>
              <text class="axis" x=${padLeft - 8} y=${yOf(t) + 4} text-anchor="end">${yTickText[i]}</text>`,
          )}
          ${xTicks.map(
            (t, i) => svg`<text class="axis" x=${xOf(t)} y=${h - 8}
              text-anchor=${i === 0 ? "start" : i === xTicks.length - 1 ? "end" : "middle"}>${this.formatX(t)}</text>`,
          )}
          ${series.map(
            (s, i) =>
              s.points.length === 1
                ? svg`<circle class="dot s${i + 1}" r="4" cx=${xOf(s.points[0]!.x)} cy=${yOf(s.points[0]!.y)}></circle>`
                : svg`<polyline class="line s${i + 1}" points=${s.points.map((p) => `${xOf(p.x).toFixed(1)},${yOf(p.y).toFixed(1)}`).join(" ")}></polyline>`,
          )}
          ${labelled
            ? series.map(
                (s, i) => svg`<text class="end-label" x=${padLeft + plotW + 6} y=${(endLabels[i] ?? PAD_TOP) + 4}>${s.name}</text>`,
              )
            : nothing}
          ${activeX === undefined
            ? nothing
            : svg`<line class="crosshair" x1=${xOf(activeX)} x2=${xOf(activeX)} y1=${PAD_TOP} y2=${PAD_TOP + plotH}></line>
                ${readout.map((r) => svg`<circle class="marker s${r.i + 1}" r="4" cx=${xOf(r.point!.x)} cy=${yOf(r.point!.y)}></circle>`)}`}
        </svg>
        ${activeX === undefined
          ? nothing
          : html`<div class="tooltip" part="tooltip" role="status" style="left: ${tipLeft}%">
              <div class="tip-x">${this.formatX(activeX)}</div>
              ${readout.map(
                (r) => html`<div class="tip-row">${series.length > 1 ? html`<span class="swatch s${r.i + 1}"></span>${r.name}: ` : nothing}<strong
                    >${this.formatY(r.point!.y)}</strong
                  >${this.unit ? ` ${this.unit}` : ""}</div>`,
              )}
            </div>`}
      </div>
      <table class="visually-hidden">
        <caption>${name}</caption>
        <thead>
          <tr>
            <th scope="col">x</th>
            ${series.map((s) => html`<th scope="col">${s.name}${this.unit ? ` (${this.unit})` : ""}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${xs.slice(-TABLE_ROWS).map(
            (x) =>
              html`<tr>
                <th scope="row">${this.formatX(x)}</th>
                ${series.map((s) => {
                  const p = s.points.find((q) => q.x === x);
                  return html`<td>${p ? this.formatY(p.y) : ""}</td>`;
                })}
              </tr>`,
          )}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-line-chart": LitMaterialLineChart;
  }
}
