import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialRadio } from "./radio.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-radio (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialRadio());
    assert.equal(LitMaterialRadio.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native radio input", async () => {
    const out = await renderToString(html`<lit-material-radio aria-label="Small"></lit-material-radio>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input[^>]*type="radio"/);
  });

  it("reflects the disabled attribute onto the inner input", async () => {
    const out = await renderToString(
      html`<lit-material-radio aria-label="Small" disabled></lit-material-radio>`,
    );
    assert.match(out, /<lit-material-radio[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });

  it("emits aria-invalid on the inner input when error is set", async () => {
    const out = await renderToString(html`<lit-material-radio aria-label="Small" error></lit-material-radio>`);
    assert.match(out, /<lit-material-radio[^>]*\berror\b/);
    assert.match(out, /aria-invalid="true"/);
  });
});
