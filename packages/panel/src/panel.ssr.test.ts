import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialPanel } from "./panel.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-panel (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialPanel());
  });

  it("renders a declarative shadow root with header/body/footer bands", async () => {
    const out = await renderToString(html`
      <lit-material-panel>
        <span slot="header">Title</span>
        <p>Body</p>
      </lit-material-panel>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="header"/);
    assert.match(out, /class="body"/);
    assert.match(out, /class="footer"/);
  });
});
