import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialListItem } from "./list-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-list-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialListItem());
  });

  it("renders a plain div with role=listitem by default (non-interactive)", async () => {
    const out = await renderToString(html`<lit-material-list-item>Headline</lit-material-list-item>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<div class="item"[^>]*role="listitem"/);
    assert.doesNotMatch(out, /<button/);
  });

  it("renders a native button when interactive", async () => {
    const out = await renderToString(
      html`<lit-material-list-item interactive>Headline</lit-material-list-item>`,
    );
    assert.match(out, /<button/);
  });

  it("renders an anchor when href is set, without needing interactive", async () => {
    const out = await renderToString(
      html`<lit-material-list-item href="https://example.com">Headline</lit-material-list-item>`,
    );
    assert.match(out, /<a[^>]*href="https:\/\/example\.com"/);
  });

  it("reflects the disabled attribute and disables the inner button", async () => {
    const out = await renderToString(
      html`<lit-material-list-item interactive disabled>Headline</lit-material-list-item>`,
    );
    assert.match(out, /<lit-material-list-item[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });
});
