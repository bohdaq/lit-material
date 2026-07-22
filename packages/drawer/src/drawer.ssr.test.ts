import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDrawer } from "./drawer.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-drawer (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDrawer());
  });

  it("renders a declarative shadow root with popover=manual and role=complementary", async () => {
    const out = await renderToString(html`
      <lit-material-drawer>
        <div slot="header">Notifications</div>
        <p>Item</p>
      </lit-material-drawer>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /popover="manual"/);
    assert.match(out, /role="complementary"/);
    assert.match(out, /class="header"/);
    assert.match(out, /class="body"/);
  });
});
