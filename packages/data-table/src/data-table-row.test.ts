import { expect, fixture, html } from "@open-wc/testing";
import "./data-table-row.js";
import type { LitMaterialDataTableRow } from "./data-table-row.js";

describe("lit-material-data-table-row", () => {
  it("renders role=row", async () => {
    const el = await fixture<LitMaterialDataTableRow>(html`<lit-material-data-table-row></lit-material-data-table-row>`);
    expect(el.getAttribute("role")).to.equal("row");
  });

  it("reflects selected to the attribute", async () => {
    const el = await fixture<LitMaterialDataTableRow>(
      html`<lit-material-data-table-row selected></lit-material-data-table-row>`,
    );
    expect(el.hasAttribute("selected")).to.be.true;
  });

  it("applies a background when selected", async () => {
    const plain = await fixture<LitMaterialDataTableRow>(html`<lit-material-data-table-row></lit-material-data-table-row>`);
    const selected = await fixture<LitMaterialDataTableRow>(
      html`<lit-material-data-table-row selected></lit-material-data-table-row>`,
    );
    expect(getComputedStyle(selected).backgroundColor).to.not.equal(getComputedStyle(plain).backgroundColor);
  });

  it("switches from table-row to flex layout when flex is set", async () => {
    const el = await fixture<LitMaterialDataTableRow>(html`<lit-material-data-table-row flex></lit-material-data-table-row>`);
    expect(getComputedStyle(el).display).to.equal("flex");
  });
});
