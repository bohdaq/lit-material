import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTabPanel } from "./tab-panel.js";

describe("lit-material-tab-panel (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTabPanel());
  });

  it("renders role, tabindex and the selected attribute", async () => {
    const out = await collectResult(render(html`<lit-material-tab-panel selected>x</lit-material-tab-panel>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="tabpanel"/);
    assert.match(out, /selected/);
  });
});
