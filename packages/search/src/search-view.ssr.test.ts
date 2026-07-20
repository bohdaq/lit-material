import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSearchView } from "./search-view.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-search-view (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSearchView());
  });

  it("renders a declarative shadow root with a slot", async () => {
    const out = await renderToString(html`<lit-material-search-view>Content</lit-material-search-view>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot/);
  });

  it("reflects popover=manual and role=list onto the host tag", async () => {
    const out = await renderToString(html`<lit-material-search-view></lit-material-search-view>`);
    assert.match(out, /<lit-material-search-view[^>]*popover="manual"/);
    assert.match(out, /<lit-material-search-view[^>]*role="list"/);
  });

  it("reflects the open attribute", async () => {
    const out = await renderToString(html`<lit-material-search-view open></lit-material-search-view>`);
    assert.match(out, /<lit-material-search-view[^>]*\bopen\b/);
  });
});
