import { expect, fixture, html } from "@open-wc/testing";
import "./truncate.js";
import type { LitMaterialTruncate } from "./truncate.js";

const ID = "sha256:9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08";
const frame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

describe("lit-material-truncate", () => {
  it("keeps the full text in the DOM", async () => {
    const el = await fixture<LitMaterialTruncate>(html`<lit-material-truncate position="middle" .value=${ID}></lit-material-truncate>`);
    expect(el.shadowRoot!.textContent).to.equal(ID);
    expect(el.shadowRoot!.querySelector(".tail")!.textContent).to.equal(ID.slice(-8));
  });

  it("marks itself truncated with a title when it doesn't fit", async () => {
    const el = await fixture<LitMaterialTruncate>(html`<div style="width: 120px"><lit-material-truncate .value=${ID}></lit-material-truncate></div>`);
    const t = el.querySelector("lit-material-truncate")!;
    await frame();
    expect(t.truncated).to.be.true;
    expect(t.getAttribute("title")).to.equal(ID);
    expect(t.getBoundingClientRect().width).to.be.at.most(120);
  });

  it("shows the tail whole in the middle position", async () => {
    const el = await fixture<HTMLElement>(html`<div style="width: 160px"><lit-material-truncate position="middle" .value=${ID}></lit-material-truncate></div>`);
    const t = el.querySelector("lit-material-truncate")!;
    await frame();
    const tail = t.shadowRoot!.querySelector<HTMLElement>(".tail")!;
    expect(tail.scrollWidth).to.equal(tail.clientWidth);
    expect(t.truncated).to.be.true;
  });

  it("isn't truncated when it fits, and drops the title again", async () => {
    const el = await fixture<HTMLElement>(html`<div style="width: 120px"><lit-material-truncate .value=${ID}></lit-material-truncate></div>`);
    const t = el.querySelector("lit-material-truncate") as LitMaterialTruncate;
    await frame();
    t.value = "short";
    await t.updateComplete;
    await frame();
    expect(t.truncated).to.be.false;
    expect(t.hasAttribute("title")).to.be.false;
  });

  it("doesn't split text shorter than the tail", async () => {
    const el = await fixture<LitMaterialTruncate>(html`<lit-material-truncate position="middle" value="abc"></lit-material-truncate>`);
    expect(el.shadowRoot!.querySelector(".tail")).to.be.null;
  });

  it("leaves a title the page set", async () => {
    const el = await fixture<HTMLElement>(html`<div style="width: 60px"><lit-material-truncate title="Image digest" .value=${ID}></lit-material-truncate></div>`);
    const t = el.querySelector("lit-material-truncate")!;
    await frame();
    expect(t.getAttribute("title")).to.equal("Image digest");
  });
});
