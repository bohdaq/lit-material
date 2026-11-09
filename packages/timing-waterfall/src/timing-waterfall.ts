import { html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { cssProps } from "@lit-material/core/css-props.js";
import { styles } from "./timing-waterfall-styles.js";

/**
 * Where a request's time went, in milliseconds: the `timings` object of HITOP's run report
 * (report.json) and of its proxy and desktop answers. `dnsMs + connectMs + waitMs + downloadMs`
 * is `totalMs`.
 */
export interface RequestTimings {
  dnsMs: number;
  connectMs: number;
  waitMs: number;
  downloadMs: number;
  totalMs?: number;
  /** The request went over a connection that was already open. */
  reused?: boolean;
}

/** One segment of the bar. Without `color`, segments take the phase colours in order. */
export interface TimingPhase {
  label: string;
  ms: number;
  color?: string;
}

interface Segment {
  label: string;
  ms: number;
  color: string;
}

const DEFAULT_COLORS = [
  "var(--lit-material-timing-waterfall-dns, light-dark(#2457a8, #6ca8ff))",
  "var(--lit-material-timing-waterfall-connect, light-dark(#5b3fb5, #8f84f0))",
  "var(--lit-material-timing-waterfall-wait, light-dark(#8a5a12, #f2b45c))",
  "var(--lit-material-timing-waterfall-download, light-dark(#2f6b4a, #5ec79b))",
];

/** Segments narrower than this share of the bar are drawn this wide, so a 1 ms phase stays visible. */
const MIN_SHARE = 1.5;

const finite = (n: unknown): number => (typeof n === "number" && Number.isFinite(n) && n > 0 ? n : 0);

/**
 * Where a request's time went: one stacked bar, a segment per phase in proportion to its
 * time, and a legend with each phase's milliseconds and the total. Give it `timings` (DNS,
 * connect, waiting, download — a reused connection says so) or your own `phases`.
 *
 * The bar is one image for screen readers, named with every phase and its time; the legend
 * is ordinary text.
 *
 * @element lit-material-timing-waterfall
 *
 * @cssprop --lit-material-timing-waterfall-dns - The DNS segment's colour.
 * @cssprop --lit-material-timing-waterfall-connect - The connect segment's colour.
 * @cssprop --lit-material-timing-waterfall-wait - The waiting segment's colour.
 * @cssprop --lit-material-timing-waterfall-download - The download segment's colour.
 * @cssprop --lit-material-timing-waterfall-track - The bar's background (default: surface container).
 * @cssprop --lit-material-timing-waterfall-height - The bar's height (default `8px`).
 *
 * @csspart bar - The bar.
 * @csspart segment - Each segment.
 * @csspart legend - The legend.
 */
@customElement("lit-material-timing-waterfall")
export class LitMaterialTimingWaterfall extends LitElement {
  static override styles = styles;

  /** DNS, connect, waiting and download times (HITOP's report shape). */
  @property({ type: Object }) timings: RequestTimings | null = null;

  /** Your own phases instead of `timings`. */
  @property({ type: Array }) phases: TimingPhase[] = [];

  /** Hide the legend and show the bar only. */
  @property({ type: Boolean, attribute: "hide-legend", reflect: true }) hideLegend = false;

  private readonly localize = new LocalizeController(this);

  private segments(): Segment[] {
    if (this.phases.length) {
      return this.phases.map((p, i) => ({ label: p.label, ms: finite(p.ms), color: p.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length]! }));
    }
    const t = this.timings;
    if (!t) return [];
    const term = this.localize;
    return [
      { label: term.term("timingWaterfall.dns", "DNS"), ms: finite(t.dnsMs), color: DEFAULT_COLORS[0]! },
      { label: term.term("timingWaterfall.connect", "Connect"), ms: finite(t.connectMs), color: DEFAULT_COLORS[1]! },
      { label: term.term("timingWaterfall.wait", "Waiting"), ms: finite(t.waitMs), color: DEFAULT_COLORS[2]! },
      { label: term.term("timingWaterfall.download", "Download"), ms: finite(t.downloadMs), color: DEFAULT_COLORS[3]! },
    ];
  }

  private ms(n: number): string {
    return this.localize.term("timingWaterfall.ms", "{value} ms", { value: this.localize.number(Math.round(n)) });
  }

  override render() {
    const segments = this.segments();
    const sum = segments.reduce((a, s) => a + s.ms, 0);
    const total = this.phases.length ? sum : finite(this.timings?.totalMs) || sum;
    const shown = segments.filter((s) => s.ms > 0);
    // Shares with a floor for tiny phases, scaled back to fill the bar exactly.
    const raw = shown.map((s) => (sum > 0 ? Math.max((s.ms / sum) * 100, MIN_SHARE) : 0));
    const scale = raw.reduce((a, b) => a + b, 0) || 1;
    const reused = !this.phases.length && this.timings?.reused === true;
    const summary = [
      ...segments.map((s) => this.localize.term("timingWaterfall.phase", "{label}: {time}", { label: s.label, time: this.ms(s.ms) })),
      this.localize.term("timingWaterfall.phase", "{label}: {time}", { label: this.localize.term("timingWaterfall.total", "Total"), time: this.ms(total) }),
    ].join(", ");
    return html`
      <div class="bar" part="bar" role="img" aria-label=${summary}>
        ${shown.map(
          (s, i) =>
            html`<span class="segment" part="segment" style=${cssProps({ width: `${((raw[i]! / scale) * 100).toFixed(3)}%`, background: s.color })}></span>`,
        )}
      </div>
      ${this.hideLegend
        ? nothing
        : html`<ul class="legend" part="legend">
            ${segments.map(
              (s) =>
                html`<li><span class="swatch" aria-hidden="true" style=${cssProps({ background: s.color })}></span>${s.label}
                  <span class="time">${this.ms(s.ms)}</span></li>`,
            )}
            <li class="total">${this.localize.term("timingWaterfall.total", "Total")} <span class="time">${this.ms(total)}</span></li>
            ${reused ? html`<li class="reused">${this.localize.term("timingWaterfall.reused", "Reused connection")}</li>` : nothing}
          </ul>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-timing-waterfall": LitMaterialTimingWaterfall;
  }
}
