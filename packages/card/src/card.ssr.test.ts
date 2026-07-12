import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCard } from "./card.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-card (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCard());
  });

  it("renders a plain div by default (non-interactive)", async () => {
    const out = await renderToString(html`<lit-material-card>Content</lit-material-card>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<div class="card elevated"/);
    assert.doesNotMatch(out, /<button/);
  });

  it("renders a native button when interactive", async () => {
    const out = await renderToString(html`<lit-material-card interactive>Content</lit-material-card>`);
    assert.match(out, /<button/);
  });

  it("renders an anchor when href is set, without needing interactive", async () => {
    const out = await renderToString(
      html`<lit-material-card href="https://example.com">Content</lit-material-card>`,
    );
    assert.match(out, /<a[^>]*href="https:\/\/example\.com"/);
  });

  it("reflects the disabled attribute and disables the inner button", async () => {
    const out = await renderToString(
      html`<lit-material-card interactive disabled>Content</lit-material-card>`,
    );
    assert.match(out, /<lit-material-card[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
