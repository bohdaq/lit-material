import { expect, fixture, html } from "@open-wc/testing";
import "./toolbar.js";
import "./toolbar-spacer.js";
import type { LitMaterialToolbar } from "./toolbar.js";

describe("lit-material-toolbar", () => {
  it("sets role=toolbar on itself", async () => {
    const el = await fixture<LitMaterialToolbar>(html`<lit-material-toolbar></lit-material-toolbar>`);
    expect(el.getAttribute("role")).to.equal("toolbar");
  });

  it("renders its slotted content", async () => {
    const el = await fixture<LitMaterialToolbar>(html`
      <lit-material-toolbar>
        <button>Filter</button>
        <lit-material-toolbar-spacer></lit-material-toolbar-spacer>
        <button>Save</button>
      </lit-material-toolbar>
    `);
    expect(el.querySelectorAll("button").length).to.equal(2);
    expect(el.querySelector("lit-material-toolbar-spacer")).to.exist;
  });

  it("reflects dense", async () => {
    const el = await fixture<LitMaterialToolbar>(html`<lit-material-toolbar dense></lit-material-toolbar>`);
    expect(el.hasAttribute("dense")).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialToolbar>(html`
      <lit-material-toolbar>
        <button>Filter</button>
      </lit-material-toolbar>
    `);
    await expect(el).to.be.accessible();
  });
});

describe("lit-material-toolbar-spacer", () => {
  it("constructs and connects without error", async () => {
    const el = await fixture(html`<lit-material-toolbar-spacer></lit-material-toolbar-spacer>`);
    expect(el).to.exist;
  });
});
