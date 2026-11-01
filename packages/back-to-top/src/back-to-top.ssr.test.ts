import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./back-to-top.js";

describe("lit-material-back-to-top (SSR)", () => {
  it("renders a hidden link to the target", async () => {
    const out = await collectResult(render(html`<lit-material-back-to-top target="main"></lit-material-back-to-top>`));
    assert.match(out, /href="#main"/);
    assert.match(out, /tabindex="-1"/);
    assert.match(out, /Back to top/);
  });
});
