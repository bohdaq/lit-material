import { expect, fixture, html } from "@open-wc/testing";
import "./back-to-top.js";
import type { LitMaterialBackToTop } from "./back-to-top.js";

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
const link = (el: LitMaterialBackToTop) => el.shadowRoot!.querySelector("a")!;

describe("lit-material-back-to-top", () => {
  let page: HTMLElement;
  beforeEach(async () => {
    page = await fixture<HTMLElement>(html`<div><h1 id="top-heading">Title</h1><div style="height: 4000px"></div></div>`);
    window.scrollTo(0, 0);
    await frames();
  });
  afterEach(() => window.scrollTo(0, 0));

  it("stays hidden and out of the tab order near the top", async () => {
    const el = await fixture<LitMaterialBackToTop>(html`<lit-material-back-to-top target="top-heading"></lit-material-back-to-top>`);
    expect(el.visible).to.be.false;
    expect(link(el).getAttribute("tabindex")).to.equal("-1");
    expect(link(el).getAttribute("aria-hidden")).to.equal("true");
    expect(getComputedStyle(el).visibility).to.equal("hidden");
  });

  it("appears past the threshold", async () => {
    const el = await fixture<LitMaterialBackToTop>(html`<lit-material-back-to-top threshold="200" target="top-heading"></lit-material-back-to-top>`);
    window.scrollTo(0, 600);
    await frames();
    expect(el.visible).to.be.true;
    expect(el.hasAttribute("visible")).to.be.true;
    expect(link(el).getAttribute("tabindex")).to.equal("0");
    expect(link(el).getAttribute("href")).to.equal("#top-heading");
  });

  it("returns to the target and moves focus there", async () => {
    const el = await fixture<LitMaterialBackToTop>(html`<lit-material-back-to-top threshold="200" target="top-heading"></lit-material-back-to-top>`);
    window.scrollTo(0, 2000);
    await frames();
    link(el).click();
    const heading = page.querySelector("h1")!;
    expect(document.activeElement).to.equal(heading);
    expect(heading.getAttribute("tabindex")).to.equal("-1");
    await new Promise((r) => setTimeout(r, 800));
    expect(window.scrollY).to.be.below(200);
  });

  it("scrolls the window to the top without a target", async () => {
    const el = await fixture<LitMaterialBackToTop>(html`<lit-material-back-to-top threshold="200"></lit-material-back-to-top>`);
    window.scrollTo(0, 1500);
    await frames();
    link(el).click();
    await new Promise((r) => setTimeout(r, 800));
    expect(window.scrollY).to.equal(0);
  });
});
