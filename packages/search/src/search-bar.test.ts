import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./search-bar.js";
import type { LitMaterialSearchBar } from "./search-bar.js";

describe("lit-material-search-bar", () => {
  it("defaults to an empty value and the 'Search' placeholder", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar></lit-material-search-bar>`);
    const input = el.shadowRoot!.querySelector("input")!;
    expect(el.value).to.equal("");
    expect(input.placeholder).to.equal("Search");
  });

  it("renders the default magnifying-glass icon when no leading-icon slot is provided", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar></lit-material-search-bar>`);
    expect(el.shadowRoot!.querySelector(".leading-icon svg")).to.exist;
  });

  it("does not render a clear button until value is non-empty", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar></lit-material-search-bar>`);
    expect(el.shadowRoot!.querySelector(".clear")).to.not.exist;

    el.value = "tea";
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".clear")).to.exist;
  });

  it("typing updates value and fires a bubbling input event", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar></lit-material-search-bar>`);
    let inputEvent: Event | undefined;
    el.addEventListener("input", (event) => (inputEvent = event));

    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    await sendKeys({ type: "tea" });
    await el.updateComplete;

    expect(el.value).to.equal("tea");
    expect(inputEvent).to.exist;
  });

  it("clicking the clear button empties value, focuses the input, and fires input", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar value="tea"></lit-material-search-bar>`);
    let inputEvent: Event | undefined;
    el.addEventListener("input", (event) => (inputEvent = event));

    el.shadowRoot!.querySelector<HTMLButtonElement>(".clear")!.click();
    await el.updateComplete;

    expect(el.value).to.equal("");
    expect(inputEvent).to.exist;
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("input"));
  });

  it("fires search on Enter", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar value="tea"></lit-material-search-bar>`);
    let searchEvent: Event | undefined;
    el.addEventListener("search", (event) => (searchEvent = event));

    el.shadowRoot!.querySelector("input")!.focus();
    await sendKeys({ press: "Enter" });
    await el.updateComplete;

    expect(searchEvent).to.exist;
  });

  it("reflects disabled to the attribute and disables the inner input", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar disabled></lit-material-search-bar>`);
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("focus() delegates to the inner input", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar></lit-material-search-bar>`);
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(el.shadowRoot!.querySelector("input"));
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSearchBar>(html`<lit-material-search-bar></lit-material-search-bar>`);
    await expect(el).to.be.accessible();
  });
});
