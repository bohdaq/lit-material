import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialLogViewer } from "./log-viewer.js";

describe("lit-material-log-viewer (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialLogViewer());
  });

  it("renders lines set as a property", async () => {
    const out = await collectResult(render(html`<lit-material-log-viewer .lines=${["first", "second"]}></lit-material-log-viewer>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="log"/);
    assert.match(out, /first/);
    assert.match(out, /second/);
  });
});
