import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDevtools } from "./panel.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-devtools (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDevtools());
  });

  it("renders just the launcher when closed", async () => {
    const out = await renderToString(html`<lit-material-devtools></lit-material-devtools>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /class="launcher"/);
    assert.match(out, /aria-expanded="false"/);
    assert.doesNotMatch(out, /role="region"/);
  });

  it("renders the open panel with an empty store view", async () => {
    const out = await renderToString(html`<lit-material-devtools open></lit-material-devtools>`);
    assert.match(out, /role="region"/);
    assert.match(out, /No stores connected/);
  });
});
