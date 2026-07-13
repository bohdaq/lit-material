import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSnackbar } from "./snackbar.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-snackbar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSnackbar());
  });

  it("renders a declarative shadow root containing the slotted message", async () => {
    const out = await renderToString(html`<lit-material-snackbar>Saved</lit-material-snackbar>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot/);
  });

  it("renders a close button when closable", async () => {
    const out = await renderToString(html`<lit-material-snackbar closable>Saved</lit-material-snackbar>`);
    assert.match(out, /class="close"/);
    assert.match(out, /aria-label="Dismiss"/);
  });

  it("does not render a close button by default", async () => {
    const out = await renderToString(html`<lit-material-snackbar>Saved</lit-material-snackbar>`);
    assert.doesNotMatch(out, /class="close"/);
  });
});
