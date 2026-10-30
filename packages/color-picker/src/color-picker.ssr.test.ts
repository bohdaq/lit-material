import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialColorPicker } from "./color-picker.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-color-picker (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialColorPicker());
    assert.equal(LitMaterialColorPicker.formAssociated, true);
  });

  it("renders a declarative shadow root with a trigger button and dialog panel", async () => {
    const out = await renderToString(html`<lit-material-color-picker label="Accent"></lit-material-color-picker>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-haspopup="dialog"/);
    assert.match(out, /role="dialog"/);
    assert.match(out, /class="swatch empty"/);
  });

  it("renders the value as the swatch background color", async () => {
    const out = await renderToString(html`<lit-material-color-picker value="#123456"></lit-material-color-picker>`);
    assert.match(out, /background-color: #123456/);
  });

  it("reflects the disabled attribute onto the trigger button", async () => {
    const out = await renderToString(html`<lit-material-color-picker disabled></lit-material-color-picker>`);
    assert.match(out, /<lit-material-color-picker[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
