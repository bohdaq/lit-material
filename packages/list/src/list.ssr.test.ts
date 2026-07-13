import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialList } from "./list.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-list (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialList());
  });

  it("renders a declarative shadow root with role=list", async () => {
    const out = await renderToString(html`<lit-material-list>Content</lit-material-list>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="list"/);
  });
});
