import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./usage-meter.js";

describe("lit-material-usage-meter (SSR)", () => {
  it("renders the text, the meter and the level", async () => {
    const out = await collectResult(
      render(html`<lit-material-usage-meter label="Disk" unit="GiB" value="19" max="20"></lit-material-usage-meter>`),
    );
    assert.match(out, /<lit-material-usage-meter[^>]*level="critical"/);
    assert.match(out, /19 of 20 GiB/);
    assert.match(out, /role="meter"/);
  });
});
