import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDataTableCell } from "./data-table-cell.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-data-table-cell (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataTableCell());
  });

  it("renders role=cell by default", async () => {
    const out = await renderToString(html`<lit-material-data-table-cell>Ada</lit-material-data-table-cell>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-data-table-cell[^>]*role="cell"/);
  });

  it("renders role=columnheader when header is set, without a sort button if no sort-key", async () => {
    const out = await renderToString(html`<lit-material-data-table-cell header>Name</lit-material-data-table-cell>`);
    assert.match(out, /<lit-material-data-table-cell[^>]*role="columnheader"/);
    // The component's own doc comment (inside the <style> block) mentions
    // "<button>" in prose, immediately closed with ">" — the real element
    // always carries attributes, so it's always followed by whitespace
    // instead, which is what distinguishes the two here.
    assert.doesNotMatch(out, /<button\s/);
  });

  it("renders a sort button when header and sort-key are both set", async () => {
    const out = await renderToString(
      html`<lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>`,
    );
    assert.match(out, /<button\s/);
  });
});
