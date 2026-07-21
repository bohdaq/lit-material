import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./stepper.js";
import "./step.js";
import type { LitMaterialStepper } from "./stepper.js";
import type { LitMaterialStep } from "./step.js";

async function stepperFixture(opts: { linear?: boolean; orientation?: "horizontal" | "vertical" } = {}) {
  const el = await fixture<LitMaterialStepper>(html`
    <lit-material-stepper ?linear=${opts.linear ?? false} orientation=${opts.orientation ?? "horizontal"}>
      <lit-material-step><span slot="label">Account</span></lit-material-step>
      <lit-material-step><span slot="label">Shipping</span></lit-material-step>
      <lit-material-step disabled><span slot="label">Unavailable</span></lit-material-step>
      <lit-material-step><span slot="label">Payment</span></lit-material-step>
    </lit-material-stepper>
  `);
  const steps = Array.from(el.querySelectorAll("lit-material-step")) as LitMaterialStep[];
  return { el, steps };
}

function buttonOf(step: LitMaterialStep): HTMLButtonElement {
  return step.shadowRoot!.querySelector("button.step") as HTMLButtonElement;
}

describe("lit-material-stepper", () => {
  it("marks the step at `selected` active and numbers steps 1-based", async () => {
    const { steps } = await stepperFixture();
    expect(steps[0]!.active).to.be.true;
    expect(steps[1]!.active).to.be.false;
    expect(steps.map((s) => s.stepNumber)).to.deep.equal([1, 2, 3, 4]);
  });

  it("selects a step on click, focuses it, and dispatches change", async () => {
    const { el, steps } = await stepperFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    buttonOf(steps[1]!).click();
    await el.updateComplete;

    expect(changeEvent).to.exist;
    expect(el.selected).to.equal(1);
    expect(steps[1]!.active).to.be.true;
    expect(steps[0]!.active).to.be.false;
    expect(el.shadowRoot!.activeElement).to.not.exist; // focus moved to the step, not inside the stepper's own shadow root
  });

  it("does not dispatch change when clicking the already-selected step", async () => {
    const { el, steps } = await stepperFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    buttonOf(steps[0]!).click();
    await el.updateComplete;
    expect(changeEvent).to.not.exist;
  });

  it("does not select a disabled step", async () => {
    const { el, steps } = await stepperFixture();
    buttonOf(steps[2]!).click();
    await el.updateComplete;
    expect(el.selected).to.equal(0);
  });

  it("in linear mode, blocks jumping ahead past an incomplete step, but always allows going back", async () => {
    const { el, steps } = await stepperFixture({ linear: true });
    // steps[2] is disabled (skip it); try to jump to steps[3] without completing steps[0]/[1].
    buttonOf(steps[3]!).click();
    await el.updateComplete;
    expect(el.selected).to.equal(0);

    steps[0]!.completed = true;
    steps[1]!.completed = true;
    await el.updateComplete;
    buttonOf(steps[3]!).click();
    await el.updateComplete;
    expect(el.selected).to.equal(3);

    // Going back to an earlier step is always allowed, completed or not.
    buttonOf(steps[0]!).click();
    await el.updateComplete;
    expect(el.selected).to.equal(0);
  });

  it("allows free jumping when not linear, even to a step after an incomplete one", async () => {
    const { el, steps } = await stepperFixture();
    buttonOf(steps[3]!).click();
    await el.updateComplete;
    expect(el.selected).to.equal(3);
  });

  it("moves focus with ArrowRight/ArrowLeft in horizontal orientation, skipping disabled, wrapping", async () => {
    const { steps } = await stepperFixture();
    buttonOf(steps[0]!).focus();
    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(steps[1]);

    // steps[2] is disabled — skips straight to steps[3].
    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(steps[3]);

    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(steps[0]);

    await sendKeys({ press: "ArrowLeft" });
    expect(document.activeElement).to.equal(steps[3]);
  });

  it("moves focus with ArrowDown/ArrowUp in vertical orientation instead", async () => {
    const { steps } = await stepperFixture({ orientation: "vertical" });
    buttonOf(steps[0]!).focus();
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(steps[1]);
    await sendKeys({ press: "ArrowUp" });
    expect(document.activeElement).to.equal(steps[0]);
  });

  it("jumps to the first/last enabled step with Home/End", async () => {
    const { steps } = await stepperFixture();
    buttonOf(steps[1]!).focus();
    await sendKeys({ press: "Home" });
    expect(document.activeElement).to.equal(steps[0]);
    await sendKeys({ press: "End" });
    expect(document.activeElement).to.equal(steps[3]);
  });

  it("propagates orientation to every step", async () => {
    const { steps } = await stepperFixture({ orientation: "vertical" });
    expect(steps.every((s) => s.orientation === "vertical")).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await stepperFixture();
    await expect(el).to.be.accessible();
  });
});
