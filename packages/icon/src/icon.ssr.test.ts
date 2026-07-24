import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialIcon } from "./icon.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-icon (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialIcon());
  });

  it("renders a declarative shadow root with aria-hidden by default", async () => {
    const out = await renderToString(html`<lit-material-icon>★</lit-material-icon>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-icon[^>]*aria-hidden="true"/);
  });

  it("renders role=img and aria-label when label is set", async () => {
    const out = await renderToString(html`<lit-material-icon label="Favorite">★</lit-material-icon>`);
    assert.match(out, /<lit-material-icon[^>]*role="img"/);
    assert.match(out, /<lit-material-icon[^>]*aria-label="Favorite"/);
  });
});
