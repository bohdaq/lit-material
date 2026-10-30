import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialEmptyState } from "./empty-state.js";

describe("lit-material-empty-state (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialEmptyState());
  });

  it("renders the heading into the declarative shadow root", async () => {
    const out = await collectResult(render(html`<lit-material-empty-state headline="No results" level="3"></lit-material-empty-state>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="heading" aria-level="3"/);
    assert.match(out, /No results/);
  });
});
