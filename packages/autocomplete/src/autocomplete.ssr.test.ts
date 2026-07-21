import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialAutocomplete } from "./autocomplete.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

const options = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
];

describe("lit-material-autocomplete (SSR)", () => {
  it("constructs without a browser (attachInternals + form association)", () => {
    assert.doesNotThrow(() => new LitMaterialAutocomplete());
    assert.equal(LitMaterialAutocomplete.formAssociated, true);
  });

  it("renders a declarative shadow root with a combobox input and listbox", async () => {
    const out = await renderToString(html`<lit-material-autocomplete label="Fruit"></lit-material-autocomplete>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="combobox"/);
    assert.match(out, /role="listbox"/);
    assert.match(out, /aria-autocomplete="list"/);
  });

  it("shows the selected option's label as the input's initial value", async () => {
    const out = await renderToString(html`
      <lit-material-autocomplete label="Fruit" .value=${"banana"} .options=${options}></lit-material-autocomplete>
    `);
    assert.match(out, /value="Banana"/);
  });

  it("reflects the disabled attribute onto the input", async () => {
    const out = await renderToString(html`<lit-material-autocomplete label="Fruit" disabled></lit-material-autocomplete>`);
    assert.match(out, /<lit-material-autocomplete[^>]*\bdisabled\b/);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-autocomplete label="Fruit" open></lit-material-autocomplete>`);
    assert.match(out, /<lit-material-autocomplete[^>]*\bopen\b/);
  });
});
