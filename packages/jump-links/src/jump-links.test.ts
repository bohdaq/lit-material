import { expect, fixture, html } from "@open-wc/testing";
import "./jump-links.js";
import type { LitMaterialJumpLinks } from "./jump-links.js";

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

async function page() {
  const host = await fixture<HTMLDivElement>(html`<div>
    <lit-material-jump-links for="doc"></lit-material-jump-links>
    <article id="doc">
      <h2 id="install">Install</h2><div style="height: 1200px"></div>
      <h3 id="docker">Docker</h3><div style="height: 1200px"></div>
      <h2 id="config">Config</h2><div style="height: 1200px"></div>
    </article>
  </div>`);
  const el = host.querySelector("lit-material-jump-links") as LitMaterialJumpLinks;
  await el.updateComplete;
  return el;
}
const links = (el: LitMaterialJumpLinks) => Array.from(el.shadowRoot!.querySelectorAll("a"));

describe("lit-material-jump-links", () => {
  afterEach(() => window.scrollTo(0, 0));

  it("collects headings with ids into plain anchor links", async () => {
    const el = await page();
    expect(links(el).map((a) => [a.getAttribute("href"), a.textContent])).to.deep.equal([
      ["#install", "Install"],
      ["#docker", "Docker"],
      ["#config", "Config"],
    ]);
    expect(el.shadowRoot!.querySelector("nav")!.getAttribute("aria-label")).to.equal("On this page");
    expect(links(el)[1]!.getAttribute("style")).to.include("--indent: 12px");
  });

  it("marks the section in view as current", async () => {
    const el = await page();
    await frames();
    expect(links(el)[0]!.getAttribute("aria-current")).to.equal("location");
    document.getElementById("docker")!.scrollIntoView();
    await frames();
    await el.updateComplete;
    expect(links(el)[1]!.getAttribute("aria-current")).to.equal("location");
    expect(links(el)[0]!.hasAttribute("aria-current")).to.be.false;
  });

  it("takes explicit links", async () => {
    const el = await fixture<LitMaterialJumpLinks>(
      html`<lit-material-jump-links label="" .links=${[{ id: "a", text: "A" }, { id: "b", text: "B" }]}></lit-material-jump-links>`,
    );
    expect(links(el)).to.have.length(2);
    expect(el.shadowRoot!.querySelector(".title")).to.be.null;
  });

  it("follows headings added later", async () => {
    const el = await page();
    const h = document.createElement("h2");
    h.id = "faq";
    h.textContent = "FAQ";
    document.getElementById("doc")!.append(h);
    await frames();
    await el.updateComplete;
    expect(links(el).map((a) => a.textContent)).to.include("FAQ");
  });

  it("renders nothing without links", async () => {
    const el = await fixture<LitMaterialJumpLinks>(html`<lit-material-jump-links></lit-material-jump-links>`);
    expect(el.shadowRoot!.querySelector("nav")).to.be.null;
  });

  it("finds sections in its own shadow root", async () => {
    const outer = await fixture<HTMLDivElement>(html`<div></div>`);
    const root = outer.attachShadow({ mode: "open" });
    root.innerHTML = `<lit-material-jump-links for="doc"></lit-material-jump-links>
      <article id="doc"><h2 id="a">A</h2><div style="height: 1500px"></div><h2 id="b">B</h2><div style="height: 1500px"></div></article>`;
    const el = root.querySelector("lit-material-jump-links") as LitMaterialJumpLinks;
    await el.updateComplete;
    expect(links(el)).to.have.length(2);
    root.getElementById("b")!.scrollIntoView();
    await frames();
    await el.updateComplete;
    expect(el.current).to.equal("b");
  });
});
