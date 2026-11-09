import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialMethodTag } from "./method-tag.js";

describe("lit-material-method-tag (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialMethodTag());
  });

  it("renders the method into the declarative shadow root", async () => {
    const out = await collectResult(render(html`<lit-material-method-tag method="patch"></lit-material-method-tag>`));
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="tag patch"/);
    assert.match(out, />PATCH</);
  });
});
