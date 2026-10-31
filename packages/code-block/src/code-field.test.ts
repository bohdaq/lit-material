import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./code-field.js";
import { validateJson, type LitMaterialCodeField } from "./code-field.js";

const field = (value: string, language = "") =>
  fixture<LitMaterialCodeField>(
    html`<lit-material-code-field label="Config" language=${language} .value=${value}></lit-material-code-field>`,
  );
const area = (el: LitMaterialCodeField) => el.shadowRoot!.querySelector("textarea")!;

describe("lit-material-code-field", () => {
  it("shows the text with a line number per line", async () => {
    const el = await field("a: 1\nb: 2\nc: 3");
    expect(area(el).value).to.equal("a: 1\nb: 2\nc: 3");
    expect(el.shadowRoot!.querySelector(".gutter")!.textContent).to.equal("1\n2\n3");
  });

  it("is labelled and doesn't spell-check or wrap", async () => {
    const el = await field("");
    const textarea = area(el);
    expect(el.shadowRoot!.querySelector(`label[for="${textarea.id}"]`)!.textContent).to.equal("Config");
    expect(textarea.getAttribute("spellcheck")).to.equal("false");
    expect(textarea.getAttribute("wrap")).to.equal("off");
  });

  it("indents with Tab and outdents with Shift+Tab", async () => {
    const el = await field("a:\nb: 1");
    const textarea = area(el);
    textarea.focus();
    textarea.setSelectionRange(3, 3); // start of "b: 1"
    await sendKeys({ press: "Tab" });
    expect(el.value).to.equal("a:\n  b: 1");
    await sendKeys({ press: "Shift+Tab" });
    expect(el.value).to.equal("a:\nb: 1");
  });

  it("indents every selected line", async () => {
    const el = await field("a\nb\nc");
    const textarea = area(el);
    textarea.focus();
    textarea.setSelectionRange(0, 3); // "a\nb"
    await sendKeys({ press: "Tab" });
    expect(el.value).to.equal("  a\n  b\nc");
  });

  it("keeps the line's indentation on Enter", async () => {
    const el = await field("spec:\n  replicas: 1");
    const textarea = area(el);
    textarea.focus();
    textarea.setSelectionRange(el.value.length, el.value.length);
    await sendKeys({ press: "Enter" });
    expect(el.value).to.equal("spec:\n  replicas: 1\n  ");
  });

  it("lets Tab leave after Escape", async () => {
    const el = await field("x");
    area(el).focus();
    await sendKeys({ press: "Escape" });
    await sendKeys({ press: "Tab" });
    expect(el.value).to.equal("x");
    expect(el.shadowRoot!.activeElement).to.not.equal(area(el));
  });

  it("fires input on typing", async () => {
    const el = await field("");
    area(el).focus();
    const listener = oneEvent(el, "input");
    await sendKeys({ type: "{" });
    await listener;
    expect(el.value).to.equal("{");
  });

  it("validates JSON and shows the error line", async () => {
    const el = await field('{\n  "a": 1,\n}', "json");
    expect(el.invalid).to.be.true;
    expect(el.hasAttribute("invalid")).to.be.true;
    const error = el.shadowRoot!.querySelector(".error")!;
    expect(error.textContent).to.match(/^Line 3/);
    expect(area(el).getAttribute("aria-invalid")).to.equal("true");
    expect(area(el).getAttribute("aria-describedby")).to.equal(error.id);
    el.value = '{ "a": 1 }';
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
    expect(el.shadowRoot!.querySelector(".error")).to.be.null;
  });

  it("uses a custom validator", async () => {
    const el = await field("kind: Pod");
    el.validator = (text) => (text.includes("apiVersion") ? "" : "apiVersion is required");
    await el.updateComplete;
    expect(el.validationMessage).to.equal("apiVersion is required");
  });
});

describe("validateJson", () => {
  it("accepts JSON and empty text", () => {
    expect(validateJson('{"a":[1,2]}')).to.equal("");
    expect(validateJson("  ")).to.equal("");
  });

  it("names the line", () => {
    expect(validateJson('{\n"a": }')).to.match(/^Line 2: /);
  });
});
