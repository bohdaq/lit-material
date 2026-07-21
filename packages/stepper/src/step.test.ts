import { expect, fixture, html } from "@open-wc/testing";
import "./step.js";
import type { LitMaterialStep } from "./step.js";

async function stepFixture() {
  const el = await fixture<LitMaterialStep>(html`
    <lit-material-step step-number="2">
      <span slot="label">Shipping</span>
      <span slot="description">Choose a method</span>
    </lit-material-step>
  `);
  const button = el.shadowRoot!.querySelector("button.step") as HTMLButtonElement;
  return { el, button };
}

describe("lit-material-step", () => {
  it("shows the step number in the circle by default", async () => {
    const { el } = await stepFixture();
    const circle = el.shadowRoot!.querySelector(".circle")!;
    expect(circle.textContent!.trim()).to.equal("2");
  });

  it("shows a checkmark instead of the number when completed", async () => {
    const { el } = await stepFixture();
    el.completed = true;
    await el.updateComplete;
    const circle = el.shadowRoot!.querySelector(".circle")!;
    expect(circle.querySelector("svg")).to.exist;
    expect(circle.textContent!.trim()).to.equal("");
  });

  it("shows an error indicator instead of the number when error, even if also completed", async () => {
    const { el } = await stepFixture();
    el.completed = true;
    el.error = true;
    await el.updateComplete;
    const circle = el.shadowRoot!.querySelector(".circle")!;
    expect(circle.querySelector("svg")).to.exist;
  });

  it("sets aria-current=step and tabindex=0 only when active", async () => {
    const { el, button } = await stepFixture();
    expect(button.getAttribute("aria-current")).to.be.null;
    expect(button.tabIndex).to.equal(-1);

    el.active = true;
    await el.updateComplete;
    expect(button.getAttribute("aria-current")).to.equal("step");
    expect(button.tabIndex).to.equal(0);
  });

  it("hides its connector when it's the last step (default, standalone)", async () => {
    const { el } = await stepFixture();
    const connector = el.shadowRoot!.querySelector(".connector")!;
    expect(getComputedStyle(connector).display).to.equal("none");
  });

  it("focus() delegates to the step button", async () => {
    const { el, button } = await stepFixture();
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(button);
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await stepFixture();
    await expect(el).to.be.accessible();
  });
});
