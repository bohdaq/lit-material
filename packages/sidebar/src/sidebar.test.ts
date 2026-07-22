import { expect, fixture, html } from "@open-wc/testing";
import "./sidebar.js";
import type { LitMaterialSidebar } from "./sidebar.js";

describe("lit-material-sidebar", () => {
  it("defaults to position=start", async () => {
    const el = await fixture<LitMaterialSidebar>(html`<lit-material-sidebar></lit-material-sidebar>`);
    expect(el.getAttribute("position")).to.equal("start");
  });

  it("reflects position=end", async () => {
    const el = await fixture<LitMaterialSidebar>(html`<lit-material-sidebar position="end"></lit-material-sidebar>`);
    expect(el.getAttribute("position")).to.equal("end");
  });

  it("applies panel-width as a CSS custom property", async () => {
    const el = await fixture<LitMaterialSidebar>(
      html`<lit-material-sidebar panel-width="12rem"></lit-material-sidebar>`,
    );
    expect(el.style.getPropertyValue("--lit-material-sidebar-panel-width").trim()).to.equal("12rem");
  });

  it("renders panel and default slot content", async () => {
    const el = await fixture<LitMaterialSidebar>(html`
      <lit-material-sidebar>
        <nav slot="panel">Filters</nav>
        <p>Results</p>
      </lit-material-sidebar>
    `);
    expect(el.querySelector('[slot="panel"]')).to.exist;
    expect(el.querySelector("p")).to.exist;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSidebar>(html`
      <lit-material-sidebar>
        <nav slot="panel">Filters</nav>
        <p>Results</p>
      </lit-material-sidebar>
    `);
    await expect(el).to.be.accessible();
  });
});
