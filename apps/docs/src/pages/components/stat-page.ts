import "@lit-material/stat";
import "@lit-material/chart";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import "../../playground/docs-playground.js";
import type { PlaygroundControl, PlaygroundState } from "../../playground/controls.js";

const controls: PlaygroundControl[] = [
  { kind: "text", key: "label", label: "Label", default: "Error rate" },
  { kind: "text", key: "value", label: "Value", default: "0.04%" },
  { kind: "select", key: "trend", label: "Trend", options: ["", "up", "down", "flat"], default: "down" },
  { kind: "text", key: "trendLabel", label: "Trend label", default: "-0.02 pt since yesterday" },
  { kind: "select", key: "sentiment", label: "Trend sentiment", options: ["neutral", "positive", "negative"], default: "positive" },
  { kind: "select", key: "variant", label: "Variant", options: ["outlined", "filled", "plain"], default: "outlined" },
];

const preview = (s: PlaygroundState) => html`<lit-material-stat
  style="max-width: 260px"
  label=${s.label as string}
  value=${s.value as string}
  .trend=${(s.trend as string) || undefined}
  trend-label=${s.trendLabel as string}
  trend-sentiment=${s.sentiment as string}
  variant=${s.variant as string}
></lit-material-stat>`;

const markup = (s: PlaygroundState) =>
  `<lit-material-stat label="${s.label}" value="${s.value}"${s.trend ? ` trend="${s.trend}" trend-label="${s.trendLabel}" trend-sentiment="${s.sentiment}"` : ""} variant="${s.variant}"></lit-material-stat>`;

@customElement("docs-stat-page")
export class DocsStatPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Stat</h1>
      <p>A label, a large tabular value, and a caption or trend: the building block of a dashboard's summary row.</p>
      <docs-playground .controls=${controls} .preview=${preview} .markup=${markup}></docs-playground>
      <section>
        <h2>A summary row</h2>
        <div style="display: grid; width: 100%; gap: 16px; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));">
          <lit-material-stat label="Requests" value="1,284" caption="last 5 minutes"></lit-material-stat>
          <lit-material-stat label="Open connections" value="37"></lit-material-stat>
          <lit-material-stat label="p95 latency" value="42 ms">
            <lit-material-sparkline slot="caption" label="p95 latency" .values=${[40, 44, 41, 47, 42, 39, 42]}></lit-material-sparkline>
          </lit-material-stat>
        </div>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-stat-page": DocsStatPage;
  }
}
