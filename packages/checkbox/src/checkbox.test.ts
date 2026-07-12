import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./checkbox.js";
import type { LitMaterialCheckbox } from "./checkbox.js";

describe("lit-material-checkbox", () => {
  it("renders a native checkbox input", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept"></lit-material-checkbox>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input).to.exist;
    expect(input.type).to.equal("checkbox");
  });

  it("defaults to unchecked", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept"></lit-material-checkbox>`,
    );
    expect(el.checked).to.be.false;
    expect(el.shadowRoot!.querySelector("input")!.checked).to.be.false;
  });

  it("reflects the checked property onto the inner input", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept" checked></lit-material-checkbox>`,
    );
    expect(el.checked).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.checked).to.be.true;
    expect(el.shadowRoot!.querySelector(".checkbox")!.classList.contains("checked")).to.be.true;
  });

  it("shows an indeterminate mark and clears it on the next click", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept" indeterminate></lit-material-checkbox>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input.indeterminate).to.be.true;
    expect(el.shadowRoot!.querySelector(".mark-indeterminate")).to.exist;

    input.click();
    await el.updateComplete;
    expect(el.indeterminate).to.be.false;
    expect(el.checked).to.be.true;
    expect(el.shadowRoot!.querySelector(".mark-indeterminate")).to.not.exist;
  });

  it("reflects the disabled property to the attribute and disables the inner input", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept" disabled></lit-material-checkbox>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("toggles checked and dispatches a change event on click", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept"></lit-material-checkbox>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    setTimeout(() => input.click());
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.checked).to.be.true;
  });

  it("does not toggle or dispatch a change event when disabled", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept" disabled></lit-material-checkbox>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    let changed = false;
    el.addEventListener("change", () => (changed = true));
    input.click();
    expect(changed).to.be.false;
    expect(el.checked).to.be.false;
  });

  it("is reachable and toggleable via keyboard (Tab + Space)", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept"></lit-material-checkbox>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("input"));
    setTimeout(() => sendKeys({ press: "Space" }));
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.checked).to.be.true;
  });

  it("participates in an ancestor form via FormData, defaulting to value \"on\"", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-checkbox name="tos" aria-label="Accept"></lit-material-checkbox>
      </form>
    `);
    const el = form.querySelector("lit-material-checkbox")! as LitMaterialCheckbox;
    expect(new FormData(form).get("tos")).to.equal(null);

    el.checked = true;
    await el.updateComplete;
    expect(new FormData(form).get("tos")).to.equal("on");
  });

  it("submits a custom value when checked", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-checkbox name="plan" value="pro" checked aria-label="Pro plan"></lit-material-checkbox>
      </form>
    `);
    const data = new FormData(form);
    expect(data.get("plan")).to.equal("pro");
  });

  it("resets to its default checked state when the form is reset", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-checkbox name="tos" checked aria-label="Accept"></lit-material-checkbox>
      </form>
    `);
    const el = form.querySelector("lit-material-checkbox")! as LitMaterialCheckbox;
    el.checked = false;
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it("is invalid when required and unchecked", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept" required></lit-material-checkbox>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.checked = true;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept terms"></lit-material-checkbox>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks in the error state", async () => {
    const el = await fixture<LitMaterialCheckbox>(
      html`<lit-material-checkbox aria-label="Accept terms" error required></lit-material-checkbox>`,
    );
    await expect(el).to.be.accessible();
  });
});
