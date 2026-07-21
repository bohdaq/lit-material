import { expect, fixture, html } from "@open-wc/testing";
import "./carousel-item.js";
import type { LitMaterialCarouselItem } from "./carousel-item.js";

describe("lit-material-carousel-item", () => {
  it("sets role=group and aria-roledescription=slide", async () => {
    const el = await fixture<LitMaterialCarouselItem>(html`<lit-material-carousel-item>Content</lit-material-carousel-item>`);
    expect(el.getAttribute("role")).to.equal("group");
    expect(el.getAttribute("aria-roledescription")).to.equal("slide");
  });

  it("does not render the label overlay when no label slot content is provided", async () => {
    const el = await fixture<LitMaterialCarouselItem>(html`<lit-material-carousel-item>Content</lit-material-carousel-item>`);
    expect(el.shadowRoot!.querySelector(".label")).to.not.exist;
  });

  it("renders the label overlay once the label slot has content", async () => {
    const el = await fixture<LitMaterialCarouselItem>(html`
      <lit-material-carousel-item>
        Content
        <span slot="label">Caption</span>
      </lit-material-carousel-item>
    `);
    expect(el.shadowRoot!.querySelector(".label")).to.exist;
    expect(el.querySelector('[slot="label"]')!.textContent).to.equal("Caption");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialCarouselItem>(html`<lit-material-carousel-item>Content</lit-material-carousel-item>`);
    await expect(el).to.be.accessible();
  });
});
