import "@lit-material/chart";
import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";
import { pageStyles } from "../../styles/page-styles.js";
import type { ChartSeries } from "@lit-material/chart";

const start = Date.UTC(2026, 9, 30, 9, 0);
const minute = 60_000;
const wave = (base: number, amp: number, phase: number) =>
  Array.from({ length: 30 }, (_, i) => ({ x: start + i * minute, y: Math.round(base + amp * Math.sin(i / 4 + phase) + ((i * 7) % 5)) }));

const one: ChartSeries[] = [{ name: "Requests", points: wave(120, 30, 0) }];
const three: ChartSeries[] = [
  { name: "api", points: wave(120, 30, 0) },
  { name: "web", points: wave(80, 20, 1.5) },
  { name: "admin", points: wave(20, 6, 3) },
];
const time = (t: number) => new Date(t).toISOString().slice(11, 16);

const bars = [
  { name: "nginx", value: 98400 },
  { name: "rws", value: 121300 },
  { name: "caddy", value: 64200 },
  { name: "envoy", value: 87100 },
];

@customElement("docs-chart-page")
export class DocsChartPage extends LitElement {
  static override styles = [pageStyles];

  override render() {
    return html`
      <h1>Chart</h1>
      <p>A line chart, a bar chart and a sparkline. Hover, or focus the chart and use the arrow keys, to read values.</p>
      <section>
        <h2>One series</h2>
        <lit-material-line-chart label="Requests per second, 09:00 to 09:30 UTC" unit="req/s" .series=${one} .formatX=${time}></lit-material-line-chart>
      </section>
      <section>
        <h2>Three series: legend and direct labels</h2>
        <lit-material-line-chart label="Requests per second by route" unit="req/s" .series=${three} .formatX=${time}></lit-material-line-chart>
      </section>
      <section>
        <h2>Bar chart with one highlighted item</h2>
        <lit-material-bar-chart label="Requests per second, higher is better" unit="req/s" highlight="rws" sort="desc" .data=${bars}></lit-material-bar-chart>
      </section>
      <section>
        <h2>Sparkline</h2>
        <p>Errors <lit-material-sparkline label="Errors" show-last .values=${[4, 1, 7, 3, 5, 2, 3]}></lit-material-sparkline> 3 in the last minute</p>
      </section>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "docs-chart-page": DocsChartPage;
  }
}
