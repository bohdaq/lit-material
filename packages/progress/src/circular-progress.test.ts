import { expect, fixture, html } from "@open-wc/testing";
import "./circular-progress.js";
import type { LitMaterialCircularProgress } from "./circular-progress.js";

describe("lit-material-circular-progress", () => {
  it("has role=progressbar with default determinate aria-value*", async () => {
    const el = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading"></lit-material-circular-progress>`,
    );
    expect(el.getAttribute("role")).to.equal("progressbar");
    expect(el.getAttribute("aria-valuenow")).to.equal("0");
    expect(el.getAttribute("aria-valuemin")).to.equal("0");
    expect(el.getAttribute("aria-valuemax")).to.equal("1");
  });

  it("renders an svg sized to the size property", async () => {
    const el = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading" size="64"></lit-material-circular-progress>`,
    );
    const svg = el.shadowRoot!.querySelector("svg")!;
    expect(svg.getAttribute("width")).to.equal("64");
    expect(svg.getAttribute("height")).to.equal("64");
  });

  it("reflects value onto aria-valuenow and the indicator's stroke-dashoffset", async () => {
    const zero = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading" value="0"></lit-material-circular-progress>`,
    );
    const full = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading" value="1"></lit-material-circular-progress>`,
    );
    const zeroIndicator = zero.shadowRoot!.querySelector(".indicator")!;
    const fullIndicator = full.shadowRoot!.querySelector(".indicator")!;
    const circumference = Number(zeroIndicator.getAttribute("stroke-dasharray"));

    expect(Number(zeroIndicator.getAttribute("stroke-dashoffset"))).to.be.closeTo(circumference, 0.01);
    expect(Number(fullIndicator.getAttribute("stroke-dashoffset"))).to.be.closeTo(0, 0.01);
  });

  it("clamps value to [0, max]", async () => {
    const el = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading" value="5"></lit-material-circular-progress>`,
    );
    expect(el.getAttribute("aria-valuenow")).to.equal("1");
  });

  it("omits aria-valuenow and applies the spin class when indeterminate", async () => {
    const el = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading" indeterminate></lit-material-circular-progress>`,
    );
    expect(el.hasAttribute("aria-valuenow")).to.be.false;
    expect(el.shadowRoot!.querySelector("svg")!.classList.contains("spin")).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialCircularProgress>(
      html`<lit-material-circular-progress aria-label="Loading" value="0.5"></lit-material-circular-progress>`,
    );
    await expect(el).to.be.accessible();
  });
});
