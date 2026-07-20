import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./bottom-sheet.js";
import type { LitMaterialBottomSheet } from "./bottom-sheet.js";

describe("lit-material-bottom-sheet", () => {
  it("defaults to variant=modal", async () => {
    const el = await fixture<LitMaterialBottomSheet>(html`<lit-material-bottom-sheet></lit-material-bottom-sheet>`);
    expect(el.variant).to.equal("modal");
    expect(el.shadowRoot!.querySelector("dialog")).to.exist;
  });

  it("renders a standard sheet as a plain container, no <dialog>", async () => {
    const el = await fixture<LitMaterialBottomSheet>(
      html`<lit-material-bottom-sheet variant="standard">Content</lit-material-bottom-sheet>`,
    );
    expect(el.shadowRoot!.querySelector("dialog")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".sheet")).to.exist;
  });

  it("shows the drag handle by default, and can hide it", async () => {
    const withHandle = await fixture<LitMaterialBottomSheet>(
      html`<lit-material-bottom-sheet variant="standard"></lit-material-bottom-sheet>`,
    );
    expect(withHandle.shadowRoot!.querySelector(".drag-handle")).to.exist;

    const withoutHandle = await fixture<LitMaterialBottomSheet>(
      html`<lit-material-bottom-sheet variant="standard" .showDragHandle=${false}></lit-material-bottom-sheet>`,
    );
    expect(withoutHandle.shadowRoot!.querySelector(".drag-handle")).to.not.exist;
  });

  it("opens and closes via show()/close(), closed by default", async () => {
    const el = await fixture<LitMaterialBottomSheet>(html`<lit-material-bottom-sheet>Content</lit-material-bottom-sheet>`);
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog.open).to.be.false;

    el.show();
    await el.updateComplete;
    expect(dialog.open).to.be.true;
    expect(el.open).to.be.true;

    el.close();
    await el.updateComplete;
    expect(dialog.open).to.be.false;
  });

  it("closes when the backdrop is clicked, unless disableBackdropClose is set", async () => {
    const el = await fixture<LitMaterialBottomSheet>(html`<lit-material-bottom-sheet>Content</lit-material-bottom-sheet>`);
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
    const el = await fixture<LitMaterialBottomSheet>(
      html`<lit-material-bottom-sheet disable-backdrop-close>Content</lit-material-bottom-sheet>`,
    );
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    el.show();
    await el.updateComplete;

    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(el.open).to.be.true;
  });

  it("re-dispatches a composed, bubbling close event", async () => {
    const el = await fixture<LitMaterialBottomSheet>(html`<lit-material-bottom-sheet>Content</lit-material-bottom-sheet>`);
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
    const el = await fixture<LitMaterialBottomSheet>(html`<lit-material-bottom-sheet open>Content</lit-material-bottom-sheet>`);
    await expect(el).to.be.accessible();
  });
});
