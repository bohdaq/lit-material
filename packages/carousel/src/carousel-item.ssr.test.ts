import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCarouselItem } from "./carousel-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-carousel-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCarouselItem());
  });

  it("renders a declarative shadow root with the item container, no label container without label content", async () => {
    const out = await renderToString(html`<lit-material-carousel-item>Content</lit-material-carousel-item>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="item"/);
    assert.doesNotMatch(out, /class="label"/);
  });

  it("still omits the label container during SSR even with label content, since the check needs querySelector", async () => {
    // @lit-labs/ssr's light-DOM shim doesn't implement querySelector on the
    // host at all (same limitation lit-material-tabs's own querySelectorAll
    // guard documents) — this is a known, accepted SSR gap: a real browser
    // render (the overwhelming majority of usage) always gets this right,
    // via the same check, once real DOM APIs are available.
    const out = await renderToString(html`
      <lit-material-carousel-item>
        Content
        <span slot="label">Caption</span>
      </lit-material-carousel-item>
    `);
    assert.doesNotMatch(out, /class="label"/);
  });

  it("reflects role=group and aria-roledescription=slide onto the host tag", async () => {
    const out = await renderToString(html`<lit-material-carousel-item></lit-material-carousel-item>`);
    assert.match(out, /<lit-material-carousel-item[^>]*role="group"/);
    assert.match(out, /<lit-material-carousel-item[^>]*aria-roledescription="slide"/);
  });
});
