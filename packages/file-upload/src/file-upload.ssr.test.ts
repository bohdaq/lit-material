import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialFileUpload } from "./file-upload.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-file-upload (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialFileUpload());
    assert.equal(LitMaterialFileUpload.formAssociated, true);
  });

  it("renders a declarative shadow root with a native file input and a label", async () => {
    const out = await renderToString(html`<lit-material-file-upload></lit-material-file-upload>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input[^>]*type="file"/);
    assert.match(out, /<label/);
  });

  it("reflects multiple onto the inner input", async () => {
    const out = await renderToString(html`<lit-material-file-upload multiple></lit-material-file-upload>`);
    assert.match(out, /<lit-material-file-upload[^>]*\bmultiple\b/);
    assert.match(out, /<input[^>]*\bmultiple\b/);
  });

  it("shows a custom label instead of default instructions", async () => {
    const out = await renderToString(html`<lit-material-file-upload label="Upload a file"></lit-material-file-upload>`);
    assert.match(out, /Upload a file/);
  });
});
