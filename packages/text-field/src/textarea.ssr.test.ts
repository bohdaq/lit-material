import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTextarea } from "./textarea.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-textarea (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialTextarea());
    assert.equal(LitMaterialTextarea.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native textarea", async () => {
    const out = await renderToString(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<textarea/);
    assert.match(out, /<label[^>]*>[\s\S]*Bio[\s\S]*<\/label>/);
  });

  it("reflects the disabled attribute onto the inner textarea", async () => {
    const out = await renderToString(html`<lit-material-textarea label="Bio" disabled></lit-material-textarea>`);
    assert.match(out, /<lit-material-textarea[^>]*\bdisabled\b/);
    assert.match(out, /<textarea[^>]*\bdisabled\b/);
  });

  it("renders the outlined variant container", async () => {
    const out = await renderToString(html`<lit-material-textarea variant="outlined" label="Bio"></lit-material-textarea>`);
    assert.match(out, /<lit-material-textarea[^>]*variant="outlined"/);
    assert.match(out, /class="container[^"]*"/);
  });

  it("emits aria-invalid when forced into error", async () => {
    const out = await renderToString(html`<lit-material-textarea label="Bio" error error-text="Bad"></lit-material-textarea>`);
    assert.match(out, /aria-invalid="true"/);
    assert.match(out, /Bad/);
  });
});
