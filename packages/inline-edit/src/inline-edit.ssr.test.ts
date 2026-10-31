import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./inline-edit.js";

describe("lit-material-inline-edit (SSR)", () => {
  it("renders the value and the edit button", async () => {
    const out = await collectResult(render(html`<lit-material-inline-edit label="Name" value="web"></lit-material-inline-edit>`));
    assert.match(out, />(<!--[^>]*-->)*web</);
    assert.match(out, /aria-label="Edit Name"/);
  });
});
