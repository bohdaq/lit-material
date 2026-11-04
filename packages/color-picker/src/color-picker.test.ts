import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./color-picker.js";
import type { LitMaterialColorPicker } from "./color-picker.js";

async function colorPickerFixture() {
  const el = await fixture<LitMaterialColorPicker>(
    html`<lit-material-color-picker label="Accent" .presets=${["#ff0000", "#00ff00", "#0000ff"]}></lit-material-color-picker>`,
  );
  const trigger = el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement;
  return { el, trigger };
}

describe("lit-material-color-picker", () => {
  it("renders a trigger, defaulting to closed with no value", async () => {
    const { el, trigger } = await colorPickerFixture();
    expect(trigger).to.exist;
    expect(el.open).to.be.false;
    expect(el.value).to.equal("");
  });

  it("opens the panel and highlights the first preset when the trigger is clicked", async () => {
    const { el, trigger } = await colorPickerFixture();
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    const first = el.shadowRoot!.querySelectorAll(".preset")[0];
    expect(el.shadowRoot!.activeElement).to.equal(first);
    el.open = false;
  });

  it("selects a preset on click, closes, dispatches change, and refocuses the trigger", async () => {
    const { el, trigger } = await colorPickerFixture();
    trigger.click();
    await el.updateComplete;

    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    const green = el.shadowRoot!.querySelectorAll(".preset")[1] as HTMLElement;
    green.click();
    await el.updateComplete;

    expect(changeEvent).to.exist;
    expect(el.value).to.equal("#00ff00");
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(trigger);
  });

  it("moves the preset highlight with arrow keys without wrapping", async () => {
    const { el, trigger } = await colorPickerFixture();
    trigger.click();
    await el.updateComplete;
    const presets = el.shadowRoot!.querySelectorAll(".preset");

    await sendKeys({ press: "ArrowRight" });
    expect(el.shadowRoot!.activeElement).to.equal(presets[1]);

    await sendKeys({ press: "ArrowRight" });
    expect(el.shadowRoot!.activeElement).to.equal(presets[2]);

    await sendKeys({ press: "ArrowRight" });
    expect(el.shadowRoot!.activeElement).to.equal(presets[2]);

    await sendKeys({ press: "ArrowLeft" });
    expect(el.shadowRoot!.activeElement).to.equal(presets[1]);

    el.open = false;
  });

  it("closes on Escape and refocuses the trigger without changing the value", async () => {
    const { el, trigger } = await colorPickerFixture();
    trigger.click();
    await el.updateComplete;
    await sendKeys({ press: "ArrowRight" });
    await sendKeys({ press: "Escape" });
    await el.updateComplete;

    expect(el.value).to.equal("");
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(trigger);
  });

  it("commits a valid hex value typed into the text input on change", async () => {
    const { el } = await colorPickerFixture();
    el.open = true;
    await el.updateComplete;
    const hexInput = el.shadowRoot!.querySelector(".hex-input") as HTMLInputElement;

    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    hexInput.value = "#abcdef";
    hexInput.dispatchEvent(new Event("input"));
    hexInput.dispatchEvent(new Event("change"));
    await el.updateComplete;

    expect(changeEvent).to.exist;
    expect(el.value).to.equal("#abcdef");
  });

  it("reverts an invalid hex draft back to the last committed value on blur", async () => {
    const { el } = await colorPickerFixture();
    el.value = "#112233";
    el.open = true;
    await el.updateComplete;
    const hexInput = el.shadowRoot!.querySelector(".hex-input") as HTMLInputElement;

    hexInput.value = "not-a-color";
    hexInput.dispatchEvent(new Event("input"));
    await el.updateComplete;
    hexInput.dispatchEvent(new Event("blur"));
    await el.updateComplete;

    expect(el.value).to.equal("#112233");
    expect(hexInput.value).to.equal("#112233");
  });

  it("does not open when disabled", async () => {
    const el = await fixture<LitMaterialColorPicker>(
      html`<lit-material-color-picker label="Accent" disabled></lit-material-color-picker>`,
    );
    const trigger = el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement;
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-color-picker name="accent" label="Accent"></lit-material-color-picker>
      </form>
    `);
    const el = form.querySelector("lit-material-color-picker")! as LitMaterialColorPicker;
    expect(new FormData(form).get("accent")).to.equal(null);
    el.value = "#654321";
    await el.updateComplete;
    expect(new FormData(form).get("accent")).to.equal("#654321");
  });

  it("is invalid when required and nothing is chosen", async () => {
    const el = await fixture<LitMaterialColorPicker>(
      html`<lit-material-color-picker label="Accent" required></lit-material-color-picker>`,
    );
    expect(el.checkValidity()).to.be.false;
    el.value = "#654321";
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await colorPickerFixture();
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks while open", async () => {
    const { el, trigger } = await colorPickerFixture();
    trigger.click();
    await el.updateComplete;
    await expect(el).to.be.accessible();
    el.open = false;
  });

  it("translates its accessible names and validation message for the element's language", async () => {
    registerTranslation({
      $code: "x-color-picker",
      "colorPicker.dialogLabel": "Sélecteur de couleur",
      "colorPicker.presets": "Préréglages",
      "colorPicker.customColor": "Couleur personnalisée",
      "colorPicker.hexValue": "Valeur hexadécimale",
      "colorPicker.valueMissing": "Choisissez une couleur.",
    });
    const wrap = await fixture<HTMLDivElement>(html`<div lang="x-color-picker"><lit-material-color-picker required></lit-material-color-picker></div>`);
    const el = wrap.querySelector<LitMaterialColorPicker>("lit-material-color-picker")!;
    await el.updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector(".panel")!.getAttribute("aria-label")).to.equal("Sélecteur de couleur");
    expect(root.querySelector(".presets")!.getAttribute("aria-label")).to.equal("Préréglages");
    expect(root.querySelector(".custom-input")!.getAttribute("aria-label")).to.equal("Couleur personnalisée");
    expect(root.querySelector(".hex-input")!.getAttribute("aria-label")).to.equal("Valeur hexadécimale");
    expect(el.checkValidity()).to.be.false;
    expect((el as unknown as { internals: ElementInternals }).internals.validationMessage).to.equal("Choisissez une couleur.");
  });

  it("swaps ArrowLeft/ArrowRight among presets in right-to-left layouts, and opens at the trigger's right edge", async () => {
    const wrap = await fixture<HTMLDivElement>(html`
      <div dir="rtl" style="display: flex; justify-content: center">
        <lit-material-color-picker label="Accent" .presets=${["#ff0000", "#00ff00", "#0000ff"]}></lit-material-color-picker>
      </div>
    `);
    const el = wrap.querySelector<LitMaterialColorPicker>("lit-material-color-picker")!;
    const trigger = el.shadowRoot!.querySelector("button.trigger") as HTMLButtonElement;
    trigger.click();
    await el.updateComplete;
    const presets = el.shadowRoot!.querySelectorAll(".preset");
    expect(el.shadowRoot!.activeElement).to.equal(presets[0]);
    await sendKeys({ press: "ArrowLeft" });
    expect(el.shadowRoot!.activeElement).to.equal(presets[1]);
    await sendKeys({ press: "ArrowRight" });
    expect(el.shadowRoot!.activeElement).to.equal(presets[0]);

    const panel = el.shadowRoot!.querySelector<HTMLElement>(".panel")!;
    const triggerRight = trigger.getBoundingClientRect().right;
    const panelRect = panel.getBoundingClientRect();
    if (triggerRight - panelRect.width >= 0) expect(panelRect.right).to.be.closeTo(triggerRight, 1);
    el.open = false;
  });
});
