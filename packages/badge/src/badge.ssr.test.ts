import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialBadge } from "./badge.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-badge (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialBadge());
  });

  it("renders a declarative shadow root, aria-hidden with no value (small/dot)", async () => {
    const out = await renderToString(html`<lit-material-badge></lit-material-badge>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /aria-hidden="true"/);
    assert.doesNotMatch(out, /class="badge large"/);
  });

  it("renders text value as the large badge", async () => {
    const out = await renderToString(html`<lit-material-badge value="NEW"></lit-material-badge>`);
    assert.match(out, /class="badge large"/);
    assert.match(out, />NEW</);
  });

  it("renders a numeric value clamped by max", async () => {
    const out = await renderToString(html`<lit-material-badge value="150" max="99"></lit-material-badge>`);
    assert.match(out, /class="badge large"/);
    assert.match(out, />99\+</);
  });

  it("renders role=status and aria-label when label is set, dropping aria-hidden", async () => {
    const out = await renderToString(
      html`<lit-material-badge value="5" label="5 unread messages"></lit-material-badge>`,
    );
    assert.match(out, /role="status"/);
    assert.match(out, /aria-label="5 unread messages"/);
    assert.doesNotMatch(out, /aria-hidden/);
  });
});
