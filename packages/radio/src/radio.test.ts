import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./radio.js";
import type { LitMaterialRadio } from "./radio.js";

describe("lit-material-radio", () => {
  it("renders a native radio input", async () => {
    const el = await fixture<LitMaterialRadio>(html`<lit-material-radio aria-label="Small"></lit-material-radio>`);
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input).to.exist;
    expect(input.type).to.equal("radio");
  });

  it("defaults to unchecked", async () => {
    const el = await fixture<LitMaterialRadio>(html`<lit-material-radio aria-label="Small"></lit-material-radio>`);
    expect(el.checked).to.be.false;
  });

  it("reflects the checked property onto the inner input", async () => {
    const el = await fixture<LitMaterialRadio>(
      html`<lit-material-radio aria-label="Small" checked></lit-material-radio>`,
    );
    expect(el.checked).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.checked).to.be.true;
  });

  it("reflects the disabled property to the attribute and disables the inner input", async () => {
    const el = await fixture<LitMaterialRadio>(
      html`<lit-material-radio aria-label="Small" disabled></lit-material-radio>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("checks and dispatches a change event on click", async () => {
    const el = await fixture<LitMaterialRadio>(html`<lit-material-radio aria-label="Small"></lit-material-radio>`);
    const input = el.shadowRoot!.querySelector("input")!;
    setTimeout(() => input.click());
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.checked).to.be.true;
  });

  it("does not check or dispatch a change event when disabled", async () => {
    const el = await fixture<LitMaterialRadio>(
      html`<lit-material-radio aria-label="Small" disabled></lit-material-radio>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    let changed = false;
    el.addEventListener("change", () => (changed = true));
    input.click();
    expect(changed).to.be.false;
    expect(el.checked).to.be.false;
  });

  describe("grouping", () => {
    async function fixtureGroup() {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <lit-material-radio name="size" value="s" aria-label="Small"></lit-material-radio>
          <lit-material-radio name="size" value="m" aria-label="Medium" checked></lit-material-radio>
          <lit-material-radio name="size" value="l" aria-label="Large"></lit-material-radio>
        </div>
      `);
      const radios = Array.from(
        wrapper.querySelectorAll<LitMaterialRadio>("lit-material-radio"),
      );
      return { wrapper, radios };
    }

    it("selecting one radio deselects the rest of the group", async () => {
      const { radios } = await fixtureGroup();
      const [small, medium, large] = radios;
      expect(medium.checked).to.be.true;

      small.shadowRoot!.querySelector("input")!.click();
      await small.updateComplete;
      await medium.updateComplete;
      await large.updateComplete;

      expect(small.checked).to.be.true;
      expect(medium.checked).to.be.false;
      expect(large.checked).to.be.false;
    });

    it("only fires change on the newly-selected radio, not the deselected one", async () => {
      const { radios } = await fixtureGroup();
      const [small, medium] = radios;
      let mediumChanged = false;
      medium.addEventListener("change", () => (mediumChanged = true));

      setTimeout(() => small.shadowRoot!.querySelector("input")!.click());
      const event = await oneEvent(small, "change");
      expect(event).to.exist;
      expect(mediumChanged).to.be.false;
    });

    it("makes only the checked radio (or the first, if none checked) tab-reachable", async () => {
      const { radios } = await fixtureGroup();
      const [small, medium, large] = radios;
      expect(small.shadowRoot!.querySelector("input")!.tabIndex).to.equal(-1);
      expect(medium.shadowRoot!.querySelector("input")!.tabIndex).to.equal(0);
      expect(large.shadowRoot!.querySelector("input")!.tabIndex).to.equal(-1);
    });

    it("moves selection with ArrowRight/ArrowDown and wraps at the end", async () => {
      const { radios } = await fixtureGroup();
      const [small, medium, large] = radios;
      medium.shadowRoot!.querySelector("input")!.focus();

      await sendKeys({ press: "ArrowRight" });
      await small.updateComplete;
      await medium.updateComplete;
      await large.updateComplete;
      expect(large.checked).to.be.true;
      expect(medium.checked).to.be.false;

      await sendKeys({ press: "ArrowRight" });
      await small.updateComplete;
      await medium.updateComplete;
      await large.updateComplete;
      expect(small.checked).to.be.true;
      expect(large.checked).to.be.false;
    });

    it("moves selection with ArrowLeft/ArrowUp and wraps at the start", async () => {
      const { radios } = await fixtureGroup();
      const [small, medium, large] = radios;
      medium.shadowRoot!.querySelector("input")!.focus();

      await sendKeys({ press: "ArrowLeft" });
      await small.updateComplete;
      await medium.updateComplete;
      await large.updateComplete;
      expect(small.checked).to.be.true;
      expect(medium.checked).to.be.false;
    });

    it("participates in an ancestor form via FormData, submitting only the checked value", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <lit-material-radio name="size" value="s" aria-label="Small"></lit-material-radio>
          <lit-material-radio name="size" value="m" aria-label="Medium" checked></lit-material-radio>
        </form>
      `);
      expect(new FormData(form).get("size")).to.equal("m");
    });

    it("is invalid when required and nothing in the group is checked", async () => {
      const wrapper = await fixture<HTMLDivElement>(html`
        <div>
          <lit-material-radio name="plan" value="a" required aria-label="A"></lit-material-radio>
          <lit-material-radio name="plan" value="b" required aria-label="B"></lit-material-radio>
        </div>
      `);
      const [a, b] = Array.from(wrapper.querySelectorAll<LitMaterialRadio>("lit-material-radio"));
      expect(a.checkValidity()).to.be.false;

      b.shadowRoot!.querySelector("input")!.click();
      await a.updateComplete;
      await b.updateComplete;
      expect(a.checkValidity()).to.be.true;
      expect(b.checkValidity()).to.be.true;
    });

    it("resets each radio to its own default checked state on form reset", async () => {
      const form = await fixture<HTMLFormElement>(html`
        <form>
          <lit-material-radio name="size" value="s" aria-label="Small"></lit-material-radio>
          <lit-material-radio name="size" value="m" aria-label="Medium" checked></lit-material-radio>
        </form>
      `);
      const [small, medium] = Array.from(form.querySelectorAll<LitMaterialRadio>("lit-material-radio"));
      small.shadowRoot!.querySelector("input")!.click();
      await small.updateComplete;
      await medium.updateComplete;
      expect(small.checked).to.be.true;
      expect(medium.checked).to.be.false;

      form.reset();
      await small.updateComplete;
      await medium.updateComplete;
      expect(small.checked).to.be.false;
      expect(medium.checked).to.be.true;
    });
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialRadio>(html`<lit-material-radio aria-label="Small"></lit-material-radio>`);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks in the error state", async () => {
    const el = await fixture<LitMaterialRadio>(
      html`<lit-material-radio aria-label="Small" error required></lit-material-radio>`,
    );
    await expect(el).to.be.accessible();
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialRadio>(html`<lit-material-radio aria-label="Small"></lit-material-radio>`);
    const input = el.shadowRoot!.querySelector("input")!;
    const rect = input.getBoundingClientRect();
    input.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    const stateLayer = el.shadowRoot!.querySelector(".state-layer")!;
    expect(stateLayer.hasAttribute("data-pressed")).to.be.true;
  });
});
