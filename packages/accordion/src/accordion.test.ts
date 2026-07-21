import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./accordion.js";
import "./accordion-panel.js";
import type { LitMaterialAccordion } from "./accordion.js";
import type { LitMaterialAccordionPanel } from "./accordion-panel.js";

async function accordionFixture(multi = false) {
  const el = await fixture<LitMaterialAccordion>(html`
    <lit-material-accordion ?multi=${multi}>
      <lit-material-accordion-panel id="a"><span slot="header">A</span><p>Panel A</p></lit-material-accordion-panel>
      <lit-material-accordion-panel id="b"><span slot="header">B</span><p>Panel B</p></lit-material-accordion-panel>
      <lit-material-accordion-panel id="c" disabled
        ><span slot="header">C</span><p>Panel C</p></lit-material-accordion-panel
      >
    </lit-material-accordion>
  `);
  const [a, b, c] = Array.from(el.querySelectorAll("lit-material-accordion-panel")) as LitMaterialAccordionPanel[];
  return { el, a: a!, b: b!, c: c! };
}

function headerOf(panel: LitMaterialAccordionPanel): HTMLButtonElement {
  return panel.shadowRoot!.querySelector("button.header") as HTMLButtonElement;
}

describe("lit-material-accordion", () => {
  it("defaults to single-expand: opening one panel closes any other open panel", async () => {
    const { a, b } = await accordionFixture();
    headerOf(a).click();
    await a.updateComplete;
    expect(a.expanded).to.be.true;

    headerOf(b).click();
    await a.updateComplete;
    await b.updateComplete;
    expect(b.expanded).to.be.true;
    expect(a.expanded).to.be.false;
  });

  it("allows multiple panels open at once when multi is set", async () => {
    const { a, b } = await accordionFixture(true);
    headerOf(a).click();
    await a.updateComplete;
    headerOf(b).click();
    await a.updateComplete;
    await b.updateComplete;
    expect(a.expanded).to.be.true;
    expect(b.expanded).to.be.true;
  });

  it("collapsing a panel does not affect siblings", async () => {
    const { a, b } = await accordionFixture();
    headerOf(a).click();
    await a.updateComplete;
    headerOf(a).click();
    await a.updateComplete;
    await b.updateComplete;
    expect(a.expanded).to.be.false;
    expect(b.expanded).to.be.false;
  });

  it("moves focus across panel headers with ArrowDown/ArrowUp, skipping disabled panels, wrapping around", async () => {
    const { a, b } = await accordionFixture();
    headerOf(a).focus();
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(b);

    // c is disabled — wraps back to a instead.
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(a);

    await sendKeys({ press: "ArrowUp" });
    expect(document.activeElement).to.equal(b);
  });

  it("jumps to the first/last enabled panel with Home/End", async () => {
    const { a, b } = await accordionFixture();
    headerOf(b).focus();
    await sendKeys({ press: "Home" });
    expect(document.activeElement).to.equal(a);

    await sendKeys({ press: "End" });
    // c is disabled, so End lands on b, the last enabled panel.
    expect(document.activeElement).to.equal(b);
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await accordionFixture();
    await expect(el).to.be.accessible();
  });

  it("moves focus correctly even when the accordion itself is nested inside another shadow root", async () => {
    // document.activeElement retargets to the *outermost* shadow host once
    // focus is inside any nested shadow tree — it would never resolve to a
    // panel here. handleKeydown must scope its lookup via getRootNode()
    // (the tree the accordion and its panels actually share) instead.
    class TestAccordionWrapper extends HTMLElement {
      connectedCallback() {
        const root = this.attachShadow({ mode: "open" });
        root.innerHTML = `
          <lit-material-accordion>
            <lit-material-accordion-panel><span slot="header">X</span><p>Panel X</p></lit-material-accordion-panel>
            <lit-material-accordion-panel><span slot="header">Y</span><p>Panel Y</p></lit-material-accordion-panel>
          </lit-material-accordion>
        `;
      }
    }
    if (!customElements.get("test-accordion-wrapper")) {
      customElements.define("test-accordion-wrapper", TestAccordionWrapper);
    }

    const wrapper = document.createElement("test-accordion-wrapper") as InstanceType<typeof TestAccordionWrapper>;
    document.body.appendChild(wrapper);
    const accordion = wrapper.shadowRoot!.querySelector("lit-material-accordion") as LitMaterialAccordion;
    const panels = Array.from(
      accordion.querySelectorAll("lit-material-accordion-panel"),
    ) as LitMaterialAccordionPanel[];
    await Promise.all(panels.map((panel) => panel.updateComplete));

    panels[0]!.focus();
    expect(document.activeElement).to.not.equal(panels[1]);

    await sendKeys({ press: "ArrowDown" });
    expect(wrapper.shadowRoot!.activeElement).to.equal(panels[1]);

    wrapper.remove();
  });
});
