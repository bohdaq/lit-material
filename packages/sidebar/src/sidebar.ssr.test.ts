import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSidebar } from "./sidebar.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-sidebar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSidebar());
  });

  it("renders a declarative shadow root with panel and content containers", async () => {
    const out = await renderToString(html`
      <lit-material-sidebar>
        <nav slot="panel">Filters</nav>
        <p>Results</p>
      </lit-material-sidebar>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="panel"/);
    assert.match(out, /class="content"/);
  });
});
