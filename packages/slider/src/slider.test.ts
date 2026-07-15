import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./slider.js";
import type { LitMaterialSlider } from "./slider.js";

describe("lit-material-slider", () => {
  it("renders a native range input", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider></lit-material-slider>`);
    const input = el.shadowRoot!.querySelector("input")!;
    expect(input).to.exist;
    expect(input.type).to.equal("range");
  });

  it("defaults to min=0, max=100, step=1, value=0", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider></lit-material-slider>`);
    expect(el.min).to.equal(0);
    expect(el.max).to.equal(100);
    expect(el.step).to.equal(1);
    expect(el.value).to.equal(0);
  });

  it("positions the thumb and active track according to value", async () => {
    const el = await fixture<LitMaterialSlider>(
      html`<lit-material-slider min="0" max="200" value="50"></lit-material-slider>`,
    );
    const thumbWrap = el.shadowRoot!.querySelector(".thumb-wrap") as HTMLElement;
    const trackActive = el.shadowRoot!.querySelector(".track-active") as HTMLElement;
    expect(thumbWrap.style.insetInlineStart).to.equal("25%");
    expect(trackActive.style.width).to.equal("25%");
  });

  it("clamps the displayed percent within [0, 100] even if value is out of range", async () => {
    const el = await fixture<LitMaterialSlider>(
      html`<lit-material-slider min="0" max="100" value="500"></lit-material-slider>`,
    );
    const thumbWrap = el.shadowRoot!.querySelector(".thumb-wrap") as HTMLElement;
    expect(thumbWrap.style.insetInlineStart).to.equal("100%");
  });

  it("mirrors the filled track and thumb under dir=\"rtl\" instead of a fixed physical side", async () => {
    const ltr = await fixture<LitMaterialSlider>(
      html`<lit-material-slider dir="ltr" min="0" max="100" value="25"></lit-material-slider>`,
    );
    const ltrTrack = ltr.shadowRoot!.querySelector(".track")!.getBoundingClientRect();
    const ltrActive = ltr.shadowRoot!.querySelector(".track-active")!.getBoundingClientRect();
    expect(ltrActive.left).to.be.closeTo(ltrTrack.left, 1); // fill grows from the left, in LTR
    expect(ltrActive.right).to.be.lessThan(ltrTrack.right);

    const rtl = await fixture<LitMaterialSlider>(
      html`<lit-material-slider dir="rtl" min="0" max="100" value="25"></lit-material-slider>`,
    );
    const rtlTrack = rtl.shadowRoot!.querySelector(".track")!.getBoundingClientRect();
    const rtlActive = rtl.shadowRoot!.querySelector(".track-active")!.getBoundingClientRect();
    expect(rtlActive.right).to.be.closeTo(rtlTrack.right, 1); // mirrored: fill grows from the right, in RTL
    expect(rtlActive.left).to.be.greaterThan(rtlTrack.left);
  });

  it("updates value and dispatches input while dragging (ArrowRight simulated via keyboard)", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider value="10"></lit-material-slider>`);
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    let inputCount = 0;
    el.addEventListener("input", () => inputCount++);
    await sendKeys({ press: "ArrowRight" });
    expect(inputCount).to.equal(1);
    expect(el.value).to.equal(11);
  });

  it("dispatches a change event once a step is committed", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider value="10"></lit-material-slider>`);
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    setTimeout(() => sendKeys({ press: "ArrowRight" }));
    const event = await oneEvent(el, "change");
    expect(event).to.exist;
    expect(el.value).to.equal(11);
  });

  it("moves to min/max with Home/End", async () => {
    const el = await fixture<LitMaterialSlider>(
      html`<lit-material-slider min="0" max="100" value="50"></lit-material-slider>`,
    );
    const input = el.shadowRoot!.querySelector("input")!;
    input.focus();
    await sendKeys({ press: "End" });
    expect(el.value).to.equal(100);
    await sendKeys({ press: "Home" });
    expect(el.value).to.equal(0);
  });

  it("shows the value label while focused and hides it on blur", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider value="42"></lit-material-slider>`);
    const input = el.shadowRoot!.querySelector("input")!;
    const slider = el.shadowRoot!.querySelector(".slider")!;
    expect(slider.classList.contains("interacting")).to.be.false;

    input.focus();
    await el.updateComplete;
    expect(slider.classList.contains("interacting")).to.be.true;
    expect(el.shadowRoot!.querySelector(".value-label")!.textContent).to.equal("42");

    input.blur();
    await el.updateComplete;
    expect(slider.classList.contains("interacting")).to.be.false;
  });

  it("reflects the disabled property to the attribute and disables the inner input", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider disabled></lit-material-slider>`);
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("input")!.disabled).to.be.true;
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialSlider>(html`<lit-material-slider></lit-material-slider>`);
    const input = el.shadowRoot!.querySelector("input")! as HTMLInputElement;
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

  it("participates in an ancestor form via FormData", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-slider name="volume" value="30"></lit-material-slider>
      </form>
    `);
    expect(new FormData(form).get("volume")).to.equal("30");
    const el = form.querySelector("lit-material-slider")! as LitMaterialSlider;
    el.value = 75;
    await el.updateComplete;
    expect(new FormData(form).get("volume")).to.equal("75");
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSlider>(
      html`<lit-material-slider aria-label="Volume"></lit-material-slider>`,
    );
    await expect(el).to.be.accessible();
  });
});
