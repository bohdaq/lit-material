import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./dialog.js";
import type { LitMaterialDialog } from "./dialog.js";

describe("lit-material-dialog", () => {
  it("defaults to closed", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog>Content</lit-material-dialog>`);
    expect(el.open).to.be.false;
    expect(el.shadowRoot!.querySelector("dialog")!.open).to.be.false;
  });

  it("opens the native dialog as a modal when `open` is set (or show() is called)", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog>Content</lit-material-dialog>`);
    el.show();
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog.open).to.be.true;
    expect(el.hasAttribute("open")).to.be.true;
    dialog.close();
  });

  it("closes the native dialog when `open` is unset (or close() is called)", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog open>Content</lit-material-dialog>`);
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog.open).to.be.true;

    el.close("cancelled");
    await el.updateComplete;
    expect(dialog.open).to.be.false;
    expect(el.returnValue).to.equal("cancelled");
  });

  it("re-dispatches a bubbling, composed close event when the dialog closes", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog open>Content</lit-material-dialog>`);
    await el.updateComplete;
    setTimeout(() => el.shadowRoot!.querySelector("dialog")!.close());
    const event = await oneEvent(el, "close");
    expect(event).to.exist;
    expect(event.bubbles).to.be.true;
    expect(event.composed).to.be.true;
    expect(el.open).to.be.false;
  });

  it("closes when the backdrop (the dialog element itself) is clicked", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog open>Content</lit-material-dialog>`);
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    expect(dialog.open).to.be.false;
  });

  it("does not close when a descendant of the container is clicked", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog open>Content</lit-material-dialog>`);
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    const container = el.shadowRoot!.querySelector(".container")!;
    container.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    expect(dialog.open).to.be.true;
    dialog.close();
  });

  it("does not close on backdrop click when disable-backdrop-close is set", async () => {
    const el = await fixture<LitMaterialDialog>(
      html`<lit-material-dialog open disable-backdrop-close>Content</lit-material-dialog>`,
    );
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    dialog.dispatchEvent(new MouseEvent("click", { bubbles: true, composed: true }));
    expect(dialog.open).to.be.true;
    dialog.close();
  });

  it("closes on Escape and re-dispatches cancel then close", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog open>Content</lit-material-dialog>`);
    await el.updateComplete;
    el.shadowRoot!.querySelector("dialog")!.focus();

    let cancelFired = false;
    el.addEventListener("cancel", () => (cancelFired = true));

    setTimeout(() => sendKeys({ press: "Escape" }));
    const event = await oneEvent(el, "close");
    expect(event).to.exist;
    expect(cancelFired).to.be.true;
    expect(el.open).to.be.false;
  });

  it("stays open on Escape if the cancel event is prevented", async () => {
    const el = await fixture<LitMaterialDialog>(html`<lit-material-dialog open>Content</lit-material-dialog>`);
    await el.updateComplete;
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    dialog.focus();
    el.addEventListener("cancel", (event) => event.preventDefault());

    await sendKeys({ press: "Escape" });
    expect(dialog.open).to.be.true;
    dialog.close();
  });

  it("passes axe accessibility checks while open", async () => {
    const el = await fixture<LitMaterialDialog>(html`
      <lit-material-dialog open>
        <span slot="headline">Delete file?</span>
        This can't be undone.
        <div slot="actions">
          <button>Cancel</button>
          <button>Delete</button>
        </div>
      </lit-material-dialog>
    `);
    await el.updateComplete;
    await expect(el).to.be.accessible();
    el.shadowRoot!.querySelector("dialog")!.close();
  });
});
