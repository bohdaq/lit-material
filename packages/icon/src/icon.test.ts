import { expect, fixture, html } from "@open-wc/testing";
import "./icon.js";
import type { LitMaterialIcon } from "./icon.js";

describe("lit-material-icon", () => {
  it("defaults to size=medium, color=inherit", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon>★</lit-material-icon>`);
    expect(el.size).to.equal("medium");
    expect(el.color).to.equal("inherit");
  });

  it("is aria-hidden by default (decorative)", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon>★</lit-material-icon>`);
    expect(el.getAttribute("aria-hidden")).to.equal("true");
    expect(el.hasAttribute("role")).to.be.false;
    expect(el.hasAttribute("aria-label")).to.be.false;
  });

  it("becomes role=img with aria-label when label is set", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon label="Warning">⚠️</lit-material-icon>`);
    expect(el.getAttribute("role")).to.equal("img");
    expect(el.getAttribute("aria-label")).to.equal("Warning");
    expect(el.hasAttribute("aria-hidden")).to.be.false;
  });

  it("switches back to decorative when label is cleared", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon label="Warning">⚠️</lit-material-icon>`);
    el.label = "";
    await el.updateComplete;
    expect(el.getAttribute("aria-hidden")).to.equal("true");
    expect(el.hasAttribute("role")).to.be.false;
  });

  it("reflects size and color", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon size="large" color="success">✓</lit-material-icon>`);
    expect(el.getAttribute("size")).to.equal("large");
    expect(el.getAttribute("color")).to.equal("success");
  });

  it("sizes slotted svg/img content to fill the host", async () => {
    const el = await fixture<LitMaterialIcon>(html`
      <lit-material-icon><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"></circle></svg></lit-material-icon>
    `);
    const svg = el.querySelector("svg")!;
    expect(getComputedStyle(svg).width).to.equal("24px");
    expect(getComputedStyle(svg).height).to.equal("24px");
  });

  it("renders slotted content", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon>★</lit-material-icon>`);
    expect(el.textContent!.trim()).to.equal("★");
  });

  it("passes axe accessibility checks when decorative", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon>★</lit-material-icon>`);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks when labeled", async () => {
    const el = await fixture<LitMaterialIcon>(html`<lit-material-icon label="Favorite">★</lit-material-icon>`);
    await expect(el).to.be.accessible();
  });
});
