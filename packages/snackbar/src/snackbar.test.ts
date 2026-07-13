import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./snackbar.js";
import type { LitMaterialSnackbar } from "./snackbar.js";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("lit-material-snackbar", () => {
  it("defaults to closed", async () => {
    const el = await fixture<LitMaterialSnackbar>(html`<lit-material-snackbar>Saved</lit-material-snackbar>`);
    expect(el.open).to.be.false;
    expect(el.matches(":popover-open")).to.be.false;
  });

  it("sets status/live-region ARIA attributes", async () => {
    const el = await fixture<LitMaterialSnackbar>(html`<lit-material-snackbar>Saved</lit-material-snackbar>`);
    expect(el.getAttribute("role")).to.equal("status");
    expect(el.getAttribute("aria-live")).to.equal("polite");
    expect(el.getAttribute("aria-atomic")).to.equal("true");
  });

  it("opens as a popover when show() is called", async () => {
    const el = await fixture<LitMaterialSnackbar>(
      html`<lit-material-snackbar duration="0">Saved</lit-material-snackbar>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(el.matches(":popover-open")).to.be.true;
    el.close();
  });

  it("does not steal focus when opened", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div>
        <button id="elsewhere">Elsewhere</button>
        <lit-material-snackbar duration="0">Saved</lit-material-snackbar>
      </div>
    `);
    const button = wrapper.querySelector<HTMLButtonElement>("#elsewhere")!;
    const el = wrapper.querySelector<LitMaterialSnackbar>("lit-material-snackbar")!;
    button.focus();
    el.show();
    await el.updateComplete;
    expect(document.activeElement).to.equal(button);
    el.close();
  });

  it("does not close on outside click or Escape", async () => {
    const el = await fixture<LitMaterialSnackbar>(
      html`<lit-material-snackbar duration="0">Saved</lit-material-snackbar>`,
    );
    el.show();
    await el.updateComplete;
    document.body.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.matches(":popover-open")).to.be.true;
    el.close();
  });

  it("auto-dismisses after `duration`", async () => {
    const el = await fixture<LitMaterialSnackbar>(
      html`<lit-material-snackbar duration="50">Saved</lit-material-snackbar>`,
    );
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
    await wait(120);
    expect(el.open).to.be.false;
    expect(el.matches(":popover-open")).to.be.false;
  });

  it("does not auto-dismiss while hovered, and resumes after", async () => {
    const el = await fixture<LitMaterialSnackbar>(
      html`<lit-material-snackbar duration="50">Saved</lit-material-snackbar>`,
    );
    el.show();
    await el.updateComplete;
    el.dispatchEvent(new PointerEvent("pointerenter"));
    await wait(120);
    expect(el.open).to.be.true;

    el.dispatchEvent(new PointerEvent("pointerleave"));
    await wait(120);
    expect(el.open).to.be.false;
  });

  it("closes and dispatches close when the close button is clicked", async () => {
    const el = await fixture<LitMaterialSnackbar>(
      html`<lit-material-snackbar closable duration="0">Saved</lit-material-snackbar>`,
    );
    el.show();
    await el.updateComplete;
    setTimeout(() => el.shadowRoot!.querySelector("button.close")!.dispatchEvent(new Event("click", { bubbles: true })));
    const event = await oneEvent(el, "close");
    expect(event).to.exist;
    expect(el.open).to.be.false;
  });

  it("closes when the slotted action is activated", async () => {
    const el = await fixture<LitMaterialSnackbar>(html`
      <lit-material-snackbar duration="0">
        Undo?
        <button slot="action" id="undo">Undo</button>
      </lit-material-snackbar>
    `);
    el.show();
    await el.updateComplete;
    let actionClicked = false;
    el.querySelector("#undo")!.addEventListener("click", () => (actionClicked = true));
    el.querySelector<HTMLButtonElement>("#undo")!.click();
    await el.updateComplete;
    expect(actionClicked).to.be.true;
    expect(el.open).to.be.false;
  });

  it("passes axe accessibility checks while open", async () => {
    const el = await fixture<LitMaterialSnackbar>(
      html`<lit-material-snackbar closable duration="0">Saved</lit-material-snackbar>`,
    );
    el.show();
    await el.updateComplete;
    await expect(el).to.be.accessible();
    el.close();
  });
});
