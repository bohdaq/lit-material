import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialTree } from "./tree.js";
import { LitMaterialTreeItem } from "./tree-item.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-tree (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTree());
  });

  it("renders a declarative shadow root wrapping slotted nodes, role=tree", async () => {
    const out = await renderToString(html`
      <lit-material-tree>
        <lit-material-tree-item><span slot="label">Documents</span></lit-material-tree-item>
      </lit-material-tree>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-tree[^-][^>]*role="tree"/);
  });

  it("reflects aria-multiselectable only when multiple", async () => {
    const out = await renderToString(html`<lit-material-tree multiple></lit-material-tree>`);
    assert.match(out, /aria-multiselectable="true"/);
  });
});

describe("lit-material-tree-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialTreeItem());
  });

  it("renders a declarative shadow root with role=treeitem and a collapsed children group", async () => {
    const out = await renderToString(
      html`<lit-material-tree-item><span slot="label">Documents</span></lit-material-tree-item>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /role="treeitem"/);
    assert.match(out, /aria-selected="false"/);
  });

  it("reflects the expanded/selected/disabled attributes", async () => {
    const out = await renderToString(html`<lit-material-tree-item expanded selected disabled></lit-material-tree-item>`);
    assert.match(out, /<lit-material-tree-item[^>]*\bexpanded\b/);
    assert.match(out, /<lit-material-tree-item[^>]*\bselected\b/);
    assert.match(out, /<lit-material-tree-item[^>]*\bdisabled\b/);
    assert.match(out, /aria-disabled="true"/);
  });
});
