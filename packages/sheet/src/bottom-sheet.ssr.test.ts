import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialBottomSheet } from "./bottom-sheet.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-bottom-sheet (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialBottomSheet());
  });

  it("renders wrapped in a native <dialog> by default (variant=modal)", async () => {
    const out = await renderToString(html`<lit-material-bottom-sheet>Content</lit-material-bottom-sheet>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<dialog\s/);
    assert.match(out, /class="drag-handle"/);
  });

  it("renders a standard sheet as a plain container, no <dialog>", async () => {
    const out = await renderToString(
      html`<lit-material-bottom-sheet variant="standard">Content</lit-material-bottom-sheet>`,
    );
    assert.doesNotMatch(out, /<dialog\s/);
    assert.match(out, /class="sheet standard"/);
  });

  it("omits the drag handle when showDragHandle is false", async () => {
    const out = await renderToString(html`<lit-material-bottom-sheet .showDragHandle=${false}></lit-material-bottom-sheet>`);
    assert.doesNotMatch(out, /class="drag-handle"/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-bottom-sheet open></lit-material-bottom-sheet>`);
    assert.match(out, /<lit-material-bottom-sheet[^>]*\bopen\b/);
  });
});
