import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSearchBar } from "./search-bar.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-search-bar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSearchBar());
  });

  it("renders a declarative shadow root containing the input and default icon", async () => {
    const out = await renderToString(html`<lit-material-search-bar></lit-material-search-bar>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<input/);
    assert.match(out, /placeholder="Search"/);
    assert.match(out, /<circle/);
  });

  it("does not render a clear button with no value", async () => {
    const out = await renderToString(html`<lit-material-search-bar></lit-material-search-bar>`);
    assert.doesNotMatch(out, /class="clear"/);
  });

  it("renders a clear button once value is set", async () => {
    const out = await renderToString(html`<lit-material-search-bar value="tea"></lit-material-search-bar>`);
    assert.match(out, /class="clear"/);
  });

  it("reflects the disabled attribute onto the inner input", async () => {
    const out = await renderToString(html`<lit-material-search-bar disabled></lit-material-search-bar>`);
    assert.match(out, /<input[^>]*\bdisabled\b/);
  });
});
