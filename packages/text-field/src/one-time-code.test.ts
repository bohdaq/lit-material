import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./one-time-code.js";
import type { LitMaterialOneTimeCode } from "./one-time-code.js";

const code = (template = html`<lit-material-one-time-code label="Code from the mail"></lit-material-one-time-code>`) =>
  fixture<LitMaterialOneTimeCode>(template);
const input = (el: LitMaterialOneTimeCode) => el.shadowRoot!.querySelector("input")!;
const cells = (el: LitMaterialOneTimeCode) => [...el.shadowRoot!.querySelectorAll(".cell")].map((c) => c.textContent);

describe("lit-material-one-time-code", () => {
  it("shows one box per character and fills them as typed", async () => {
    const el = await code();
    expect(cells(el)).to.have.length(6);
    input(el).focus();
    await sendKeys({ type: "12a3" });
    await el.updateComplete;
    expect(el.value).to.equal("123");
    expect(cells(el).slice(0, 4)).to.deep.equal(["1", "2", "3", ""]);
  });

  it("fires complete with the value once the last digit is in", async () => {
    const el = await code();
    input(el).focus();
    const done = oneEvent(el, "complete");
    await sendKeys({ type: "482916" });
    expect((await done).detail.value).to.equal("482916");
  });

  it("drops spaces and dashes from a pasted code and stops at length", async () => {
    const el = await code();
    const field = input(el);
    field.value = "123-456 789";
    field.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.value).to.equal("123456");
    expect(field.value).to.equal("123456");
  });

  it("takes letters, upper-cased, when alphanumeric", async () => {
    const el = await code(html`<lit-material-one-time-code alphanumeric length="4"></lit-material-one-time-code>`);
    input(el).focus();
    await sendKeys({ type: "ab-9z" });
    expect(el.value).to.equal("AB9Z");
  });

  it("is named for screen readers and asks phones for the mailed code", async () => {
    const el = await code();
    const field = input(el);
    expect(field.getAttribute("autocomplete")).to.equal("one-time-code");
    expect(field.getAttribute("inputmode")).to.equal("numeric");
    expect(el.shadowRoot!.querySelector(".cells")!.getAttribute("aria-hidden")).to.equal("true");
    await expect(el).to.be.accessible();
  });

  it("submits under its name and keeps the form invalid until complete", async () => {
    const form = await fixture<HTMLFormElement>(html`<form>
      <lit-material-one-time-code name="code" required length="4"></lit-material-one-time-code>
    </form>`);
    const el = form.querySelector("lit-material-one-time-code")!;
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    el.value = "12";
    await el.updateComplete;
    expect(form.checkValidity()).to.be.false;
    el.value = "1234";
    await el.updateComplete;
    expect(form.checkValidity()).to.be.true;
    expect(new FormData(form).get("code")).to.equal("1234");
  });

  it("submits the form on Enter", async () => {
    const form = await fixture<HTMLFormElement>(html`<form><lit-material-one-time-code length="2" value="12"></lit-material-one-time-code></form>`);
    let submitted = 0;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      submitted++;
    });
    const el = form.querySelector("lit-material-one-time-code")!;
    await el.updateComplete;
    input(el).focus();
    await sendKeys({ press: "Enter" });
    expect(submitted).to.equal(1);
  });

  it("clear() empties it and shows the error text when error is set", async () => {
    const el = await code(html`<lit-material-one-time-code value="123456" error error-text="That code didn't work"></lit-material-one-time-code>`);
    expect(el.shadowRoot!.querySelector(".supporting")!.textContent).to.equal("That code didn't work");
    el.clear();
    await el.updateComplete;
    expect(el.value).to.equal("");
    expect(input(el).value).to.equal("");
  });
});
