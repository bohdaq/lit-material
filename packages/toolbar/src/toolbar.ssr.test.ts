import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialToolbar } from "./toolbar.js";
import { LitMaterialToolbarSpacer } from "./toolbar-spacer.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-toolbar (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialToolbar());
  });

  it("renders a declarative shadow root with a default slot", async () => {
    const out = await renderToString(html`<lit-material-toolbar><button>Save</button></lit-material-toolbar>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<slot><\/slot>/);
  });
});

describe("lit-material-toolbar-spacer (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialToolbarSpacer());
  });

  it("renders a declarative shadow root", async () => {
    const out = await renderToString(html`<lit-material-toolbar-spacer></lit-material-toolbar-spacer>`);
    assert.match(out, /shadowrootmode="open"/);
  });
});
