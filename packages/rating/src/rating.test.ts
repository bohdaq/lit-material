import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./rating.js";
import type { LitMaterialRating } from "./rating.js";

function fillPercents(el: LitMaterialRating): number[] {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLElement>(".icon-fill")).map((fill) =>
    parseFloat(fill.style.width),
  );
}

describe("lit-material-rating", () => {
  it("renders a native range input by default (interactive mode)", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating></lit-material-rating>`);
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input).to.exist;
    expect(input.type).to.equal("range");
  });

  it("defaults to value=0, max=5, precision=1", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating></lit-material-rating>`);
    expect(el.value).to.equal(0);
    expect(el.max).to.equal(5);
    expect(el.precision).to.equal(1);
  });

  it("renders max icons, fully filling icons up to a whole-number value", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating value="3" max="5"></lit-material-rating>`);
    const icons = el.shadowRoot!.querySelectorAll(".icon");
    expect(icons.length).to.equal(5);
    expect(fillPercents(el)).to.deep.equal([100, 100, 100, 0, 0]);
  });

  it("half-fills the icon spanning a fractional value", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating value="3.5" max="5"></lit-material-rating>`);
    expect(fillPercents(el)).to.deep.equal([100, 100, 100, 50, 0]);
  });

  it("updates value and dispatches input while stepping via keyboard", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating value="2"></lit-material-rating>`);
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    let inputCount = 0;
    el.addEventListener("input", () => inputCount++);
    await sendKeys({ press: "ArrowRight" });
    expect(inputCount).to.equal(1);
    expect(el.value).to.equal(3);
  });

  it("steps by precision (0.5) via keyboard", async () => {
    const el = await fixture<LitMaterialRating>(
      html`<lit-material-rating value="2" precision="0.5"></lit-material-rating>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    await sendKeys({ press: "ArrowRight" });
    expect(el.value).to.equal(2.5);
  });

  it("dispatches a change event once a step is committed", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating value="2"></lit-material-rating>`);
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    setTimeout(() => sendKeys({ press: "ArrowRight" }));
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.value).to.equal(3);
  });

  it("moves to 0/max with Home/End", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating value="2" max="5"></lit-material-rating>`);
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    await sendKeys({ press: "End" });
    expect(el.value).to.equal(5);
    await sendKeys({ press: "Home" });
    expect(el.value).to.equal(0);
  });

  it("previews a hovered value visually without changing the committed value", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating value="1" max="5"></lit-material-rating>`);
    const icons = el.shadowRoot!.querySelector(".icons") as HTMLElement;
    const rect = icons.getBoundingClientRect();
    // Roughly 80% across a 5-icon row lands the hover preview on the 4th icon.
    icons.dispatchEvent(
      new PointerEvent("pointermove", { clientX: rect.left + rect.width * 0.8, bubbles: true, composed: true }),
    );
    await el.updateComplete;
    expect(fillPercents(el)).to.deep.equal([100, 100, 100, 100, 0]);
    expect(el.value).to.equal(1); // unchanged — preview is visual only

    icons.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(fillPercents(el)).to.deep.equal([100, 0, 0, 0, 0]);
  });

  it("does not preview on hover when disabled", async () => {
    const el = await fixture<LitMaterialRating>(
      html`<lit-material-rating value="1" max="5" disabled></lit-material-rating>`,
    );
    const icons = el.shadowRoot!.querySelector(".icons") as HTMLElement;
    const rect = icons.getBoundingClientRect();
    icons.dispatchEvent(
      new PointerEvent("pointermove", { clientX: rect.left + rect.width * 0.8, bubbles: true, composed: true }),
    );
    await el.updateComplete;
    expect(fillPercents(el)).to.deep.equal([100, 0, 0, 0, 0]);
  });

  it("reflects the disabled property to the attribute and disables the inner input", async () => {
    const el = await fixture<LitMaterialRating>(html`<lit-material-rating disabled></lit-material-rating>`);
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("readonly mode renders no native input and no hover preview, just a labeled display", async () => {
    const el = await fixture<LitMaterialRating>(
      html`<lit-material-rating value="3.5" max="5" readonly label="Average rating"></lit-material-rating>`,
    );
    expect(el.shadowRoot!.querySelector("input")).to.not.exist;
    const container = el.shadowRoot!.querySelector(".rating")!;
    expect(container.getAttribute("role")).to.equal("img");
    expect(container.getAttribute("aria-label")).to.equal("Average rating: 3.5 out of 5");
    expect(fillPercents(el)).to.deep.equal([100, 100, 100, 50, 0]);
  });

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-rating name="stars" value="3"></lit-material-rating>
      </form>
    `);
    expect(new FormData(form).get("stars")).to.equal("3");
    const el = form.querySelector("lit-material-rating")! as LitMaterialRating;
    el.value = 4;
    await el.updateComplete;
    expect(new FormData(form).get("stars")).to.equal("4");
  });

  it("passes axe accessibility checks, interactive and readonly", async () => {
    const interactive = await fixture<LitMaterialRating>(
      html`<lit-material-rating label="Rate this product"></lit-material-rating>`,
    );
    await expect(interactive).to.be.accessible();

    const readonly = await fixture<LitMaterialRating>(
      html`<lit-material-rating value="4" readonly label="Average rating"></lit-material-rating>`,
    );
    await expect(readonly).to.be.accessible();
  });
});
