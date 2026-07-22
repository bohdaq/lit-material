import { expect, fixture, html } from "@open-wc/testing";
import "./page.js";
import type { LitMaterialPage } from "./page.js";

describe("lit-material-page", () => {
  it("renders header, sidebar, and main content slot content", async () => {
    const el = await fixture<LitMaterialPage>(html`
      <lit-material-page>
        <header slot="header">Top bar</header>
        <nav slot="sidebar">Nav</nav>
        <p>Content</p>
      </lit-material-page>
    `);
    expect(el.querySelector('[slot="header"]')).to.exist;
    expect(el.querySelector('[slot="sidebar"]')).to.exist;
    expect(el.querySelector("p")).to.exist;
  });

  it("puts unslotted content in the default (main) slot", async () => {
    const el = await fixture<LitMaterialPage>(html`
      <lit-material-page>
        <p>Content</p>
      </lit-material-page>
    `);
    const mainSlot = el.shadowRoot!.querySelector("main slot") as HTMLSlotElement;
    const assigned = mainSlot.assignedElements();
    expect(assigned.length).to.equal(1);
    expect(assigned[0]!.tagName).to.equal("P");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialPage>(html`
      <lit-material-page>
        <header slot="header">Top bar</header>
        <p>Content</p>
      </lit-material-page>
    `);
    await expect(el).to.be.accessible();
  });
});
