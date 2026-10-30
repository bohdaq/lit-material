import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialStat } from "./stat.js";

describe("lit-material-stat (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialStat());
  });

  it("renders the value and trend into the declarative shadow root", async () => {
    const out = await collectResult(
      render(html`<lit-material-stat label="Errors" value="0.04%" trend="up" trend-label="+0.01 pt"></lit-material-stat>`),
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /0\.04%/);
    assert.match(out, /\+0\.01 pt/);
  });
});
