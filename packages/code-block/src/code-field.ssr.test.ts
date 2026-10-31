import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./code-field.js";

describe("lit-material-code-field (SSR)", () => {
  it("renders the gutter, the textarea and a JSON error", async () => {
    const out = await collectResult(
      render(html`<lit-material-code-field label="Body" language="json" value="{"></lit-material-code-field>`),
    );
    assert.match(out, /<lit-material-code-field[^>]*invalid/);
    assert.match(out, /<textarea/);
    assert.match(out, /class="error"/);
  });
});
