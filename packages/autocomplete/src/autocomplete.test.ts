import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./autocomplete.js";
import type { LitMaterialAutocomplete } from "./autocomplete.js";

const fruitOptions = [
  { label: "Apple", value: "apple" },
  { label: "Apricot", value: "apricot" },
  { label: "Banana", value: "banana" },
  { label: "Blueberry", value: "blueberry", disabled: true },
  { label: "Cherry", value: "cherry" },
];

async function autocompleteFixture(freeText = false) {
  const el = await fixture<LitMaterialAutocomplete>(html`
    <lit-material-autocomplete label="Fruit" .options=${fruitOptions} ?free-text=${freeText}></lit-material-autocomplete>
  `);
  const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
  return { el, input };
}

function activeOption(el: LitMaterialAutocomplete): Element | null {
  const id = el.shadowRoot!.querySelector("input")!.getAttribute("aria-activedescendant");
  return id ? el.shadowRoot!.querySelector(`#${id}`) : null;
}

describe("lit-material-autocomplete", () => {
  it("renders an input and a closed, empty-value popover by default", async () => {
    const { el, input } = await autocompleteFixture();
    expect(input).to.exist;
    expect(el.open).to.be.false;
    expect(el.value).to.equal("");
    expect(input.value).to.equal("");
  });

  it("shows the selected option's label as the input value", async () => {
    const { el, input } = await autocompleteFixture();
    el.value = "banana";
    await el.updateComplete;
    expect(input.value).to.equal("Banana");
  });

  it("opens the popover with the full option list on focus", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await el.updateComplete;
    expect(el.open).to.be.true;
    const rendered = el.shadowRoot!.querySelectorAll(".option");
    expect(rendered.length).to.equal(fruitOptions.length);
  });

  it("filters options as the user types", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ type: "ap" });
    await el.updateComplete;
    const rendered = Array.from(el.shadowRoot!.querySelectorAll(".option")).map((o) => o.textContent!.trim());
    expect(rendered).to.deep.equal(["Apple", "Apricot"]);
  });

  it("shows a 'No results' message when nothing matches", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ type: "zzz" });
    await el.updateComplete;
    expect(el.shadowRoot!.querySelectorAll(".option").length).to.equal(0);
    expect(el.shadowRoot!.querySelector(".empty")).to.exist;
  });

  it("selects an option on click, closes, and dispatches change", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await el.updateComplete;

    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    const cherry = Array.from(el.shadowRoot!.querySelectorAll(".option")).find(
      (o) => o.textContent!.trim() === "Cherry",
    ) as HTMLElement;
    cherry.click();
    await el.updateComplete;

    expect(changeEvent).to.exist;
    expect(el.value).to.equal("cherry");
    expect(el.open).to.be.false;
    expect(input.value).to.equal("Cherry");
    // Clicking a plain (non-focusable) option div must not steal focus from the input.
    expect(el.shadowRoot!.activeElement).to.equal(input);
  });

  it("does not select a disabled option on click", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await el.updateComplete;
    const blueberry = Array.from(el.shadowRoot!.querySelectorAll(".option")).find(
      (o) => o.textContent!.trim() === "Blueberry",
    ) as HTMLElement;
    blueberry.click();
    await el.updateComplete;
    expect(el.value).to.equal("");
  });

  it("moves the highlight with ArrowDown/ArrowUp, skipping disabled options, without wrapping", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ press: "ArrowDown" });
    await el.updateComplete;
    expect(activeOption(el)!.textContent!.trim()).to.equal("Apple");

    await sendKeys({ press: "ArrowDown" });
    expect(activeOption(el)!.textContent!.trim()).to.equal("Apricot");

    await sendKeys({ press: "ArrowDown" });
    expect(activeOption(el)!.textContent!.trim()).to.equal("Banana");

    // Blueberry is disabled — Cherry should be next, not Blueberry.
    await sendKeys({ press: "ArrowDown" });
    expect(activeOption(el)!.textContent!.trim()).to.equal("Cherry");

    await sendKeys({ press: "ArrowDown" });
    expect(activeOption(el)!.textContent!.trim()).to.equal("Cherry");
  });

  it("commits the highlighted option on Enter", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.value).to.equal("apple");
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(input);
  });

  it("closes without changing the value on Escape", async () => {
    const { el, input } = await autocompleteFixture();
    el.value = "apple";
    await el.updateComplete;
    input.focus();
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Escape" });
    await el.updateComplete;
    expect(el.value).to.equal("apple");
    expect(el.open).to.be.false;
  });

  it("reverts to the last committed value when blurring with unmatched text and free-text is off", async () => {
    const { el, input } = await autocompleteFixture();
    el.value = "apple";
    await el.updateComplete;
    input.focus();
    await sendKeys({ type: "xyz not a fruit" });
    input.blur();
    await el.updateComplete;
    expect(el.value).to.equal("apple");
    expect(input.value).to.equal("Apple");
  });

  it("commits typed text as-is on blur when free-text is set", async () => {
    const { el, input } = await autocompleteFixture(true);
    input.focus();
    await sendKeys({ type: "Dragonfruit" });
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    input.blur();
    await el.updateComplete;
    expect(changeEvent).to.exist;
    expect(el.value).to.equal("Dragonfruit");
  });

  it("commits an exact (case-insensitive) label match on blur even without free-text", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ type: "banana" });
    input.blur();
    await el.updateComplete;
    expect(el.value).to.equal("banana");
    expect(input.value).to.equal("Banana");
  });

  it("clears the value when blurring with empty input", async () => {
    const { el, input } = await autocompleteFixture();
    el.value = "apple";
    await el.updateComplete;
    input.focus();
    await sendKeys({ type: "" });
    input.value = "";
    input.dispatchEvent(new InputEvent("input", { bubbles: true }));
    await el.updateComplete;
    input.blur();
    await el.updateComplete;
    expect(el.value).to.equal("");
  });

  it("reopens on click even when already focused (a redundant focus() call fires no new focus event)", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.activeElement).to.equal(input);

    input.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it("does not open when disabled", async () => {
    const el = await fixture<LitMaterialAutocomplete>(html`
      <lit-material-autocomplete label="Fruit" .options=${fruitOptions} disabled></lit-material-autocomplete>
    `);
    const input = el.shadowRoot!.querySelector("input") as HTMLInputElement;
    input.focus();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-autocomplete name="fruit" label="Fruit" .options=${fruitOptions}></lit-material-autocomplete>
      </form>
    `);
    const el = form.querySelector("lit-material-autocomplete")! as LitMaterialAutocomplete;
    expect(new FormData(form).get("fruit")).to.equal(null);
    el.value = "cherry";
    await el.updateComplete;
    expect(new FormData(form).get("fruit")).to.equal("cherry");
  });

  it("is invalid when required and nothing is selected", async () => {
    const el = await fixture<LitMaterialAutocomplete>(html`
      <lit-material-autocomplete label="Fruit" .options=${fruitOptions} required></lit-material-autocomplete>
    `);
    expect(el.checkValidity()).to.be.false;
    el.value = "apple";
    await el.updateComplete;
    expect(el.checkValidity()).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await autocompleteFixture();
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks while open with a highlighted option", async () => {
    const { el, input } = await autocompleteFixture();
    input.focus();
    await sendKeys({ press: "ArrowDown" });
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
