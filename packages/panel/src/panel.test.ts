import { expect, fixture, html } from "@open-wc/testing";
import "./panel.js";
import type { LitMaterialPanel } from "./panel.js";

describe("lit-material-panel", () => {
  it("defaults to variant=default", async () => {
    const el = await fixture<LitMaterialPanel>(html`<lit-material-panel></lit-material-panel>`);
    expect(el.getAttribute("variant")).to.equal("default");
  });

  it("reflects a custom variant", async () => {
    const el = await fixture<LitMaterialPanel>(html`<lit-material-panel variant="raised"></lit-material-panel>`);
    expect(el.getAttribute("variant")).to.equal("raised");
  });

  it("draws the header/footer band directly on slotted content", async () => {
    const el = await fixture<LitMaterialPanel>(html`
      <lit-material-panel>
        <span slot="header">Title</span>
        <p>Body</p>
        <span slot="footer">Footer</span>
      </lit-material-panel>
    `);
    const header = el.querySelector('[slot="header"]') as HTMLElement;
    const footer = el.querySelector('[slot="footer"]') as HTMLElement;
    expect(getComputedStyle(header).borderBottomStyle).to.equal("solid");
    expect(getComputedStyle(footer).borderTopStyle).to.equal("solid");
  });

  it("draws no band at all when the header/footer slots are empty (nothing to hide)", async () => {
    const el = await fixture<LitMaterialPanel>(html`
      <lit-material-panel>
        <p>Body only</p>
      </lit-material-panel>
    `);
    const headerSlot = el.shadowRoot!.querySelector('slot[name="header"]') as HTMLElement;
    const footerSlot = el.shadowRoot!.querySelector('slot[name="footer"]') as HTMLElement;
    expect(getComputedStyle(headerSlot).display).to.equal("contents");
    expect(getComputedStyle(footerSlot).display).to.equal("contents");
  });

  it("reflects scrollable", async () => {
    const el = await fixture<LitMaterialPanel>(html`<lit-material-panel scrollable></lit-material-panel>`);
    expect(el.hasAttribute("scrollable")).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialPanel>(html`
      <lit-material-panel>
        <span slot="header">Title</span>
        <p>Body</p>
      </lit-material-panel>
    `);
    await expect(el).to.be.accessible();
  });
});
