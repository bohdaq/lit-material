import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import "./checklist.js";
import type { LitMaterialChecklist, LitMaterialChecklistItem } from "./checklist.js";

const checklist = (key = "") =>
  fixture<LitMaterialChecklist>(html`<lit-material-checklist heading="Get started" dismissible storage-key=${key}>
    <lit-material-checklist-item label="Install the CLI" done>Run the installer.</lit-material-checklist-item>
    <lit-material-checklist-item label="Share a workspace">Run hitop sync init.</lit-material-checklist-item>
    <lit-material-checklist-item label="Invite a teammate">Open Members.</lit-material-checklist-item>
  </lit-material-checklist>`);
const items = (el: LitMaterialChecklist) => [...el.querySelectorAll<LitMaterialChecklistItem>("lit-material-checklist-item")];
const count = (el: LitMaterialChecklist) => el.shadowRoot!.querySelector(".count")!.textContent!.trim();
const settle = async (el: LitMaterialChecklist) => {
  await new Promise((r) => setTimeout(r, 0));
  await el.updateComplete;
  await Promise.all(items(el).map((i) => i.updateComplete));
};

describe("lit-material-checklist", () => {
  afterEach(() => localStorage.removeItem("test-checklist"));

  it("counts done tasks and fills the bar", async () => {
    const el = await checklist();
    await settle(el);
    expect(count(el)).to.equal("1 of 3 done");
    const bar = el.shadowRoot!.querySelector("[role=progressbar]")!;
    expect(bar.getAttribute("aria-valuenow")).to.equal("1");
    expect(bar.getAttribute("aria-valuemax")).to.equal("3");
  });

  it("opens the next task to do, and moves on when it's done", async () => {
    const el = await checklist();
    await settle(el);
    expect(items(el).map((i) => i.expanded)).to.deep.equal([false, true, false]);
    items(el)[1]!.done = true;
    await settle(el);
    expect(items(el).map((i) => i.expanded)).to.deep.equal([false, false, true]);
    expect(count(el)).to.equal("2 of 3 done");
  });

  it("lets the reader open and close tasks", async () => {
    const el = await checklist();
    await settle(el);
    const first = items(el)[0]!;
    const toggle = first.shadowRoot!.querySelector("button")!;
    toggle.click();
    await settle(el);
    expect(first.expanded).to.be.true;
    expect(toggle.getAttribute("aria-expanded")).to.equal("true");
    expect(toggle.textContent).to.contain("Done");
  });

  it("dismisses, remembers it, and stays hidden next time", async () => {
    const el = await checklist("test-checklist");
    const gone = oneEvent(el, "dismiss");
    el.shadowRoot!.querySelector<HTMLButtonElement>(".dismiss")!.click();
    await gone;
    expect(el.hidden).to.be.true;
    const again = await checklist("test-checklist");
    expect(again.hidden).to.be.true;
  });

  it("is accessible", async () => {
    const el = await checklist();
    await settle(el);
    await expect(el).to.be.accessible();
  });
});

describe("lit-material-checklist-item layout", () => {
  it("keeps its icons small, whatever the page's styles", async () => {
    const el = await fixture<LitMaterialChecklist>(html`<lit-material-checklist><lit-material-checklist-item label="One"></lit-material-checklist-item></lit-material-checklist>`);
    const item = el.querySelector<LitMaterialChecklistItem>("lit-material-checklist-item")!;
    await item.updateComplete;
    for (const svg of item.shadowRoot!.querySelectorAll("svg")) expect(svg.getBoundingClientRect().width).to.be.at.most(24);
    expect(item.getBoundingClientRect().height).to.be.below(80);
  });
});
