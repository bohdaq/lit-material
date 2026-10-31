import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./split-panel.js";

describe("lit-material-split-panel (SSR)", () => {
  it("renders both panes and the separator at its position", async () => {
    const out = await collectResult(render(html`<lit-material-split-panel position="30"><p slot="start">a</p><p slot="end">b</p></lit-material-split-panel>`));
    assert.match(out, /role="separator"/);
    assert.match(out, /aria-valuenow="30"/);
    assert.match(out, /--_start: 30fr/);
  });
});
