import { expect, fixture, html } from "@open-wc/testing";
import "./data-table-cell.js";
import type { LitMaterialDataTableCell } from "./data-table-cell.js";

describe("lit-material-data-table-cell", () => {
  it("renders role=cell by default", async () => {
    const el = await fixture<LitMaterialDataTableCell>(html`<lit-material-data-table-cell>Ada</lit-material-data-table-cell>`);
    expect(el.getAttribute("role")).to.equal("cell");
    expect(el.shadowRoot!.querySelector("button")).to.not.exist;
  });

  it("renders role=columnheader when header is set", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header>Name</lit-material-data-table-cell>`,
    );
    expect(el.getAttribute("role")).to.equal("columnheader");
  });

  it("updates role reactively when header changes", async () => {
    const el = await fixture<LitMaterialDataTableCell>(html`<lit-material-data-table-cell>Ada</lit-material-data-table-cell>`);
    expect(el.getAttribute("role")).to.equal("cell");
    el.header = true;
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("columnheader");
  });

  it("only renders a sort button when header and sort-key are both set", async () => {
    const headerOnly = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header>Name</lit-material-data-table-cell>`,
    );
    expect(headerOnly.shadowRoot!.querySelector("button")).to.not.exist;

    const sortKeyOnly = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell sort-key="name">Name</lit-material-data-table-cell>`,
    );
    expect(sortKeyOnly.shadowRoot!.querySelector("button")).to.not.exist;

    const both = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>`,
    );
    expect(both.shadowRoot!.querySelector("button")).to.exist;
  });

  it("dispatches a composed, bubbling sort-request event with the sort key on click", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell header sort-key="name">Name</lit-material-data-table-cell>`,
    );
    let detail: { sortKey?: string } | undefined;
    el.addEventListener("sort-request", (event) => {
      detail = (event as CustomEvent<{ sortKey?: string }>).detail;
    });
    el.shadowRoot!.querySelector("button")!.click();
    expect(detail).to.deep.equal({ sortKey: "name" });
  });

  it("right-aligns content when numeric is set", async () => {
    const el = await fixture<LitMaterialDataTableCell>(
      html`<lit-material-data-table-cell numeric>42</lit-material-data-table-cell>`,
    );
    expect(getComputedStyle(el).textAlign).to.equal("end");
  });

  it("passes axe accessibility checks inside a table/row ancestor", async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <div role="table"><div role="row"><lit-material-data-table-cell header>Name</lit-material-data-table-cell></div></div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
