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
});
