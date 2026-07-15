import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDataTablePagination } from "./data-table-pagination.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-data-table-pagination (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataTablePagination());
  });

  it("renders role=group with the computed range", async () => {
    const out = await renderToString(
      html`<lit-material-data-table-pagination total="97" page="0" page-size="10"></lit-material-data-table-pagination>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-data-table-pagination[^>]*role="group"/);
    // Each interpolated value sits behind its own lit-part comment marker in the SSR output, so
    // this can't be a single contiguous substring match — allow anything between the pieces.
    assert.match(out, /class="range"[\s\S]*?>1<[\s\S]*?>10<[\s\S]*?of[\s\S]*?>97</);
  });
});
