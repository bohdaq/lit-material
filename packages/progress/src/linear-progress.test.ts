import { expect, fixture, html } from "@open-wc/testing";
import "./linear-progress.js";
import type { LitMaterialLinearProgress } from "./linear-progress.js";

describe("lit-material-linear-progress", () => {
  it("has role=progressbar with default determinate aria-value*", async () => {
    const el = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress aria-label="Loading"></lit-material-linear-progress>`,
    );
    expect(el.getAttribute("role")).to.equal("progressbar");
    expect(el.getAttribute("aria-valuenow")).to.equal("0");
    expect(el.getAttribute("aria-valuemin")).to.equal("0");
    expect(el.getAttribute("aria-valuemax")).to.equal("1");
  });

  it("reflects value onto aria-valuenow and the indicator's width", async () => {
    const el = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress aria-label="Loading" value="0.25"></lit-material-linear-progress>`,
    );
    expect(el.getAttribute("aria-valuenow")).to.equal("0.25");
    const indicator = el.shadowRoot!.querySelector(".indicator") as HTMLElement;
    expect(indicator.style.width).to.equal("25%");
  });

  it("clamps value to [0, max]", async () => {
    const el = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress aria-label="Loading" value="5"></lit-material-linear-progress>`,
    );
    expect(el.getAttribute("aria-valuenow")).to.equal("1");
    const indicator = el.shadowRoot!.querySelector(".indicator") as HTMLElement;
    expect(indicator.style.width).to.equal("100%");
  });

  it("supports a custom max", async () => {
    const el = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress aria-label="Loading" value="50" max="200"></lit-material-linear-progress>`,
    );
    expect(el.getAttribute("aria-valuemax")).to.equal("200");
    expect(el.getAttribute("aria-valuenow")).to.equal("50");
    const indicator = el.shadowRoot!.querySelector(".indicator") as HTMLElement;
    expect(indicator.style.width).to.equal("25%");
  });

  it("mirrors the determinate fill under dir=\"rtl\" instead of a fixed physical side", async () => {
    const ltr = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress dir="ltr" aria-label="Loading" value="0.25"></lit-material-linear-progress>`,
    );
    const ltrHost = ltr.getBoundingClientRect();
    const ltrIndicator = ltr.shadowRoot!.querySelector(".indicator")!.getBoundingClientRect();
    expect(ltrIndicator.left).to.be.closeTo(ltrHost.left, 1); // fill grows from the left, in LTR
    expect(ltrIndicator.right).to.be.lessThan(ltrHost.right);

    const rtl = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress dir="rtl" aria-label="Loading" value="0.25"></lit-material-linear-progress>`,
    );
    const rtlHost = rtl.getBoundingClientRect();
    const rtlIndicator = rtl.shadowRoot!.querySelector(".indicator")!.getBoundingClientRect();
    expect(rtlIndicator.right).to.be.closeTo(rtlHost.right, 1); // mirrored: fill grows from the right, in RTL
    expect(rtlIndicator.left).to.be.greaterThan(rtlHost.left);
  });

  it("omits aria-valuenow and renders two sliding bars when indeterminate", async () => {
    const el = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress aria-label="Loading" indeterminate></lit-material-linear-progress>`,
    );
    expect(el.hasAttribute("aria-valuenow")).to.be.false;
    expect(el.shadowRoot!.querySelector(".indeterminate1")).to.exist;
    expect(el.shadowRoot!.querySelector(".indeterminate2")).to.exist;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialLinearProgress>(
      html`<lit-material-linear-progress aria-label="Loading" value="0.5"></lit-material-linear-progress>`,
    );
    await expect(el).to.be.accessible();
  });
});
