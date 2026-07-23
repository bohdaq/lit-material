import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./alert.js";
import type { LitMaterialAlert } from "./alert.js";

describe("lit-material-alert", () => {
  it("defaults to variant=info with role=status", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert>Something happened.</lit-material-alert>`);
    expect(el.variant).to.equal("info");
    expect(el.getAttribute("role")).to.equal("status");
  });

  it("uses role=alert for warning/error, role=status for info/success", async () => {
    const warning = await fixture<LitMaterialAlert>(html`<lit-material-alert variant="warning">Careful.</lit-material-alert>`);
    expect(warning.getAttribute("role")).to.equal("alert");

    const error = await fixture<LitMaterialAlert>(html`<lit-material-alert variant="error">Failed.</lit-material-alert>`);
    expect(error.getAttribute("role")).to.equal("alert");

    const success = await fixture<LitMaterialAlert>(html`<lit-material-alert variant="success">Saved.</lit-material-alert>`);
    expect(success.getAttribute("role")).to.equal("status");
  });

  it("keeps role in sync when variant changes reactively after first render", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert>Something happened.</lit-material-alert>`);
    expect(el.getAttribute("role")).to.equal("status");

    el.variant = "error";
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("alert");

    el.variant = "success";
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("status");
  });

  it("respects an author-supplied role instead of overriding it, even across later variant changes", async () => {
    const el = await fixture<LitMaterialAlert>(
      html`<lit-material-alert variant="error" role="alertdialog">Failed.</lit-material-alert>`,
    );
    expect(el.getAttribute("role")).to.equal("alertdialog");

    el.variant = "success";
    await el.updateComplete;
    expect(el.getAttribute("role")).to.equal("alertdialog");
  });

  it("renders a default icon per variant when no icon slot is provided", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert variant="success">Saved.</lit-material-alert>`);
    const svg = el.shadowRoot!.querySelector(".icon svg");
    expect(svg).to.exist;
  });

  it("renders a slotted icon instead of the default when provided", async () => {
    const el = await fixture<LitMaterialAlert>(html`
      <lit-material-alert variant="success">
        <span slot="icon">🎉</span>
        Saved.
      </lit-material-alert>
    `);
    const assigned = (el.shadowRoot!.querySelector('slot[name="icon"]') as HTMLSlotElement).assignedElements();
    expect(assigned.length).to.equal(1);
    expect(assigned[0]!.textContent).to.equal("🎉");
  });

  it("does not render a close button by default", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert>Something happened.</lit-material-alert>`);
    expect(el.shadowRoot!.querySelector(".close")).to.not.exist;
  });

  it("renders a close button when dismissible, which hides the alert and fires close", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert dismissible>Something happened.</lit-material-alert>`);
    const closeButton = el.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    expect(closeButton).to.exist;

    const closed = oneEvent(el, "close");
    closeButton.click();
    await closed;
    expect(el.hidden).to.be.true;
  });

  it("dismiss() hides the alert and fires close", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert>Something happened.</lit-material-alert>`);
    const closed = oneEvent(el, "close");
    el.dismiss();
    await closed;
    expect(el.hidden).to.be.true;
  });

  it("renders title and action slot content", async () => {
    const el = await fixture<LitMaterialAlert>(html`
      <lit-material-alert>
        <span slot="title">Heads up</span>
        Something happened.
        <button slot="action">Undo</button>
      </lit-material-alert>
    `);
    expect(el.querySelector('[slot="title"]')).to.exist;
    expect(el.querySelector('[slot="action"]')).to.exist;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialAlert>(html`
      <lit-material-alert variant="success" dismissible>
        <span slot="title">Saved</span>
        Your changes have been saved.
      </lit-material-alert>
    `);
    await expect(el).to.be.accessible();
  });

  it("passes axe accessibility checks for the error/alert variant", async () => {
    const el = await fixture<LitMaterialAlert>(html`<lit-material-alert variant="error">Something went wrong.</lit-material-alert>`);
    await expect(el).to.be.accessible();
  });
});
