import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import "./number-field.js";

describe("lit-material-number-field (SSR)", () => {
  it("renders the buttons and the field", async () => {
    const out = await collectResult(
      render(html`<lit-material-number-field label="Replicas" value="2" min="2"></lit-material-number-field>`),
    );
    assert.match(out, /aria-label="Decrease Replicas"[^>]*disabled/);
    assert.match(out, /aria-label="Increase Replicas"/);
    assert.match(out, /lit-material-text-field/);
  });
});
