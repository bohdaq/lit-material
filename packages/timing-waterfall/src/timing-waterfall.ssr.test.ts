import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTimingWaterfall } from "./timing-waterfall.js";

describe("lit-material-timing-waterfall (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTimingWaterfall());
  });

  it("renders the bar and legend from a JSON attribute", async () => {
    const out = await collectResult(
      render(html`<lit-material-timing-waterfall timings='{"dnsMs":4,"connectMs":30,"waitMs":96,"downloadMs":12,"totalMs":142}'></lit-material-timing-waterfall>`),
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-label="DNS: 4 ms, Connect: 30 ms, Waiting: 96 ms, Download: 12 ms, Total: 142 ms"/);
    assert.equal((out.match(/class="segment"/g) ?? []).length, 4);
  });
});
