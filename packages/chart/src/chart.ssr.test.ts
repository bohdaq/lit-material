import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialLineChart } from "./line-chart.js";
import { LitMaterialSparkline } from "./sparkline.js";
import { LitMaterialBarChart } from "./bar-chart.js";

describe("chart (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialLineChart());
    assert.doesNotThrow(() => new LitMaterialSparkline());
    assert.doesNotThrow(() => new LitMaterialBarChart());
  });

  it("renders the line chart at its default width on the server", async () => {
    const series = [{ name: "rps", points: [{ x: 0, y: 1 }, { x: 1, y: 2 }] }];
    const out = await collectResult(render(html`<lit-material-line-chart label="Load" .series=${series}></lit-material-line-chart>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /viewBox="0 0 640 240"/);
    assert.match(out, /<polyline/);
  });

  it("renders a sparkline", async () => {
    const out = await collectResult(render(html`<lit-material-sparkline label="x" .values=${[1, 2, 3]}></lit-material-sparkline>`));
    assert.match(out, /aria-label="x: latest 3, from 1 to 3"/);
  });

  it("renders a bar chart with no measuring", async () => {
    const data = [{ name: "a", value: 1 }, { name: "b", value: 2 }];
    const out = await collectResult(render(html`<lit-material-bar-chart label="L" highlight="b" .data=${data}></lit-material-bar-chart>`));
    assert.match(out, /--f: 0.5000/);
    assert.match(out, /aria-label="L. a: 1; b: 2"/);
  });
});
