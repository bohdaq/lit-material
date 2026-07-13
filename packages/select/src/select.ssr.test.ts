import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSelect } from "./select.js";
import "./select-option.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-select (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialSelect());
    assert.equal(LitMaterialSelect.formAssociated, true);
  });

  it("renders a declarative shadow root with a combobox button and listbox", async () => {
    const out = await renderToString(html`
      <lit-material-select label="Size">
        <lit-material-select-option value="s">Small</lit-material-select-option>
        <lit-material-select-option value="m">Medium</lit-material-select-option>
      </lit-material-select>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="combobox"/);
    assert.match(out, /role="listbox"/);
    assert.match(out, /aria-haspopup="listbox"/);
  });

  it("reflects the disabled attribute onto the trigger button", async () => {
    const out = await renderToString(html`<lit-material-select label="Size" disabled></lit-material-select>`);
    assert.match(out, /<lit-material-select[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
