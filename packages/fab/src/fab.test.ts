import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./fab.js";
import type { LitMaterialFab } from "./fab.js";

describe("lit-material-fab", () => {
  it("renders a native button by default", async () => {
    const el = await fixture<LitMaterialFab>(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    expect(el.shadowRoot!.querySelector("button")).to.exist;
    expect(el.shadowRoot!.querySelector("a")).to.not.exist;
  });

  it("renders an anchor when href is set", async () => {
    const el = await fixture<LitMaterialFab>(
      html`<lit-material-fab aria-label="Compose" href="/compose"></lit-material-fab>`,
    );
    const anchor = el.shadowRoot!.querySelector("a")!;
    expect(anchor.getAttribute("href")).to.equal("/compose");
  });

  it("defaults to size=regular and color=primary", async () => {
    const el = await fixture<LitMaterialFab>(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    expect(el.size).to.equal("regular");
    expect(el.color).to.equal("primary");
  });

  it("forwards aria-label to the inner button", async () => {
    const el = await fixture<LitMaterialFab>(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    expect(el.shadowRoot!.querySelector("button")!.getAttribute("aria-label")).to.equal("Compose");
  });

  it("reflects disabled to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialFab>(
      html`<lit-material-fab aria-label="Compose" disabled></lit-material-fab>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("button")!.disabled).to.be.true;
  });

  it("does not dispatch click when disabled", async () => {
    const el = await fixture<LitMaterialFab>(
      html`<lit-material-fab aria-label="Compose" disabled></lit-material-fab>`,
    );
    let clicked = false;
    el.addEventListener("click", () => (clicked = true));
    el.shadowRoot!.querySelector("button")!.click();
    expect(clicked).to.be.false;
  });

  it("mounts the label slot even when not extended, hidden via CSS max-width", async () => {
    const el = await fixture<LitMaterialFab>(
      html`<lit-material-fab aria-label="Compose">Compose</lit-material-fab>`,
    );
    const label = el.shadowRoot!.querySelector(".label")!;
    expect(label).to.exist;
    expect(getComputedStyle(label).maxWidth).to.equal("0px");
  });

  it("expands the label's max-width when extended", async () => {
    const el = await fixture<LitMaterialFab>(
      html`<lit-material-fab aria-label="Compose" extended>Compose</lit-material-fab>`,
    );
    const label = el.shadowRoot!.querySelector(".label")!;
    expect(getComputedStyle(label).maxWidth).to.not.equal("0px");
  });

  it("calls requestSubmit on a submit-type fab inside a form", async () => {
    const form = await fixture<HTMLFormElement>(html`
      <form>
        <lit-material-fab aria-label="Submit" type="submit"></lit-material-fab>
      </form>
    `);
    let submitted = false;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      submitted = true;
    });
    const fab = form.querySelector("lit-material-fab")!.shadowRoot!.querySelector("button")!;
    fab.click();
    expect(submitted).to.be.true;
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialFab>(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    const button = el.shadowRoot!.querySelector("button")!;
    const rect = button.getBoundingClientRect();
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    expect(el.shadowRoot!.querySelector(".state-layer")!.hasAttribute("data-pressed")).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialFab>(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    await expect(el).to.be.accessible();
  });

  it("supports oneEvent click helper for a plain button fab", async () => {
    const el = await fixture<LitMaterialFab>(html`<lit-material-fab aria-label="Compose"></lit-material-fab>`);
    const clickPromise = oneEvent(el, "click");
    el.shadowRoot!.querySelector("button")!.click();
    const event = await clickPromise;
    expect(event).to.exist;
  });
});
