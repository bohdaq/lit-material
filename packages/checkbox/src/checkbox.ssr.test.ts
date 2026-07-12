import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCheckbox } from "./checkbox.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-checkbox (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialCheckbox());
    assert.equal(LitMaterialCheckbox.formAssociated, true);
  });

  it("renders a declarative shadow root containing the native checkbox input", async () => {
    const out = await renderToString(html`<lit-material-checkbox aria-label="Accept"></lit-material-checkbox>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input[^>]*type="checkbox"/);
  });

  it("reflects the disabled attribute onto the inner input", async () => {
    const out = await renderToString(
      html`<lit-material-checkbox aria-label="Accept" disabled></lit-material-checkbox>`,
    );
    assert.match(out, /<lit-material-checkbox[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });

  it("emits aria-invalid on the inner input when error is set", async () => {
    const out = await renderToString(html`<lit-material-checkbox aria-label="Accept" error></lit-material-checkbox>`);
    assert.match(out, /<lit-material-checkbox[^>]*\berror\b/);
    assert.match(out, /aria-invalid="true"/);
  });
});
