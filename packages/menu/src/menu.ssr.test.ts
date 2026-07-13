import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialMenu } from "./menu.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-menu (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialMenu());
  });

  it("renders a declarative shadow root with a slot", async () => {
    const out = await renderToString(html`<lit-material-menu>Content</lit-material-menu>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot/);
  });
});
