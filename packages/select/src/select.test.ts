import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
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
});
