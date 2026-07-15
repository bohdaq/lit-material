import { expect, fixture, html } from "@open-wc/testing";
import "./divider.js";
import type { LitMaterialDivider } from "./divider.js";

describe("lit-material-divider", () => {
  it("defaults to horizontal with role=separator and no aria-orientation", async () => {
    const el = await fixture<LitMaterialDivider>(html`<lit-material-divider></lit-material-divider>`);
    expect(el.orientation).to.equal("horizontal");
    expect(el.getAttribute("role")).to.equal("separator");
    expect(el.hasAttribute("aria-orientation")).to.be.false;
  });

  it("is a thin full-width line by default", async () => {
    const el = await fixture<LitMaterialDivider>(
      html`<div style="width: 300px;"><lit-material-divider></lit-material-divider></div>`,
    );
    const divider = el.querySelector("lit-material-divider")!;
    const rect = divider.getBoundingClientRect();
    expect(rect.height).to.be.closeTo(1, 0.5);
    expect(rect.width).to.be.closeTo(300, 0.5);
  });

  it("sets aria-orientation=vertical and becomes a thin tall line when orientation is vertical", async () => {
    const el = await fixture<LitMaterialDivider>(html`
      <div style="height: 100px; display: flex;">
        <lit-material-divider orientation="vertical"></lit-material-divider>
      </div>
    `);
    const divider = el.querySelector<LitMaterialDivider>("lit-material-divider")!;
    expect(divider.getAttribute("aria-orientation")).to.equal("vertical");
    const rect = divider.getBoundingClientRect();
    expect(rect.width).to.be.closeTo(1, 0.5);
    expect(rect.height).to.be.closeTo(100, 0.5);
  });

  it("updates aria-orientation reactively when orientation changes", async () => {
    const el = await fixture<LitMaterialDivider>(html`<lit-material-divider></lit-material-divider>`);
    expect(el.hasAttribute("aria-orientation")).to.be.false;
    el.orientation = "vertical";
    await el.updateComplete;
    expect(el.getAttribute("aria-orientation")).to.equal("vertical");
    el.orientation = "horizontal";
    await el.updateComplete;
    expect(el.hasAttribute("aria-orientation")).to.be.false;
  });

  it("shrinks to fit when inset-start and/or inset-end are set, rather than overflowing its container", async () => {
    const container = await fixture<HTMLDivElement>(html`
      <div style="width: 300px;">
        <lit-material-divider inset-start inset-end></lit-material-divider>
      </div>
    `);
    const divider = container.querySelector("lit-material-divider")!;
    const containerRect = container.getBoundingClientRect();
    const dividerRect = divider.getBoundingClientRect();
    expect(dividerRect.left).to.be.greaterThan(containerRect.left);
    expect(dividerRect.right).to.be.lessThan(containerRect.right);
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialDivider>(html`<lit-material-divider></lit-material-divider>`);
    await expect(el).to.be.accessible();
  });
});
