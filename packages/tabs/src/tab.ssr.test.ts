import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTab } from "./tab.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-tab (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTab());
  });

  it("renders a declarative shadow root containing a role=tab button", async () => {
    const out = await renderToString(html`<lit-material-tab>One</lit-material-tab>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="tab"/);
    assert.match(out, /aria-selected="false"/);
  });

  it("reflects the disabled attribute onto the inner button", async () => {
    const out = await renderToString(html`<lit-material-tab disabled>One</lit-material-tab>`);
    assert.match(out, /<lit-material-tab[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
