import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { LocalizeController } from "@lit-material/core/localize.js";
import { textTokens } from "./series-colors.js";

export type RunStatus = "pass" | "fail" | "warn" | "none";

export interface StatusStripItem {
  status: RunStatus;
  /** Shown as the bar's tooltip, e.g. "09 Nov 10:42 · 200 · 142 ms". */
  label?: string;
}

/**
 * A row of thin bars, one per run, oldest first: the last 24 checks of a
 * monitor, the recent CI runs of a branch. Green passed, red failed, amber
 * warned (slow, flaky), grey no data. Failed bars are also hatched, so the
 * difference doesn't rest on colour alone.
 *
 * The strip is one `role="img"` whose name says how many passed and how the
 * latest run went; each bar's `label` is its tooltip. `items` is a property,
 * or a JSON attribute for server rendering.
 *
 * @element lit-material-status-strip
 *
 * @cssprop --lit-material-status-strip-pass - Passed bars.
 * @cssprop --lit-material-status-strip-fail - Failed bars (default `--md-sys-color-error`).
 * @cssprop --lit-material-status-strip-warn - Warned bars.
 * @cssprop --lit-material-status-strip-none - Bars without data (default `--md-sys-color-outline-variant`).
 * @cssprop --lit-material-status-strip-height - Bar height (default `24px`).
 * @cssprop --lit-material-status-strip-gap - Space between bars (default `2px`).
 *
 * @csspart strip - The row of bars.
 * @csspart bar - Each bar.
 */
@customElement("lit-material-status-strip")
export class LitMaterialStatusStrip extends LitElement {
  static override styles = [
    textTokens,
    css`
      :host {
        --pass: var(--lit-material-status-strip-pass, light-dark(#2f7d4f, #3fa77f));
        --fail: var(--lit-material-status-strip-fail, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5)));
        --warn: var(--lit-material-status-strip-warn, light-dark(#8a5a12, #f2b45c));
        --none: var(--lit-material-status-strip-none, var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f)));
        display: block;
        min-width: 48px;
      }
      :host([hidden]) {
        display: none;
      }
      .strip {
        display: flex;
        align-items: stretch;
        gap: var(--lit-material-status-strip-gap, 2px);
        height: var(--lit-material-status-strip-height, 24px);
      }
      .bar {
        flex: 1;
        min-width: 2px;
        border-radius: 2px;
      }
      .pass { background: var(--pass); }
      .warn { background: var(--warn); }
      .none { background: var(--none); }
      .fail {
        background: repeating-linear-gradient(135deg, var(--fail) 0 3px, color-mix(in srgb, var(--fail) 70%, transparent) 3px 5px);
      }
      @media (forced-colors: active) {
        .bar { border: 1px solid CanvasText; background: Canvas; }
        .fail { background: CanvasText; }
        .warn { background: repeating-linear-gradient(135deg, CanvasText 0 2px, Canvas 2px 4px); }
      }
    `,
  ];

  /** The runs, oldest first. */
  @property({ type: Array }) items: StatusStripItem[] = [];

  /** What the runs are, e.g. "Checkout path, last 24 runs". Unset, "Runs", translated. */
  @property() label = "";

  private readonly localize = new LocalizeController(this);

  /** The text a screen reader hears. */
  get summary(): string {
    const t = this.localize;
    const name = this.label || t.term("chart.runs", "Runs");
    const items = (this.items ?? []).filter((i) => i && i.status !== "none");
    if (items.length === 0) return t.term("chart.nameNoData", "{name}: no data", { name });
    const passed = items.filter((i) => i.status === "pass").length;
    const failed = items.filter((i) => i.status === "fail").length;
    const latest = items[items.length - 1]!.status;
    const latestText =
      latest === "pass" ? t.term("chart.runPassed", "passed") : latest === "fail" ? t.term("chart.runFailed", "failed") : t.term("chart.runWarned", "warned");
    return t.term("chart.statusStripSummary", "{name}: {passed} of {total} passed, {failed} failed, latest {latest}", {
      name,
      passed,
      total: items.length,
      failed,
      latest: latestText,
    });
  }

  override render() {
    const items = this.items ?? [];
    return html`<div class="strip" part="strip" role="img" aria-label=${this.summary}>
      ${items.map((i) => html`<span class="bar ${["pass", "fail", "warn"].includes(i?.status) ? i.status : "none"}" part="bar" title=${i?.label ?? ""}></span>`)}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "lit-material-status-strip": LitMaterialStatusStrip;
  }
}
