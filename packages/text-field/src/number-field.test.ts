import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./number-field.js";
import type { LitMaterialNumberField } from "./number-field.js";

const numberField = (template = html`<lit-material-number-field label="Replicas" value="2" min="1" max="5"></lit-material-number-field>`) =>
  fixture<LitMaterialNumberField>(template);
const button = (el: LitMaterialNumberField, which: "Decrease" | "Increase") =>
  el.shadowRoot!.querySelector<HTMLElement & { disabled: boolean }>(`[aria-label="${which} Replicas"]`)!;
const textField = (el: LitMaterialNumberField) =>
  el.shadowRoot!.querySelector("lit-material-text-field") as HTMLElement & { value: string; errorText: string };
const input = (el: LitMaterialNumberField) => textField(el).shadowRoot!.querySelector("input")!;

describe("lit-material-number-field", () => {
  it("steps with the buttons and fires change", async () => {
    const el = await numberField();
    const listener = oneEvent(el, "change");
    button(el, "Increase").click();
    await listener;
    expect(el.value).to.equal(3);
    button(el, "Decrease").click();
    button(el, "Decrease").click();
    await el.updateComplete;
    expect(el.value).to.equal(1);
    expect(button(el, "Decrease").disabled).to.be.true;
  });

  it("stops at max", async () => {
    const el = await numberField();
    el.stepBy(10);
    await el.updateComplete;
    expect(el.value).to.equal(5);
    expect(button(el, "Increase").disabled).to.be.true;
  });

  it("steps decimals without float drift", async () => {
    const el = await numberField(html`<lit-material-number-field label="Replicas" value="0.1" step="0.1"></lit-material-number-field>`);
    el.stepBy(2);
    expect(el.value).to.equal(0.3);
  });

  it("steps with the arrow keys", async () => {
    const el = await numberField();
    input(el).focus();
    await sendKeys({ press: "ArrowUp" });
    expect(el.value).to.equal(3);
    await sendKeys({ press: "PageUp" });
    expect(el.value).to.equal(5);
    await sendKeys({ press: "Home" });
    expect(el.value).to.equal(1);
  });

  it("takes typed numbers and fires input", async () => {
    const el = await numberField();
    input(el).focus();
    input(el).select();
    const listener = oneEvent(el, "input");
    await sendKeys({ type: "4" });
    await listener;
    expect(el.value).to.equal(4);
  });

  it("says what's wrong with the text", async () => {
    const el = await numberField();
    input(el).focus();
    input(el).select();
    await sendKeys({ type: "abc" });
    await el.updateComplete;
    expect(textField(el).errorText).to.equal("Enter a number");
    expect(el.checkValidity()).to.be.false;
    expect(el.value).to.equal(2);

    el.value = 9;
    await el.updateComplete;
    expect(textField(el).errorText).to.equal("At most 5");
  });

  it("is null when empty and steps from empty to min", async () => {
    const el = await numberField(html`<lit-material-number-field label="Replicas" min="1"></lit-material-number-field>`);
    expect(el.value).to.be.null;
    expect(el.checkValidity()).to.be.true;
    button(el, "Increase").click();
    expect(el.value).to.equal(1);
  });

  it("shows the unit in the field", async () => {
    const el = await numberField(html`<lit-material-number-field label="Disk" unit="GiB" value="20"></lit-material-number-field>`);
    expect(textField(el).getAttribute("suffix")).to.equal("GiB");
  });
});
