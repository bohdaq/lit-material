import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTextField } from "./text-field.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-text-field (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialTextField());
    assert.equal(LitMaterialTextField.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native input", async () => {
    const out = await renderToString(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input/);
    assert.match(out, /<label[^>]*>[\s\S]*Name[\s\S]*<\/label>/);
  });

  it("reflects the disabled attribute onto the inner input", async () => {
    const out = await renderToString(
      html`<lit-material-text-field label="Name" disabled></lit-material-text-field>`,
    );
    assert.match(out, /<lit-material-text-field[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });

  it("renders the outlined variant container", async () => {
    const out = await renderToString(
      html`<lit-material-text-field variant="outlined" label="Name"></lit-material-text-field>`,
    );
    assert.match(out, /<lit-material-text-field[^>]*variant="outlined"/);
    assert.match(out, /class="container[^"]*"/);
  });

  it("emits aria-invalid when forced into error", async () => {
    const out = await renderToString(
      html`<lit-material-text-field label="Name" error error-text="Bad"></lit-material-text-field>`,
    );
    assert.match(out, /aria-invalid="true"/);
    assert.match(out, /Bad/);
  });
});
