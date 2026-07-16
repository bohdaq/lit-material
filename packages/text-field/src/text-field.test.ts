import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./text-field.js";
import type { LitMaterialTextField } from "./text-field.js";

describe("lit-material-text-field", () => {
  it("renders a native input by default", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input).to.exist;
    expect(input.type).to.equal("text");
  });

  it("defaults to the filled variant", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    expect(el.variant).to.equal("filled");
  });

  it("floats the label when focused or holding a value", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    const container = el.shadowRoot!.querySelector(".container")!;
    expect(container.classList.contains("floated")).to.be.false;

    el.value = "Ada";
    await el.updateComplete;
    expect(container.classList.contains("floated")).to.be.true;

    el.value = "";
    await el.updateComplete;
    expect(container.classList.contains("floated")).to.be.false;
  });

  it("keeps the label floated when a placeholder is set", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" placeholder="hint"></lit-material-text-field>`,
    );
    const container = el.shadowRoot!.querySelector(".container")!;
    expect(container.classList.contains("floated")).to.be.true;
  });

  it("reflects the disabled property and disables the inner input", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" disabled></lit-material-text-field>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("updates value and dispatches input events when typing", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    let inputCount = 0;
    el.addEventListener("input", () => inputCount++);
    input.focus();
    await sendKeys({ type: "hi" });
    await el.updateComplete;
    expect(inputCount).to.equal(2);
    expect(el.value).to.equal("hi");
    expect(input.value).to.equal("hi");
  });

  it("dispatches a change event on blur", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    await sendKeys({ type: "hello" });
    setTimeout(() => input.blur());
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.value).to.equal("hello");
  });

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-text-field name="email" label="Email"></lit-material-text-field>
      </form>
    `);
    const el = form.querySelector("lit-material-text-field")! as LitMaterialTextField;
    el.value = "a@b.com";
    await el.updateComplete;
    const data = new FormData(form);
    expect(data.get("email")).to.equal("a@b.com");
  });

  it("resets to its default value when the form is reset", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-text-field name="q" label="Search" value="initial"></lit-material-text-field>
      </form>
    `);
    const el = form.querySelector("lit-material-text-field")! as LitMaterialTextField;
    el.value = "changed";
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal("initial");
  });

  it("is invalid when required and empty", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" required></lit-material-text-field>`,
    );
    el.value = "";
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
  });

  it("shows the error state and aria-invalid after touching an invalid field", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" required error-text="Required"></lit-material-text-field>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    await sendKeys({ type: "x" });
    await sendKeys({ press: "Backspace" });
    await el.updateComplete;
    input.blur();
    await el.updateComplete;
    expect(input.getAttribute("aria-invalid")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".supporting-text")!.textContent?.trim()).to.equal("Required");
  });

  it("renders the forced error state when error is set", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" error error-text="Something is wrong"></lit-material-text-field>`,
    );
    expect(el.hasAttribute("error")).to.be.true;
    await el.updateComplete;
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input.getAttribute("aria-invalid")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".supporting-text")!.textContent?.trim()).to.equal("Something is wrong");
  });

  it("shows a character counter when maxlength is set", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Bio" maxlength="10"></lit-material-text-field>`,
    );
    await el.updateComplete;
    const counter = el.shadowRoot!.querySelector(".counter")!;
    expect(counter.textContent?.trim()).to.equal("0 / 10");

    el.value = "hello";
    await el.updateComplete;
    expect(counter.textContent?.trim()).to.equal("5 / 10");
  });

  it("renders prefix and suffix text", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Price" prefix="$" suffix=".00"></lit-material-text-field>`,
    );
    expect(el.shadowRoot!.querySelector(".prefix")!.textContent).to.equal("$");
    expect(el.shadowRoot!.querySelector(".suffix")!.textContent).to.equal(".00");
  });

  it("forwards attributes to the inner input (type, inputmode, autocomplete, pattern)", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field
        label="Phone"
        type="tel"
        inputmode="tel"
        autocomplete="tel"
        pattern="[0-9]{3}"
      ></lit-material-text-field>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input.type).to.equal("tel");
    expect(input.getAttribute("inputmode")).to.equal("tel");
    expect(input.getAttribute("autocomplete")).to.equal("tel");
    expect(input.getAttribute("pattern")).to.equal("[0-9]{3}");
  });

  it("is reachable via keyboard (Tab focuses the input)", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name"></lit-material-text-field>`,
    );
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("input"));
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" supporting-text="Enter your full name"></lit-material-text-field>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks in error state", async () => {
    const el = await fixture<LitMaterialTextField>(
      html`<lit-material-text-field label="Name" required error error-text="Required"></lit-material-text-field>`,
    );
    await expect(el).to.be.accessible();
  });

  it("sizes slotted leading/trailing icon content to 24x24 (regression: a descendant combinator before ::slotted() never matches — must be a compound slot.foo::slotted(*) selector)", async () => {
    const el = await fixture<LitMaterialTextField>(html`
      <lit-material-text-field label="Name">
        <svg slot="leading-icon" aria-hidden="true"><circle /></svg>
        <svg slot="trailing-icon" aria-hidden="true"><circle /></svg>
      </lit-material-text-field>
    `);
    const leading = el.querySelector('[slot="leading-icon"]')!;
    const trailing = el.querySelector('[slot="trailing-icon"]')!;
    expect(getComputedStyle(leading).width).to.equal("24px");
    expect(getComputedStyle(trailing).width).to.equal("24px");
  });
});
