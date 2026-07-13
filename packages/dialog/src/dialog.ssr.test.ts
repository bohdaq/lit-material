import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDialog } from "./dialog.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-dialog (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDialog());
  });

  it("renders a declarative shadow root containing the native dialog", async () => {
    const out = await renderToString(html`
      <lit-material-dialog>
        <span slot="headline">Delete file?</span>
        This can't be undone.
      </lit-material-dialog>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<dialog/);
    assert.match(out, /aria-labelledby="headline"/);
  });

  it("does not render the dialog with the open attribute by default", async () => {
    const out = await renderToString(html`<lit-material-dialog>Content</lit-material-dialog>`);
    assert.doesNotMatch(out, /<dialog[^>]*\bopen\b/);
  });
});
