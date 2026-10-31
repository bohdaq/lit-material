import { css, html, LitElement, nothing } from "lit";
import { customElement, property } from "lit/decorators.js";

export type UsageLevel = "" | "warning" | "critical";

/**
 * How much of a limit is used: a labelled bar with the value and limit in
 * text, e.g. a quota ("CPU 3.2 of 4 cores") or disk ("12 of 20 GiB").
 *
 * The bar turns the warning colour at `warning` (a fraction of the limit,
 * default `0.8`) and the error colour at `critical` (default `0.95`) or over
 * the limit. Colour never stands alone: the text says "near limit" or
 * "over limit" too, and the host reflects `level` (`warning`/`critical`) for
 * your own styling. Without a limit (`max` 0) it shows the value and
 * "no limit", with no bar.
 *
 * The bar is a `role="meter"` whose accessible name is `label` and whose
 * value text is the visible text.
 *
 * @element lit-material-usage-meter
 *
 * @cssprop --lit-material-usage-meter-color - The bar below `warning` (default `--md-sys-color-primary`).
 * @cssprop --lit-material-usage-meter-warning-color - The bar from `warning` on.
 * @cssprop --lit-material-usage-meter-critical-color - The bar from `critical` on (default `--md-sys-color-error`).
 * @cssprop --lit-material-usage-meter-track-color - The empty track (default `--md-sys-color-surface-container-highest`).
 * @cssprop --lit-material-usage-meter-height - Bar thickness (default `8px`).
 *
 * @csspart label - The label.
 * @csspart value - The "used of limit" text.
 * @csspart bar - The track.
 * @csspart indicator - The filled part.
 */
@customElement("lit-material-usage-meter")
export class LitMaterialUsageMeter extends LitElement {
  static override styles = css`
    :host {
      display: block;
      color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
      line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    }
    :host([hidden]) {
      display: none;
    }
    .header {
      display: flex;
      align-items: baseline;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin-block-end: 6px;
    }
    .value {
      color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
      font-variant-numeric: tabular-nums;
    }
    :host([level="warning"]) .state {
      color: var(--lit-material-usage-meter-warning-color, light-dark(#7a4d00, #ffb945));
    }
    :host([level="critical"]) .state {
      color: var(--lit-material-usage-meter-critical-color, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5)));
    }
    .state {
      font-weight: 500;
    }
    .bar {
      position: relative;
      height: var(--lit-material-usage-meter-height, 8px);
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: var(--lit-material-usage-meter-track-color, var(--md-sys-color-surface-container-highest, light-dark(#e6e0e9, #36343b)));
      overflow: hidden;
    }
    .indicator {
      height: 100%;
      border-radius: inherit;
      background: var(--lit-material-usage-meter-color, var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff)));
      transition: width 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }
    :host([level="warning"]) .indicator {
      background: var(--lit-material-usage-meter-warning-color, light-dark(#7a4d00, #ffb945));
    }
    :host([level="critical"]) .indicator {
      background: var(--lit-material-usage-meter-critical-color, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5)));
    }
    @media (prefers-reduced-motion: reduce) {
      .indicator {
        transition: none;
      }
    }
  `;

  /** What is measured, e.g. "CPU". */
  @property() label = "";

  /** Amount used. */
  @property({ type: Number }) value = 0;

  /** The limit; `0` means none. */
  @property({ type: Number }) max = 0;

  /** Unit after the numbers, e.g. "GiB" or "cores". */
  @property() unit = "";

  /** Fraction of `max` from which the meter warns. */
  @property({ type: Number }) warning = 0.8;

  /** Fraction of `max` from which the meter is critical. */
  @property({ type: Number }) critical = 0.95;

  /** Formats both numbers; default: up to two decimals in the page's locale. */
  @property({ attribute: false }) format: (n: number) => string = (n) =>
    n.toLocaleString(undefined, { maximumFractionDigits: 2 });

  /** `warning`, `critical` or `""`, from the value; reflected for styling. */
  @property({ reflect: true }) level: UsageLevel = "";

  private get ratio(): number {
    return this.max > 0 ? Math.max(0, this.value) / this.max : 0;
  }

  protected override willUpdate(): void {
    const r = this.ratio;
    this.level = this.max <= 0 ? "" : r >= this.critical ? "critical" : r >= this.warning ? "warning" : "";
  }

  private get text(): string {
    const unit = this.unit ? ` ${this.unit}` : "";
    if (this.max <= 0) return `${this.format(this.value)}${unit}, no limit`;
    return `${this.format(this.value)} of ${this.format(this.max)}${unit}`;
  }

  private get state(): string {
    if (this.max <= 0) return "";
    if (this.value > this.max) return "over limit";
    return this.level ? "near limit" : "";
  }

  override render() {
    const state = this.state;
    const percent = Math.round(Math.min(1, this.ratio) * 100);
    return html`
      <div class="header">
        <span part="label" id="label">${this.label}</span>
        <span part="value" class="value"
          >${this.text}${state ? html` · <span class="state">${state}</span>` : nothing}</span
        >
      </div>
      ${this.max > 0
        ? html`<div
            part="bar"
            class="bar"
            role="meter"
            aria-labelledby="label"
            aria-valuemin="0"
            aria-valuemax=${this.max}
            aria-valuenow=${Math.min(this.max, Math.max(0, this.value))}
            aria-valuetext=${state ? `${this.text}, ${state}` : `${this.text}, ${percent}%`}
          >
            <div part="indicator" class="indicator" style="width: ${percent}%"></div>
          </div>`
        : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-usage-meter": LitMaterialUsageMeter;
  }
}
