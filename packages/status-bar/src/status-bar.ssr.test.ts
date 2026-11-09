import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./index.js";

describe("lit-material-status-bar (SSR)", () => {
  it("renders the region and its items on the server", async () => {
    const out = await collectResult(
      render(html`<lit-material-status-bar label="Editor"><lit-material-status-bar-item button>Proxy off</lit-material-status-bar-item></lit-material-status-bar>`),
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="region" aria-label="Editor"/);
    assert.match(out, /<button class="item" part="item" type="button"/);
  });
});
