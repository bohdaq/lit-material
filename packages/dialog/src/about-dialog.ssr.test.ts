import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./about-dialog.js";

describe("lit-material-about-dialog (SSR)", () => {
  it("renders the product name and a close button", async () => {
    const out = await collectResult(render(html`<lit-material-about-dialog product-name="rws"></lit-material-about-dialog>`));
    assert.match(out, /rws/);
    assert.match(out, /Close/);
  });
});
