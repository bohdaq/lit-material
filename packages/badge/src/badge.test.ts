import { expect, fixture, html } from "@open-wc/testing";
import "./badge.js";
import type { LitMaterialBadge } from "./badge.js";

describe("lit-material-badge", () => {
  it("renders as a small dot with no value, aria-hidden by default", async () => {
    const el = await fixture<LitMaterialBadge>(html`<lit-material-badge></lit-material-badge>`);
    const badge = el.shadowRoot!.querySelector(".badge")!;
    expect(badge.classList.contains("large")).to.be.false;
    expect(badge.getAttribute("aria-hidden")).to.equal("true");
    expect(badge.hasAttribute("role")).to.be.false;
    const rect = badge.getBoundingClientRect();
    expect(rect.width).to.be.closeTo(6, 0.5);
    expect(rect.height).to.be.closeTo(6, 0.5);
  });

  it("grows to the large badge with text value, sized correctly (not just wider)", async () => {
    const el = await fixture<LitMaterialBadge>(html`<lit-material-badge value="NEW"></lit-material-badge>`);
    const badge = el.shadowRoot!.querySelector(".badge")!;
    expect(badge.classList.contains("large")).to.be.true;
    const rect = badge.getBoundingClientRect();
    expect(rect.width).to.be.greaterThan(6);
    expect(rect.height).to.be.closeTo(16, 0.5);
    expect(badge.textContent?.trim()).to.equal("NEW");
  });

  it("clamps a numeric value to max+ once it exceeds max", async () => {
    const el = await fixture<LitMaterialBadge>(html`<lit-material-badge value="150" max="99"></lit-material-badge>`);
    const badge = el.shadowRoot!.querySelector(".badge")!;
    expect(badge.textContent?.trim()).to.equal("99+");
  });

  it("clamps a numeric value set as an HTML attribute string the same as a JS number property", async () => {
    const viaAttribute = await fixture<LitMaterialBadge>(
      html`<lit-material-badge value="150" max="99"></lit-material-badge>`,
    );
    const el = document.createElement("lit-material-badge") as LitMaterialBadge;
    el.value = 150;
    el.max = 99;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(viaAttribute.shadowRoot!.querySelector(".badge")!.textContent?.trim()).to.equal("99+");
    expect(el.shadowRoot!.querySelector(".badge")!.textContent?.trim()).to.equal("99+");
    el.remove();
  });

  it("does not clamp a numeric value at or below max", async () => {
    const el = await fixture<LitMaterialBadge>(html`<lit-material-badge value="42" max="99"></lit-material-badge>`);
    const badge = el.shadowRoot!.querySelector(".badge")!;
    expect(badge.textContent?.trim()).to.equal("42");
  });

  it("exposes role=status and aria-label, and drops aria-hidden, when label is set", async () => {
    const el = await fixture<LitMaterialBadge>(
      html`<lit-material-badge value="5" label="5 unread messages"></lit-material-badge>`,
    );
    const badge = el.shadowRoot!.querySelector(".badge")!;
    expect(badge.getAttribute("role")).to.equal("status");
    expect(badge.getAttribute("aria-label")).to.equal("5 unread messages");
    expect(badge.hasAttribute("aria-hidden")).to.be.false;
  });

  it("passes axe accessibility checks (default aria-hidden dot)", async () => {
    const el = await fixture<LitMaterialBadge>(html`<lit-material-badge></lit-material-badge>`);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks (labeled standalone badge)", async () => {
    const el = await fixture<LitMaterialBadge>(
      html`<lit-material-badge value="5" label="5 unread messages"></lit-material-badge>`,
    );
    await expect(el).to.be.accessible();
  });
});
