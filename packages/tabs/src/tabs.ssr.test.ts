import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTabs } from "./tabs.js";
import "./tab.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-tabs (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTabs());
  });

  it("renders a declarative shadow root with a slot and an indicator", async () => {
    const out = await renderToString(html`
      <lit-material-tabs>
        <lit-material-tab>One</lit-material-tab>
        <lit-material-tab>Two</lit-material-tab>
      </lit-material-tabs>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot/);
    assert.match(out, /class="indicator"/);
  });
});
