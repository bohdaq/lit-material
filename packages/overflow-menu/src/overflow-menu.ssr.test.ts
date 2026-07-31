import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialOverflowMenu } from "./overflow-menu.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-overflow-menu (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialOverflowMenu());
  });

  it("renders a declarative shadow root with a row and a hidden more button", async () => {
    const out = await renderToString(html`
      <lit-material-overflow-menu>
        <button>Item 1</button>
        <button>Item 2</button>
      </lit-material-overflow-menu>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="row"/);
    assert.match(out, /class="more"[^>]*hidden/);
  });
});
