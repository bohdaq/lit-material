import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialConfirmDialog } from "./confirm-dialog.js";

describe("lit-material-confirm-dialog (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialConfirmDialog());
  });

  it("renders the dialog closed with its labels", async () => {
    const out = await collectResult(render(html`<lit-material-confirm-dialog headline="Delete?" confirm-label="Delete"></lit-material-confirm-dialog>`));
    assert.match(out, /lit-material-dialog/);
    assert.match(out, /Delete\?/);
    assert.doesNotMatch(out, /<lit-material-confirm-dialog[^>]* open/);
  });
});
