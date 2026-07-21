import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./accordion-panel.js";
import type { LitMaterialAccordionPanel } from "./accordion-panel.js";

async function panelFixture() {
  const el = await fixture<LitMaterialAccordionPanel>(html`
    <lit-material-accordion-panel>
      <span slot="header">Shipping</span>
      <p>Ships in 3-5 business days.</p>
    </lit-material-accordion-panel>
  `);
  const header = el.shadowRoot!.querySelector("button.header") as HTMLButtonElement;
  return { el, header };
}

describe("lit-material-accordion-panel", () => {
  it("renders collapsed by default", async () => {
    const { el, header } = await panelFixture();
    expect(el.expanded).to.be.false;
    expect(header.getAttribute("aria-expanded")).to.equal("false");
  });

  it("expands and collapses on header click, dispatching toggle", async () => {
    const { el, header } = await panelFixture();
    const events: boolean[] = [];
    el.addEventListener("toggle", (event) => events.push((event as CustomEvent).detail.expanded));

    header.click();
    await el.updateComplete;
    expect(el.expanded).to.be.true;
    expect(header.getAttribute("aria-expanded")).to.equal("true");

    header.click();
    await el.updateComplete;
    expect(el.expanded).to.be.false;

    expect(events).to.deep.equal([true, false]);
  });

  it("toggles via keyboard activation (Enter/Space on the header button)", async () => {
    const { el, header } = await panelFixture();
    header.focus();
    await sendKeys({ press: "Enter" });
    await el.updateComplete;
    expect(el.expanded).to.be.true;

    await sendKeys({ press: " " });
    await el.updateComplete;
    expect(el.expanded).to.be.false;
  });

  it("does not dispatch toggle when expanded is set programmatically", async () => {
    const { el } = await panelFixture();
    const events: boolean[] = [];
    el.addEventListener("toggle", (event) => events.push((event as CustomEvent).detail.expanded));
    el.expanded = true;
    await el.updateComplete;
    expect(events).to.deep.equal([]);
  });

  it("does not expand on click when disabled", async () => {
    const el = await fixture<LitMaterialAccordionPanel>(html`
      <lit-material-accordion-panel disabled>
        <span slot="header">Shipping</span>
        <p>Ships in 3-5 business days.</p>
      </lit-material-accordion-panel>
    `);
    const header = el.shadowRoot!.querySelector("button.header") as HTMLButtonElement;
    header.click();
    await el.updateComplete;
    expect(el.expanded).to.be.false;
  });

  it("makes collapsed content inert (unfocusable) and expanded content interactive", async () => {
    const el = await fixture<LitMaterialAccordionPanel>(html`
      <lit-material-accordion-panel>
        <span slot="header">Shipping</span>
        <a href="#details">Details</a>
      </lit-material-accordion-panel>
    `);
    const contentInner = el.shadowRoot!.querySelector(".content-inner") as HTMLElement;
    expect(contentInner.inert).to.be.true;

    el.expanded = true;
    await el.updateComplete;
    expect(contentInner.inert).to.be.false;
  });

  it("focus() delegates to the header button", async () => {
    const { el, header } = await panelFixture();
    el.focus();
    expect(el.shadowRoot!.activeElement).to.equal(header);
  });

  it("passes axe accessibility checks, collapsed and expanded", async () => {
    const { el } = await panelFixture();
    await expect(el).to.be.accessible();
    el.expanded = true;
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
