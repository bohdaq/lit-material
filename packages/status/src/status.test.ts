import { expect, fixture, html } from "@open-wc/testing";
import "./status.js";
import type { LitMaterialStatus } from "./status.js";

describe("lit-material-status", () => {
  it("shows the label and a glyph for its state", async () => {
    const el = await fixture<LitMaterialStatus>(html`<lit-material-status status="ok">Healthy</lit-material-status>`);
    const row = el.shadowRoot!.querySelector(".status")!;
    expect(row.classList.contains("ok")).to.be.true;
    expect(el.shadowRoot!.querySelector("svg")).to.exist;
    expect(el.textContent).to.equal("Healthy");
    expect(el.shadowRoot!.querySelector(".icon")!.getAttribute("aria-hidden")).to.equal("true");
  });

  it("gives each state a different glyph and colour", async () => {
    const glyphs = new Set<string>();
    const colors = new Set<string>();
    for (const status of ["ok", "warning", "error", "info", "neutral"]) {
      const el = await fixture<LitMaterialStatus>(html`<lit-material-status status=${status}>x</lit-material-status>`);
      glyphs.add(el.shadowRoot!.querySelector("svg")!.innerHTML);
      colors.add(getComputedStyle(el.shadowRoot!.querySelector(".status")!).color);
    }
    expect(glyphs.size).to.equal(5);
    expect(colors.size).to.equal(5);
  });

  it("treats an unknown status as neutral", async () => {
    const el = await fixture<LitMaterialStatus>(html`<lit-material-status status="purple">?</lit-material-status>`);
    expect(el.shadowRoot!.querySelector(".status")!.classList.contains("neutral")).to.be.true;
  });

  it("lets a slotted icon replace the glyph", async () => {
    const el = await fixture<LitMaterialStatus>(
      html`<lit-material-status status="ok"><span slot="icon" id="mine">★</span>Starred</lit-material-status>`,
    );
    const slot = el.shadowRoot!.querySelector<HTMLSlotElement>('slot[name="icon"]')!;
    expect(slot.assignedElements()[0].id).to.equal("mine");
  });

  it("reflects status for styling from outside", async () => {
    const el = await fixture<LitMaterialStatus>(html`<lit-material-status></lit-material-status>`);
    el.status = "error";
    await el.updateComplete;
    expect(el.getAttribute("status")).to.equal("error");
  });

  it("draws a filled pill without the glyph, and a mono label", async () => {
    const el = await fixture<LitMaterialStatus>(html`<lit-material-status status="ok" appearance="pill" mono>200 OK</lit-material-status>`);
    const row = el.shadowRoot!.querySelector<HTMLElement>(".status")!;
    const style = getComputedStyle(row);
    expect(style.backgroundColor).to.not.equal("rgba(0, 0, 0, 0)");
    expect(parseFloat(style.paddingLeft)).to.be.above(0);
    expect(getComputedStyle(el.shadowRoot!.querySelector(".icon")!).display).to.equal("none");
    expect(style.fontFamily.toLowerCase()).to.match(/mono|menlo/);
    expect(el.textContent).to.equal("200 OK");
    await expect(el).to.be.accessible();
  });

  it("keeps every pill readable: label against its container passes AA", async () => {
    for (const status of ["ok", "warning", "error", "info", "neutral"]) {
      const el = await fixture<LitMaterialStatus>(html`<lit-material-status status=${status} appearance="pill">Label</lit-material-status>`);
      await expect(el).to.be.accessible();
    }
  });
});
