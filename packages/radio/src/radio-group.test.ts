import { expect, fixture, html } from "@open-wc/testing";
import "./radio.js";
import "./radio-group.js";
import type { LitMaterialRadioGroup } from "./radio-group.js";

describe("lit-material-radio-group", () => {
  it("is a labelled radiogroup", async () => {
    const el = await fixture<LitMaterialRadioGroup>(html`<lit-material-radio-group label="Plan">
      <lit-material-radio name="plan" value="free" aria-label="Free"></lit-material-radio>
      <lit-material-radio name="plan" value="team" aria-label="Team"></lit-material-radio>
    </lit-material-radio-group>`);
    expect(el.getAttribute("role")).to.equal("radiogroup");
    expect(el.getAttribute("aria-label")).to.equal("Plan");
    expect(el.shadowRoot!.querySelector(".label")!.textContent).to.equal("Plan");
    await expect(el).to.be.accessible();
  });
});
