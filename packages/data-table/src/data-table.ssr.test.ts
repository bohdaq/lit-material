import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDataTable } from "./data-table.js";
import "./data-table-row.js";
import "./data-table-cell.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-data-table (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataTable());
  });

  it("renders role=table with a slot", async () => {
    const out = await renderToString(html`
      <lit-material-data-table>
        <lit-material-data-table-row header>
          <lit-material-data-table-cell header>Name</lit-material-data-table-cell>
        </lit-material-data-table-row>
        <lit-material-data-table-row>
          <lit-material-data-table-cell>Ada</lit-material-data-table-cell>
        </lit-material-data-table-row>
      </lit-material-data-table>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-data-table[^>]*role="table"/);
    assert.match(out, /<slot/);
  });

  it("renders a virtualized viewport's first window without throwing, from a fixed viewport-height", async () => {
    const items = [{ name: "Ada" }, { name: "Grace" }, { name: "Alan" }];
    const rowRenderer = (item: unknown) =>
      html`<lit-material-data-table-row flex
        ><lit-material-data-table-cell flex width="100px">${(item as { name: string }).name}</lit-material-data-table-cell
        ></lit-material-data-table-row>`;
    const out = await renderToString(html`
      <lit-material-data-table row-height="40" viewport-height="200" .items=${items} .rowRenderer=${rowRenderer}>
        <lit-material-data-table-row header flex>
          <lit-material-data-table-cell header flex width="100px">Name</lit-material-data-table-cell>
        </lit-material-data-table-row>
      </lit-material-data-table>
    `);
    assert.match(out, /class="viewport"/);
    assert.match(out, /Ada/);
  });
});
