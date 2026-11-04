import { expect, fixture, html } from "@open-wc/testing";
import { render } from "lit";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./select.js";
import "./select-option.js";
import type { LitMaterialSelect } from "./select.js";

async function selectFixture() {
  const el = await fixture<LitMaterialSelect>(html`
    <lit-material-select label="Size">
      <lit-material-select-option value="s">Small</lit-material-select-option>
      <lit-material-select-option value="m">Medium</lit-material-select-option>
      <lit-material-select-option value="l" disabled>Large (disabled)</lit-material-select-option>
      <lit-material-select-option value="xl">Extra large</lit-material-select-option>
    </lit-material-select>
  `);
  const trigger = el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement;
  return { el, trigger };
}

describe("lit-material-select", () => {
  it("renders a combobox trigger and a listbox, defaulting to closed with no value", async () => {
    const { el, trigger } = await selectFixture();
    expect(trigger).to.exist;
    expect(el.open).to.be.false;
    expect(el.value).to.equal("");
  });

  it("opens the listbox and highlights the first option when the trigger is clicked", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(document.activeElement).to.equal(el.querySelector('[value="s"]'));
    el.open = false;
  });

  it("selects an option on click, closes, dispatches change, and refocuses the trigger", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;

    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    const medium = el.querySelector('[value="m"]') as HTMLElement;
    medium.click();
    await el.updateComplete;

    expect(changeEvent).to.exist;
    expect(el.value).to.equal("m");
    expect(el.open).to.be.false;
    // document.activeElement reports the *host* (el), not an element inside
    // its shadow root, regardless of delegatesFocus — el.shadowRoot.activeElement
    // is what actually shows the focused inner button.
    expect(el.shadowRoot!.activeElement).to.equal(trigger);
  });

  it("shows the selected option's label as the displayed value", async () => {
    const { el } = await selectFixture();
    el.value = "m";
    await el.updateComplete;
    const valueEl = el.shadowRoot!.querySelector(".value")!;
    expect(valueEl.textContent).to.equal("Medium");
  });

  it("opens on ArrowDown from the closed trigger and highlights the current selection", async () => {
    const { el, trigger } = await selectFixture();
    el.value = "m";
    await el.updateComplete;
    trigger.focus();
    await sendKeys({ press: "ArrowDown" });
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(document.activeElement).to.equal(el.querySelector('[value="m"]'));
    el.open = false;
  });

  it("navigates and accepts options by keyboard inside another element's shadow root", async () => {
    const host = await fixture<HTMLDivElement>(html`<div></div>`);
    const root = host.attachShadow({ mode: "open" });
    render(
      html`<lit-material-select label="Size">
        <lit-material-select-option value="s">Small</lit-material-select-option>
        <lit-material-select-option value="m">Medium</lit-material-select-option>
      </lit-material-select>`,
      root,
    );
    const el = root.querySelector<LitMaterialSelect>("lit-material-select")!;
    await el.updateComplete;
    (el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement).focus();
    await sendKeys({ press: "ArrowDown" });
    await el.updateComplete;
    expect(el.open).to.be.true;
    // The options are focused in the shadow root the select sits in, not in the document.
    expect(root.activeElement).to.equal(el.querySelector('[value="s"]'));
    await sendKeys({ press: "ArrowDown" });
    expect(root.activeElement).to.equal(el.querySelector('[value="m"]'));
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.value).to.equal("m");
    expect(el.open).to.be.false;
  });

  it("moves the highlight with ArrowDown/ArrowUp without wrapping, and skips disabled options", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;
    expect(document.activeElement).to.equal(el.querySelector('[value="s"]'));

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(el.querySelector('[value="m"]'));

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(el.querySelector('[value="xl"]'));

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(el.querySelector('[value="xl"]'));

    await sendKeys({ press: "ArrowUp" });
    expect(document.activeElement).to.equal(el.querySelector('[value="m"]'));

    el.open = false;
  });

  it("jumps to the first/last option with Home/End", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;

    await sendKeys({ press: "End" });
    expect(document.activeElement).to.equal(el.querySelector('[value="xl"]'));

    await sendKeys({ press: "Home" });
    expect(document.activeElement).to.equal(el.querySelector('[value="s"]'));

    el.open = false;
  });

  it("accepts the highlighted option and refocuses the trigger on Enter", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Enter" });
    await el.updateComplete;

    expect(el.value).to.equal("m");
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(trigger);
  });

  it("closes without changing the value on Escape, and refocuses the trigger", async () => {
    const { el, trigger } = await selectFixture();
    el.value = "s";
    await el.updateComplete;
    trigger.click();
    await el.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Escape" });
    await el.updateComplete;

    expect(el.value).to.equal("s");
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(trigger);
  });

  it("accepts the highlighted option on Tab without refocusing the trigger", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Tab" });
    await el.updateComplete;
    expect(el.value).to.equal("m");
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.not.equal(trigger);
  });

  it("does not open when disabled", async () => {
    const el = await fixture<LitMaterialSelect>(html`
      <lit-material-select label="Size" disabled>
        <lit-material-select-option value="s">Small</lit-material-select-option>
      </lit-material-select>
    `);
    const trigger = el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement;
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-select name="size" label="Size">
          <lit-material-select-option value="s">Small</lit-material-select-option>
          <lit-material-select-option value="m">Medium</lit-material-select-option>
        </lit-material-select>
      </form>
    `);
    const el = form.querySelector("lit-material-select")! as LitMaterialSelect;
    expect(new FormData(form).get("size")).to.equal(null);
    el.value = "m";
    await el.updateComplete;
    expect(new FormData(form).get("size")).to.equal("m");
  });

  it("is invalid when required and nothing is selected", async () => {
    const el = await fixture<LitMaterialSelect>(html`
      <lit-material-select label="Size" required>
        <lit-material-select-option value="s">Small</lit-material-select-option>
      </lit-material-select>
    `);
    expect(el.checkValidity()).to.be.false;
    el.value = "s";
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await selectFixture();
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks while open", async () => {
    const { el, trigger } = await selectFixture();
    trigger.click();
    await el.updateComplete;
    await expect(el).to.be.accessible();
    el.open = false;
  });

  it("translates its validation message", async () => {
    registerTranslation({ $code: "x-select", "select.selectOption": "Choisissez une option." });
    const wrapper = await fixture<HTMLDivElement>(html`
      <div lang="x-select">
        <lit-material-select label="Size" required>
          <lit-material-select-option value="s">Small</lit-material-select-option>
        </lit-material-select>
      </div>
    `);
    const el = wrapper.querySelector<LitMaterialSelect>("lit-material-select")!;
    await el.updateComplete;
    const internals = (el as unknown as { internals: ElementInternals }).internals;
    expect(internals.validationMessage).to.equal("Choisissez une option.");
  });

  it("lines the listbox up with the trigger's right edge in RTL", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div dir="rtl" style="padding-inline-start: 200px;">
        <lit-material-select label="Size">
          <lit-material-select-option value="s">Small</lit-material-select-option>
          <lit-material-select-option value="m">A much longer option label than the trigger</lit-material-select-option>
        </lit-material-select>
      </div>
    `);
    const el = wrapper.querySelector<LitMaterialSelect>("lit-material-select")!;
    const trigger = el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement;
    trigger.click();
    await el.updateComplete;
    const listbox = el.shadowRoot!.querySelector(".listbox")!.getBoundingClientRect();
    expect(Math.abs(listbox.right - trigger.getBoundingClientRect().right)).to.be.lessThan(1);
    el.open = false;
    await el.updateComplete;
  });
});
