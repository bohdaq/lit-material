import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./app-launcher.js";

describe("lit-material-app-launcher (SSR)", () => {
  it("renders a named, closed button", async () => {
    const out = await collectResult(render(html`<lit-material-app-launcher searchable></lit-material-app-launcher>`));
    assert.match(out, /aria-label="Applications"/);
    assert.match(out, /aria-expanded="false"/);
    assert.match(out, /type="search"/);
  });
});
