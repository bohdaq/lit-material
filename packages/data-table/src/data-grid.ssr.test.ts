import "@lit-labs/ssr/lib/install-global-dom-shim.js";
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { render } from "@lit-labs/ssr";
import { collectResult } from "@lit-labs/ssr/lib/render-result.js";
import { html } from "lit";
import { registerTranslation } from "@lit-material/core/localize.js";
import { LitMaterialDataGrid } from "./data-grid.js";
import { csvField, neutralizeFormula, toCsvText } from "./csv.js";

// Only the shadow root: the host's JSON attributes hold every value too.
const renderToString = async (template: ReturnType<typeof html>) => {
  const out = await collectResult(render(template));
  return out.slice(out.indexOf("<template"));
};
const j = JSON.stringify;
const columns = j([
  { key: "name", header: "Name", sortable: true, editable: true },
  { key: "dept", header: "Dept" },
  { key: "salary", header: "Salary", numeric: true, aggregate: "sum" },
]);
const rows = j([
  { id: 1, name: "Ada", dept: "eng", salary: 1000 },
  { id: 2, name: "Grace", dept: "ops", salary: 80 },
  { id: 3, name: "Alan", dept: "eng", salary: 120 },
]);

describe("lit-material-data-grid (SSR)", () => {
  it("constructs without a browser", () => {
    assert.doesNotThrow(() => new LitMaterialDataGrid());
  });

  it("server-renders a grid from JSON attributes, sorted", async () => {
    const out = await renderToString(
      html`<lit-material-data-grid row-key="id" label="People" sort-key="name" columns=${columns} rows=${rows}></lit-material-data-grid>`,
    );
    assert.match(out, /shadowrootmode="open"/);
    assert.match(out, /<lit-material-data-table[^>]*role="grid"/);
    assert.match(out, /aria-label="People"/);
    assert.match(out, /role="columnheader"[^>]*aria-sort="ascending"|aria-sort="ascending"[^>]*role="columnheader"/s);
    assert.match(out, /role="gridcell"/);
    const ada = out.indexOf("Ada");
    const alan = out.indexOf("Alan");
    const grace = out.indexOf("Grace");
    assert.ok(ada > 0 && ada < alan && alan < grace, "rows in sorted order");
    assert.match(out, /1,000/); // locale-formatted number
    assert.match(out, /tabindex="0"/);
  });

  it("server-renders group rows as a treegrid", async () => {
    const out = await renderToString(
      html`<lit-material-data-grid
        row-key="id"
        group-by="dept"
        expanded-groups=${j(["eng"])}
        columns=${columns}
        rows=${rows}
      ></lit-material-data-grid>`,
    );
    assert.match(out, /role="treegrid"/);
    assert.match(out, /class="group"[^>]*aria-level="1"[^>]*aria-expanded="true"/s);
    assert.match(out, /aria-expanded="false"/);
    assert.match(out, /Sum: 1,120/);
    assert.match(out, /2 rows/);
    assert.match(out, /aria-level="2"/);
    // ops is collapsed: Grace isn't rendered.
    assert.doesNotMatch(out, /Grace/);
  });

  it("server-renders in the element's language and direction", async () => {
    registerTranslation({ $code: "xx-ssr", "dataTable.noRows": "Nichts" });
    const out = await renderToString(html`<lit-material-data-grid lang="xx-ssr" dir="rtl" columns=${columns} rows="[]"></lit-material-data-grid>`);
    assert.match(out, /Nichts/);
  });

  it("server-renders the pagination footer", async () => {
    const out = await renderToString(html`<lit-material-data-grid page-size="2" columns=${columns} rows=${rows}></lit-material-data-grid>`);
    assert.match(out, /<lit-material-data-table-pagination/);
    assert.match(out, /aria-rowcount="4"/);
  });

  it("exports CSV without a browser", () => {
    const grid = new LitMaterialDataGrid();
    grid.columns = [{ key: "name", header: "Name" }];
    grid.rows = [{ name: "=1+1" }, { name: "a,b" }];
    // toCSV reads the model built on update; build it as an update would.
    (grid as unknown as { buildModel(): void }).buildModel();
    assert.equal(grid.toCSV(), "Name\r\n'=1+1\r\n\"a,b\"");
  });
});

describe("csv helpers", () => {
  it("quotes fields with the delimiter, quotes, CR or LF, doubling quotes", () => {
    assert.equal(csvField("plain"), "plain");
    assert.equal(csvField("a,b"), '"a,b"');
    assert.equal(csvField('say "hi"'), '"say ""hi"""');
    assert.equal(csvField("two\r\nlines"), '"two\r\nlines"');
    assert.equal(csvField("a;b", ";"), '"a;b"');
    assert.equal(csvField("a;b"), "a;b");
  });

  it("neutralises formula-like text but not plain numbers", () => {
    for (const text of ["=SUM(A1)", "+cmd", "-2+3", "@x", "\tx", "\rx"]) assert.equal(neutralizeFormula(text), `'${text}`);
    for (const text of ["-5", "+1", "-1.5", "1e-3", "-.5", "hello", ""]) assert.equal(neutralizeFormula(text), text);
    assert.equal(csvField("=1,2"), `"'=1,2"`);
    assert.equal(csvField("=1", ",", false), "=1");
  });

  it("joins records with CRLF and adds a byte order mark on request", () => {
    assert.equal(toCsvText([["a", "b"], ["1", "2"]]), "a,b\r\n1,2");
    assert.equal(toCsvText([["a"]], { bom: true }), "﻿a");
    assert.equal(toCsvText([["a", "b"]], { delimiter: "\t" }), "a\tb");
  });
});
