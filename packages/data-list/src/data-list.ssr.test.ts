import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { LitMaterialDataList } from "./data-list.js";
import { LitMaterialDataListItem } from "./data-list-item.js";
import { LitMaterialDataListCell } from "./data-list-cell.js";

async function renderToString(template: ReturnType<typeof html>): Promise<string> {
  return collectResult(render(template));
}

describe("lit-material-data-list (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataList());
  });

  it("renders a declarative shadow root wrapping a ul", async () => {
    const out = await renderToString(html`
      <lit-material-data-list>
        <lit-material-data-list-item>Row</lit-material-data-list-item>
      </lit-material-data-list>
    `);
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<ul/);
  });
});

describe("lit-material-data-list-item (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataListItem());
  });

  it("renders role=listitem and a plain row by default", async () => {
    const out = await renderToString(html`<lit-material-data-list-item>Row</lit-material-data-list-item>`);
    assert.match(out, /role="listitem"/);
    assert.match(out, /class="row"/);
    assert.doesNotMatch(out, /<details/);
  });

  it("renders a details/summary when expandable, open reflected", async () => {
    const out = await renderToString(html`
      <lit-material-data-list-item expandable open>
        Row
        <span slot="expanded-content">Extra</span>
      </lit-material-data-list-item>
    `);
    assert.match(out, /<details[^>]*open/);
    assert.match(out, /<summary/);
  });
});

describe("lit-material-data-list-cell (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataListCell());
  });
});
