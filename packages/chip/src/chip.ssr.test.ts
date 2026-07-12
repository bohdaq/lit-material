import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialChip } from "./chip.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-chip (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialChip());
  });

  it("renders a declarative shadow root containing the native button", async () => {
    const out = await renderToString(html`<lit-material-chip>Filter</lit-material-chip>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<button/);
  });

  it("reflects the disabled attribute and disables the inner button", async () => {
    const out = await renderToString(html`<lit-material-chip disabled>Filter</lit-material-chip>`);
    assert.match(out, /<lit-material-chip[^>]*\bdisabled\b/);
    assert.match(out, /<button[^>]*\bdisabled\b/);
  });

  it("renders a checkmark for a selected filter chip", async () => {
    const out = await renderToString(
      html`<lit-material-chip variant="filter" selected>Spicy</lit-material-chip>`,
    );
    assert.match(out, /class="checkmark"/);
  });

  it("renders a remove button when removable", async () => {
    const out = await renderToString(html`<lit-material-chip removable>Tag</lit-material-chip>`);
    assert.match(out, /class="remove"/);
    assert.match(out, /aria-label="Remove"/);
  });

  it("renders an anchor with rel=noopener when target=_blank", async () => {
    const out = await renderToString(
      html`<lit-material-chip href="https://example.com" target="_blank">Docs</lit-material-chip>`,
    );
    assert.match(out, /<a[^>]*href="https:\/\/example\.com"/);
    assert.match(out, /rel="noopener noreferrer"/);
  });
});
