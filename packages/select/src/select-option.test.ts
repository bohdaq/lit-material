import { expect, fixture, html } from "@open-wc/testing";
import "./select-option.js";
import type { LitMaterialSelectOption } from "./select-option.js";

describe("lit-material-select-option", () => {
  it("renders with role=option and aria-selected=false by default", async () => {
    const el = await fixture<LitMaterialSelectOption>(
      html`<lit-material-select-option value="s">Small</lit-material-select-option>`,
    );
    expect(el.getAttribute("role")).to.equal("option");
    expect(el.getAttribute("aria-selected")).to.equal("false");
    expect(el.shadowRoot!.querySelector(".checkmark")).to.not.exist;
  });

  it("shows a checkmark and aria-selected=true when selected", async () => {
    const el = await fixture<LitMaterialSelectOption>(
      html`<lit-material-select-option value="s" selected>Small</lit-material-select-option>`,
    );
    expect(el.getAttribute("aria-selected")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".checkmark")).to.exist;
  });

  it("reflects disabled to aria-disabled", async () => {
    const el = await fixture<LitMaterialSelectOption>(
      html`<lit-material-select-option value="s" disabled>Small</lit-material-select-option>`,
    );
    expect(el.getAttribute("aria-disabled")).to.equal("true");
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialSelectOption>(
      html`<lit-material-select-option value="s">Small</lit-material-select-option>`,
    );
    const rect = el.getBoundingClientRect();
    el.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    const stateLayer = el.shadowRoot!.querySelector(".state-layer")!;
    expect(stateLayer.hasAttribute("data-pressed")).to.be.true;
  });

  it("passes axe accessibility checks within a role=listbox ancestor", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div role="listbox" aria-label="Size">
        <lit-material-select-option value="s">Small</lit-material-select-option>
      </div>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
