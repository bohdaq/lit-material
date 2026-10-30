import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialStatus } from "./status.js";

describe("lit-material-status (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialStatus());
  });

  it("renders the state's glyph in a declarative shadow root", async () => {
    const out = await collectResult(render(html`<lit-material-status status="warning">Probing</lit-material-status>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="status warning"/);
    assert.match(out, /<svg viewBox="0 0 20 20"/);
    assert.match(out, /Probing/);
  });
});
