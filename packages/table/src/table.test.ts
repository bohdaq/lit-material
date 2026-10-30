import { expect, fixture, html } from "@open-wc/testing";
import "./table.js";
import type { LitMaterialTable, TableColumn } from "./table.js";

const columns: TableColumn[] = [
  { key: "url", label: "Backend", mono: true },
  { key: "weight", label: "Weight", numeric: true },
  { key: "action", label: "Action", hiddenLabel: true, render: (row) => html`<button>Drain ${row.url}</button>` },
];
const rows = [
  { url: "http://10.0.0.5:8080", weight: 3 },
  { url: "http://10.0.0.6:8080", weight: 1 },
];

describe("lit-material-table", () => {
  it("renders a real table with column headers, a caption and the rows", async () => {
    const el = await fixture<LitMaterialTable>(html`<lit-material-table caption="Backends" .columns=${columns} .rows=${rows}></lit-material-table>`);
    const table = el.shadowRoot!.querySelector("table")!;
    expect(table.querySelector("caption")!.textContent).to.equal("Backends");
    const headers = [...table.querySelectorAll("th")];
    expect(headers.map((h) => h.getAttribute("scope"))).to.deep.equal(["col", "col", "col"]);
    expect(table.querySelectorAll("tbody tr").length).to.equal(2);
    expect(table.querySelector("tbody td")!.textContent).to.equal("http://10.0.0.5:8080");
  });

  it("aligns numeric columns and marks mono ones", async () => {
    const el = await fixture<LitMaterialTable>(html`<lit-material-table .columns=${columns} .rows=${rows}></lit-material-table>`);
    const [url, weight] = el.shadowRoot!.querySelectorAll("tbody tr:first-child td");
    expect(getComputedStyle(weight).textAlign).to.equal("right");
    expect(url.classList.contains("mono")).to.be.true;
  });

  it("renders custom cells and screen-reader-only headers", async () => {
    const el = await fixture<LitMaterialTable>(html`<lit-material-table .columns=${columns} .rows=${rows}></lit-material-table>`);
    expect(el.shadowRoot!.querySelector("tbody button")!.textContent).to.equal("Drain http://10.0.0.5:8080");
    const hidden = el.shadowRoot!.querySelectorAll("th")[2].querySelector(".visually-hidden")!;
    expect(hidden.textContent).to.equal("Action");
  });

  it("shows the empty slot without rows", async () => {
    const el = await fixture<LitMaterialTable>(html`<lit-material-table .columns=${columns} .rows=${[]}><span slot="empty">No backends</span></lit-material-table>`);
    expect(el.shadowRoot!.querySelector("tbody")).to.be.null;
    const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="empty"]')!;
    expect(slot.assignedElements()[0].textContent).to.equal("No backends");
  });

  it("shows empty strings for missing fields", async () => {
    const el = await fixture<LitMaterialTable>(html`<lit-material-table .columns=${columns.slice(0, 2)} .rows=${[{ url: "x" }]}></lit-material-table>`);
    expect(el.shadowRoot!.querySelectorAll("tbody td")[1].textContent).to.equal("");
  });
});
