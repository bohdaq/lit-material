import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSideSheet } from "./side-sheet.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-side-sheet (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSideSheet());
  });

  it("renders a standard sheet as a plain container, no <dialog>", async () => {
    const out = await renderToString(html`<lit-material-side-sheet>Content</lit-material-side-sheet>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="sheet standard"/);
    assert.doesNotMatch(out, /<dialog\s/);
  });

  it("renders a modal sheet wrapped in a native <dialog>", async () => {
    const out = await renderToString(html`<lit-material-side-sheet variant="modal">Content</lit-material-side-sheet>`);
    assert.match(out, /<dialog\s/);
    assert.match(out, /class="sheet modal"/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-side-sheet open></lit-material-side-sheet>`);
    assert.match(out, /<lit-material-side-sheet[^>]*\bopen\b/);
  });
});
