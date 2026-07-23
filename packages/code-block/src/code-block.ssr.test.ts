import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialCodeBlock } from "./code-block.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-code-block (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialCodeBlock());
  });

  it("renders a declarative shadow root with pre/code and a copy button by default", async () => {
    const out = await renderToString(html`<lit-material-code-block>const x = 1;</lit-material-code-block>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<pre/);
    assert.match(out, /<code/);
    assert.match(out, /class="copy"/);
  });

  it("renders the label when set", async () => {
    const out = await renderToString(html`<lit-material-code-block label="index.ts">const x = 1;</lit-material-code-block>`);
    assert.match(out, /class="label"[^>]*>[\s\S]*index\.ts/);
  });

  it("renders an expand toggle when expandable", async () => {
    const out = await renderToString(html`<lit-material-code-block expandable>const x = 1;</lit-material-code-block>`);
    assert.match(out, /class="expand-toggle"/);
    assert.match(out, /Show more/);
  });
});
