import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDataTableRow } from "./data-table-row.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-data-table-row (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataTableRow());
  });

  it("renders role=row with a slot", async () => {
    const out = await renderToString(html`<lit-material-data-table-row></lit-material-data-table-row>`);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-data-table-row[^>]*role="row"/);
    assert.match(out, /<slot/);
  });

  it("reflects the selected attribute when set", async () => {
    const out = await renderToString(html`<lit-material-data-table-row selected></lit-material-data-table-row>`);
    assert.match(out, /<lit-material-data-table-row[^>]*\bselected\b/);
  });
});
