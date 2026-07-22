import { expect, fixture, html } from "@open-wc/testing";
import "./avatar.js";
import type { LitMaterialAvatar } from "./avatar.js";

describe("lit-material-avatar", () => {
  it("shows the default icon fallback when nothing is set", async () => {
    const el = await fixture<LitMaterialAvatar>(html`<lit-material-avatar></lit-material-avatar>`);
    const slot = el.shadowRoot!.querySelector("slot");
    expect(slot).to.exist;
    expect(el.shadowRoot!.querySelector("img")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".initials")).to.not.exist;
  });

  it("shows an image when src is set", async () => {
    const el = await fixture<LitMaterialAvatar>(
      html`<lit-material-avatar src="https://example.com/avatar.png" alt="Jane Doe"></lit-material-avatar>`,
    );
    const img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    expect(img).to.exist;
    expect(img.src).to.equal("https://example.com/avatar.png");
    expect(el.shadowRoot!.querySelector(".initials")).to.not.exist;
  });

  it("falls back to initials when the image fails to load", async () => {
    const el = await fixture<LitMaterialAvatar>(
      html`<lit-material-avatar src="https://example.com/broken.png" initials="JD"></lit-material-avatar>`,
    );
    const img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("img")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".initials")!.textContent!.trim()).to.equal("JD");
  });

  it("resets the failed-image state when src changes", async () => {
    const el = await fixture<LitMaterialAvatar>(
      html`<lit-material-avatar src="https://example.com/broken.png" initials="JD"></lit-material-avatar>`,
    );
    let img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    img.dispatchEvent(new Event("error"));
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("img")).to.not.exist;

    el.src = "https://example.com/new.png";
    await el.updateComplete;
    img = el.shadowRoot!.querySelector("img") as HTMLImageElement;
    expect(img).to.exist;
  });

  it("shows initials text when there is no src", async () => {
    const el = await fixture<LitMaterialAvatar>(html`<lit-material-avatar initials="AB"></lit-material-avatar>`);
    expect(el.shadowRoot!.querySelector(".initials")!.textContent!.trim()).to.equal("AB");
  });

  it("shows slotted custom content instead of the default icon when provided", async () => {
    const el = await fixture<LitMaterialAvatar>(html`
      <lit-material-avatar>
        <svg class="custom-icon" viewBox="0 0 24 24"></svg>
      </lit-material-avatar>
    `);
    const slot = el.shadowRoot!.querySelector("slot")!;
    const assigned = slot.assignedElements();
    expect(assigned.length).to.equal(1);
    expect(assigned[0]!.classList.contains("custom-icon")).to.be.true;
  });

  it("sets role=img and aria-label on the container when alt or initials is given", async () => {
    const withAlt = await fixture<LitMaterialAvatar>(html`<lit-material-avatar alt="Jane Doe"></lit-material-avatar>`);
    const containerWithAlt = withAlt.shadowRoot!.querySelector(".avatar")!;
    expect(containerWithAlt.getAttribute("role")).to.equal("img");
    expect(containerWithAlt.getAttribute("aria-label")).to.equal("Jane Doe");

    const withInitials = await fixture<LitMaterialAvatar>(html`<lit-material-avatar initials="JD"></lit-material-avatar>`);
    expect(withInitials.shadowRoot!.querySelector(".avatar")!.getAttribute("role")).to.equal("img");

    const withNeither = await fixture<LitMaterialAvatar>(html`<lit-material-avatar></lit-material-avatar>`);
    expect(withNeither.shadowRoot!.querySelector(".avatar")!.hasAttribute("role")).to.be.false;
  });

  it("defaults to medium size and circle shape", async () => {
    const el = await fixture<LitMaterialAvatar>(html`<lit-material-avatar></lit-material-avatar>`);
    expect(el.size).to.equal("medium");
    expect(el.shape).to.equal("circle");
  });

  it("passes axe accessibility checks (image, initials, and icon-fallback states)", async () => {
    const withImage = await fixture<LitMaterialAvatar>(
      html`<lit-material-avatar src="https://example.com/avatar.png" alt="Jane Doe"></lit-material-avatar>`,
    );
    await expect(withImage).to.be.accessible();

    const withInitials = await fixture<LitMaterialAvatar>(html`<lit-material-avatar initials="JD"></lit-material-avatar>`);
    await expect(withInitials).to.be.accessible();

    const withIcon = await fixture<LitMaterialAvatar>(html`<lit-material-avatar></lit-material-avatar>`);
    await expect(withIcon).to.be.accessible();
  });
});
