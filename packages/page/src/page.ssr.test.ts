import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialPage } from "./page.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-page (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialPage());
  });

  it("renders a declarative shadow root with header/sidebar/main containers", async () => {
    const out = await renderToString(html`
      <lit-material-page>
        <header slot="header">Top bar</header>
        <p>Content</p>
      </lit-material-page>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="header"/);
    assert.match(out, /class="sidebar"/);
    assert.match(out, /<main class="main"/);
  });
});
