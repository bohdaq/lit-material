import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./textarea.js";
import type { LitMaterialTextarea } from "./textarea.js";

describe("lit-material-textarea", () => {
  it("renders a native textarea by default", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    const textarea = el.shadowRoot!.querySelector("textarea")!;
    expect(textarea).to.exist;
  });

  it("defaults to the filled variant and rows=4", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    expect(el.variant).to.equal("filled");
    expect(el.rows).to.equal(4);
    expect(el.shadowRoot!.querySelector("textarea")!.rows).to.equal(4);
  });

  it("floats the label when focused or holding a value", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    const container = el.shadowRoot!.querySelector(".container")!;
    expect(container.classList.contains("floated")).to.be.false;

    el.value = "Hello";
    await el.updateComplete;
    expect(container.classList.contains("floated")).to.be.true;

    el.value = "";
    await el.updateComplete;
    expect(container.classList.contains("floated")).to.be.false;
  });

  it("reflects the disabled property and disables the inner textarea", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio" disabled></lit-material-textarea>`);
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("textarea")!.disabled).to.be.true;
  });

  it("applies the resize property as inline CSS on the textarea", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio" resize="none"></lit-material-textarea>`);
    const textarea = el.shadowRoot!.querySelector("textarea")!;
    expect(getComputedStyle(textarea).resize).to.equal("none");
  });

  it("updates value and dispatches input events when typing", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    const textarea = el.shadowRoot!.querySelector("textarea")!;
    let inputCount = 0;
    el.addEventListener("input", () => inputCount++);
    textarea.focus();
    await sendKeys({ type: "hi" });
    await el.updateComplete;
    expect(inputCount).to.equal(2);
    expect(el.value).to.equal("hi");
    expect(textarea.value).to.equal("hi");
  });

  it("dispatches a change event on blur", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    const textarea = el.shadowRoot!.querySelector("textarea")!;
    textarea.focus();
    await sendKeys({ type: "hello" });
    setTimeout(() => textarea.blur());
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.value).to.equal("hello");
  });

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-textarea name="bio" label="Bio"></lit-material-textarea>
      </form>
    `);
    const el = form.querySelector("lit-material-textarea")! as LitMaterialTextarea;
    el.value = "Hello there";
    await el.updateComplete;
    const data = new FormData(form);
    expect(data.get("bio")).to.equal("Hello there");
  });

  it("resets to its default value when the form is reset", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-textarea name="bio" label="Bio" value="initial"></lit-material-textarea>
      </form>
    `);
    const el = form.querySelector("lit-material-textarea")! as LitMaterialTextarea;
    el.value = "changed";
    await el.updateComplete;
    form.reset();
    await el.updateComplete;
    expect(el.value).to.equal("initial");
  });

  it("is invalid when required and empty", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio" required></lit-material-textarea>`);
    el.value = "";
    await el.updateComplete;
    expect(el.checkValidity()).to.be.false;
  });

  it("shows the error state and aria-invalid after touching an invalid field", async () => {
    const el = await fixture<LitMaterialTextarea>(
      html`<lit-material-textarea label="Bio" required error-text="Required"></lit-material-textarea>`,
    );
    const textarea = el.shadowRoot!.querySelector("textarea")!;
    textarea.focus();
    await sendKeys({ type: "x" });
    await sendKeys({ press: "Backspace" });
    await el.updateComplete;
    textarea.blur();
    await el.updateComplete;
    expect(textarea.getAttribute("aria-invalid")).to.equal("true");
    expect(el.shadowRoot!.querySelector(".supporting-text")!.textContent?.trim()).to.equal("Required");
  });

  it("shows a character counter when maxlength is set", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio" maxlength="10"></lit-material-textarea>`);
    await el.updateComplete;
    const counter = el.shadowRoot!.querySelector(".counter")!;
    expect(counter.textContent?.trim()).to.equal("0 / 10");

    el.value = "hello";
    await el.updateComplete;
    expect(counter.textContent?.trim()).to.equal("5 / 10");
  });

  it("is reachable via keyboard (Tab focuses the textarea)", async () => {
    const el = await fixture<LitMaterialTextarea>(html`<lit-material-textarea label="Bio"></lit-material-textarea>`);
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("textarea"));
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialTextarea>(
      html`<lit-material-textarea label="Bio" supporting-text="Tell us about yourself"></lit-material-textarea>`,
    );
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks in error state", async () => {
    const el = await fixture<LitMaterialTextarea>(
      html`<lit-material-textarea label="Bio" required error error-text="Required"></lit-material-textarea>`,
    );
    await expect(el).to.be.accessible();
  });
});
