import { html, LitElement, nothing, svg } from "lit";
import { customElement, property } from "lit/decorators.js";
import { css } from "lit";
import { formatNumber } from "./scale.js";
import { seriesColors, textTokens } from "./series-colors.js";

/**
 * A sparkline: a word-sized line showing the shape of a series, beside the
 * number it explains (a stat tile, a table cell). No axes, so it states its
 * range for screen readers: "label: latest X, from MIN to MAX".
 *
 * @element lit-material-sparkline
 *
 * @cssprop --lit-material-chart-series-1 - Line colour.
 */
@customElement("lit-material-sparkline")
export class LitMaterialSparkline extends LitElement {
  static override styles = [
    textTokens,
    seriesColors,
    css`
      :host {
        display: inline-block;
        width: var(--lit-material-sparkline-width, 96px);
        height: var(--lit-material-sparkline-height, 24px);
        vertical-align: middle;
      }
      svg {
        display: block;
        width: 100%;
        height: 100%;
        overflow: visible;
      }
      polyline {
        fill: none;
        stroke: var(--series);
        stroke-width: 2;
        stroke-linejoin: round;
        stroke-linecap: round;
        vector-effect: non-scaling-stroke;
      }
      circle {
        fill: var(--series);
      }
      @media (forced-colors: active) {
        polyline { stroke: CanvasText; }
        circle { fill: CanvasText; }
      }
    `,
  ];

  @property({ attribute: false }) values: number[] = [];

  /** What the line shows, e.g. "Requests per second". */
  @property() label = "";

  /** Mark the last value with a dot. */
  @property({ type: Boolean, attribute: "show-last" }) showLast = false;

  @property({ attribute: false }) format: (value: number) => string = formatNumber;

  override render() {
    const values = this.values.filter((v) => Number.isFinite(v));
    const name = this.label || "Trend";
    if (values.length === 0) return html`<svg role="img" aria-label="${name}: no data"></svg>`;
    const min = Math.min(...values);
    const max = Math.max(...values);
    const span = max - min || 1;
    const W = 100;
    const H = 24;
    const x = (i: number) => (values.length === 1 ? W / 2 : (i / (values.length - 1)) * W);
    const y = (v: number) => 2 + (1 - (v - min) / span) * (H - 4);
    const last = values[values.length - 1]!;
    return html`<svg class="s1" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img"
      aria-label="${name}: latest ${this.format(last)}, from ${this.format(min)} to ${this.format(max)}">
      <polyline points=${values.map((v, i) => `${x(i).toFixed(2)},${y(v).toFixed(2)}`).join(" ")}></polyline>
      ${this.showLast || values.length === 1 ? svg`<circle cx=${x(values.length - 1)} cy=${y(last)} r="2.5"></circle>` : nothing}
    </svg>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-sparkline": LitMaterialSparkline;
  }
}
