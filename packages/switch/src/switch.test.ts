import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./switch.js";
import type { LitMaterialSwitch } from "./switch.js";

describe("lit-material-switch", () => {
  it("renders a native checkbox input with role=switch", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi"></lit-material-switch>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input).to.exist;
    expect(input.type).to.equal("checkbox");
    expect(input.getAttribute("role")).to.equal("switch");
  });

  it("defaults to unchecked", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi"></lit-material-switch>`,
    );
    expect(el.checked).to.be.false;
    expect(el.shadowRoot!.querySelector("input")!.checked).to.be.false;
  });

  it("reflects the checked property onto the inner input", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi" checked></lit-material-switch>`,
    );
    expect(el.checked).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.checked).to.be.true;
    expect(el.shadowRoot!.querySelector(".switch")!.classList.contains("checked")).to.be.true;
  });

  it("reflects the disabled property to the attribute and disables the inner input", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi" disabled></lit-material-switch>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("toggles checked and dispatches a change event on click", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi"></lit-material-switch>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    setTimeout(() => input.click());
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.checked).to.be.true;

    setTimeout(() => input.click());
    const event2 = await oneEvent(el, "change");
    expect(event2).to.exist;
    expect(el.checked).to.be.false;
  });

  it("does not toggle or dispatch a change event when disabled", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi" disabled></lit-material-switch>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    let changed = false;
    el.addEventListener("change", () => (changed = true));
    input.click();
    expect(changed).to.be.false;
    expect(el.checked).to.be.false;
  });

  it("is reachable and toggleable via keyboard (Tab + Space)", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi"></lit-material-switch>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("input"));
    setTimeout(() => sendKeys({ press: "Space" }));
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.checked).to.be.true;
  });

  it("shows the icon slot when unselected and selected-icon slot when selected", async () => {
    const el = await fixture<LitMaterialSwitch>(html`
      <lit-material-switch aria-label="Wi-Fi">
        <span slot="icon">off</span>
        <span slot="selected-icon">on</span>
      </lit-material-switch>
    `);
    expect(el.shadowRoot!.querySelector('slot[name="icon"]')).to.exist;
    expect(el.shadowRoot!.querySelector('slot[name="selected-icon"]')).to.not.exist;

    el.checked = true;
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector('slot[name="selected-icon"]')).to.exist;
    expect(el.shadowRoot!.querySelector('slot[name="icon"]')).to.not.exist;
  });

  it("participates in an ancestor form via FormData, defaulting to value \"on\"", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-switch name="wifi" aria-label="Wi-Fi"></lit-material-switch>
      </form>
    `);
    const el = form.querySelector("lit-material-switch")! as LitMaterialSwitch;
    expect(new FormData(form).get("wifi")).to.equal(null);

    el.checked = true;
    await el.updateComplete;
    expect(new FormData(form).get("wifi")).to.equal("on");
  });

  it("resets to its default checked state when the form is reset", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-switch name="wifi" checked aria-label="Wi-Fi"></lit-material-switch>
      </form>
    `);
    const el = form.querySelector("lit-material-switch")! as LitMaterialSwitch;
    el.checked = false;
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.checked).to.be.true;
  });

  it("is invalid when required and unchecked", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Wi-Fi" required></lit-material-switch>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.checked = true;
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Enable Wi-Fi"></lit-material-switch>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks in the error state", async () => {
    const el = await fixture<LitMaterialSwitch>(
      html`<lit-material-switch aria-label="Enable Wi-Fi" error required></lit-material-switch>`,
    );
    await expect(el).to.be.accessible();
  });
});
