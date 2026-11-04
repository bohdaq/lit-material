import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./new-secret.js";

describe("lit-material-new-secret (SSR)", () => {
  it("renders the heading, the value and the warning", async () => {
    const out = await collectResult(render(html`<lit-material-new-secret label="API key" value="k-1"></lit-material-new-secret>`));
    assert.match(out, /role="status"/);
    assert.match(out, /API key/);
    assert.match(out, /lit-material-clipboard-copy/);
    assert.match(out, /won(&#39;|')t be shown again/);
  });
});
