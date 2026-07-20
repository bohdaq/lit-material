import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./side-sheet.js";
import type { LitMaterialSideSheet } from "./side-sheet.js";

describe("lit-material-side-sheet", () => {
  it("renders a standard sheet as a plain container, no <dialog>", async () => {
    const el = await fixture<LitMaterialSideSheet>(html`<lit-material-side-sheet>Content</lit-material-side-sheet>`);
    expect(el.shadowRoot!.querySelector("dialog")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".sheet")).to.exist;
  });

  it("defaults to position=end", async () => {
    const el = await fixture<LitMaterialSideSheet>(html`<lit-material-side-sheet></lit-material-side-sheet>`);
    expect(el.position).to.equal("end");
    expect(el.getAttribute("position")).to.equal("end");
  });

  it("renders a modal sheet wrapped in a native <dialog>, closed by default", async () => {
    const el = await fixture<LitMaterialSideSheet>(
      html`<lit-material-side-sheet variant="modal">Content</lit-material-side-sheet>`,
    );
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog).to.exist;
    expect(dialog.open).to.be.false;
  });

  it("opens and closes a modal sheet via show()/close()", async () => {
    const el = await fixture<LitMaterialSideSheet>(
      html`<lit-material-side-sheet variant="modal">Content</lit-material-side-sheet>`,
    );
    const dialog = el.shadowRoot!.querySelector("dialog")!;

    el.show();
    await el.updateComplete;
    expect(dialog.open).to.be.true;
    expect(el.open).to.be.true;

    el.close();
    await el.updateComplete;
    expect(dialog.open).to.be.false;
  });

  it("show()/close() have no visible effect on a standard sheet", async () => {
    const el = await fixture<LitMaterialSideSheet>(html`<lit-material-side-sheet>Content</lit-material-side-sheet>`);
    el.show();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector("dialog")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".sheet")).to.exist;
  });

  it("closes when the backdrop is clicked, unless disableBackdropClose is set", async () => {
    const el = await fixture<LitMaterialSideSheet>(
      html`<lit-material-side-sheet variant="modal">Content</lit-material-side-sheet>`,
    );
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    el.show();
    await el.updateComplete;

    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    // The component's backdrop-click handler calls dialog.close() itself,
    // which updates the native <dialog>'s own `.open` immediately — the
    // "close" event that syncs our own `.open` back is queued as a task
    // instead, so check the native property here rather than waiting for that.
    expect(dialog.open).to.be.false;
  });

  it("does not close on backdrop click when disableBackdropClose is set", async () => {
    const el = await fixture<LitMaterialSideSheet>(
      html`<lit-material-side-sheet variant="modal" disable-backdrop-close>Content</lit-material-side-sheet>`,
    );
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    el.show();
    await el.updateComplete;

    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it("re-dispatches a composed, bubbling close event", async () => {
    const el = await fixture<LitMaterialSideSheet>(
      html`<lit-material-side-sheet variant="modal">Content</lit-material-side-sheet>`,
    );
    el.show();
    await el.updateComplete;

    const closeEventPromise = oneEvent(el, "close");
    el.close();
    const closeEvent = await closeEventPromise;

    expect(closeEvent).to.exist;
    expect(closeEvent.bubbles).to.be.true;
    expect(closeEvent.composed).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialSideSheet>(html`<lit-material-side-sheet>Content</lit-material-side-sheet>`);
    await expect(el).to.be.accessible();
  });
});
