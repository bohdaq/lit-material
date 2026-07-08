import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialButton } from "./button.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-button (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialButton());
    assert.equal(LitMaterialButton.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native button", async () => {
    const out = await renderToString(html`<lit-material-button>Save</lit-material-button>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<button/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(html`<lit-material-button disabled>Save</lit-material-button>`);
    assert.match(out, /<lit-material-button[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });

  it("renders an anchor with rel=noopener when target=_blank", async () => {
    const out = await renderToString(
      html`<lit-material-button href="https://example.com" target="_blank">Docs</lit-material-button>`,
    );
    assert.match(out, /<a[^>]*href="https:\/\/example\.com"/);
    assert.match(out, /rel="noopener noreferrer"/);
  });
});
