import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./sortable.js";

describe("lit-material-sortable (SSR)", () => {
  it("renders a slot and no live region inside the list", async () => {
    const out = await collectResult(render(html`<lit-material-sortable><div>One</div></lit-material-sortable>`));
    assert.match(out, /<slot/);
    // The live region is one shared element in <body>, created in the browser.
    assert.doesNotMatch(out, /role="status"/);
  });
});
