import { expect, fixture, html } from "@open-wc/testing";
import "./data-list-cell.js";
import type { LitMaterialDataListCell } from "./data-list-cell.js";

describe("lit-material-data-list-cell", () => {
  it("defaults to not filling", async () => {
    const el = await fixture<LitMaterialDataListCell>(html`<lit-material-data-list-cell>Cell</lit-material-data-list-cell>`);
    expect(el.hasAttribute("fill")).to.be.false;
  });

  it("reflects fill", async () => {
    const el = await fixture<LitMaterialDataListCell>(html`<lit-material-data-list-cell fill>Cell</lit-material-data-list-cell>`);
    expect(el.hasAttribute("fill")).to.be.true;
    expect(getComputedStyle(el).flexGrow).to.equal("1");
  });

  it("renders its slotted content", async () => {
    const el = await fixture<LitMaterialDataListCell>(html`<lit-material-data-list-cell>Cell content</lit-material-data-list-cell>`);
    expect(el.textContent!.trim()).to.equal("Cell content");
  });
});
