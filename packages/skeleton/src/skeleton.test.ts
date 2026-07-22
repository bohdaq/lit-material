import { expect, fixture, html } from "@open-wc/testing";
import "./skeleton.js";
import type { LitMaterialSkeleton } from "./skeleton.js";

describe("lit-material-skeleton", () => {
  it("defaults to variant=text and animation=pulse", async () => {
    const el = await fixture<LitMaterialSkeleton>(html`<lit-material-skeleton></lit-material-skeleton>`);
    expect(el.variant).to.equal("text");
    expect(el.animation).to.equal("pulse");
  });

  it("is aria-hidden — purely decorative", async () => {
    const el = await fixture<LitMaterialSkeleton>(html`<lit-material-skeleton></lit-material-skeleton>`);
    const block = el.shadowRoot!.querySelector(".skeleton")!;
    expect(block.getAttribute("aria-hidden")).to.equal("true");
  });

  it("applies width/height as inline styles when set", async () => {
    const el = await fixture<LitMaterialSkeleton>(
      html`<lit-material-skeleton width="12rem" height="2rem"></lit-material-skeleton>`,
    );
    const block = el.shadowRoot!.querySelector(".skeleton") as HTMLElement;
    expect(block.style.width).to.equal("12rem");
    expect(block.style.height).to.equal("2rem");
  });

  it("leaves inline width/height unset when the properties are empty (falls back to per-variant CSS)", async () => {
    const el = await fixture<LitMaterialSkeleton>(html`<lit-material-skeleton variant="circular"></lit-material-skeleton>`);
    const block = el.shadowRoot!.querySelector(".skeleton") as HTMLElement;
    expect(block.style.width).to.equal("");
    expect(block.style.height).to.equal("");
    expect(getComputedStyle(block).borderRadius).to.equal("50%");
  });

  it("reflects variant and animation as attributes", async () => {
    const el = await fixture<LitMaterialSkeleton>(
      html`<lit-material-skeleton variant="rounded" animation="wave"></lit-material-skeleton>`,
    );
    expect(el.getAttribute("variant")).to.equal("rounded");
    expect(el.getAttribute("animation")).to.equal("wave");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSkeleton>(html`<lit-material-skeleton></lit-material-skeleton>`);
    await expect(el).to.be.accessible();
  });
});
