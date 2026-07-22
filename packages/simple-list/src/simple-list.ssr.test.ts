import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialSimpleList } from "./simple-list.js";
import { LitMaterialSimpleListItem } from "./simple-list-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-simple-list (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSimpleList());
  });

  it("renders a declarative shadow root wrapping a ul", async () => {
    const out = await renderToString(html`
      <lit-material-simple-list>
        <lit-material-simple-list-item href="/a">A</lit-material-simple-list-item>
      </lit-material-simple-list>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<ul/);
  });
});

describe("lit-material-simple-list-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialSimpleListItem());
  });

  it("renders a link when href is set", async () => {
    const out = await renderToString(html`<lit-material-simple-list-item href="/a">A</lit-material-simple-list-item>`);
    assert.match(out, /role="listitem"/);
    assert.match(out, /<a[^>]*href="\/a"/);
  });

  it("renders a button when no href", async () => {
    const out = await renderToString(html`<lit-material-simple-list-item>A</lit-material-simple-list-item>`);
    assert.match(out, /<button/);
  });
});
