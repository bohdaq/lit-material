import { expect, fixture, html } from "@open-wc/testing";
import "./tree-item.js";
import "./tree.js";
import type { LitMaterialTreeItem } from "./tree-item.js";

async function itemFixture() {
  const el = await fixture<LitMaterialTreeItem>(html`
    <lit-material-tree-item>
      <span slot="label">Documents</span>
      <lit-material-tree-item>
        <span slot="label">Resume.pdf</span>
      </lit-material-tree-item>
    </lit-material-tree-item>
  `);
  return el;
}

describe("lit-material-tree-item", () => {
  it("sets role=treeitem and a default tabindex=-1 on itself", async () => {
    const el = await itemFixture();
    expect(el.getAttribute("role")).to.equal("treeitem");
    expect(el.tabIndex).to.equal(-1);
  });

  it("reports hasChildren/depth correctly", async () => {
    const el = await itemFixture();
    expect(el.hasChildren).to.be.true;
    expect(el.depth).to.equal(0);
    const child = el.querySelector("lit-material-tree-item") as LitMaterialTreeItem;
    expect(child.hasChildren).to.be.false;
    expect(child.depth).to.equal(1);
  });

  it("renders a chevron only when it has children", async () => {
    const el = await itemFixture();
    expect(el.shadowRoot!.querySelector(".chevron:not(.spacer)")).to.exist;
    const child = el.querySelector("lit-material-tree-item") as LitMaterialTreeItem;
    expect(child.shadowRoot!.querySelector(".chevron.spacer")).to.exist;
    expect(child.shadowRoot!.querySelector(".chevron:not(.spacer)")).to.not.exist;
  });

  it("toggles expanded on chevron click and dispatches toggle, without dispatching tree-item-select", async () => {
    const el = await itemFixture();
    const chevron = el.shadowRoot!.querySelector(".chevron") as HTMLButtonElement;

    let toggleEvent: Event | undefined;
    let selectEvent: Event | undefined;
    el.addEventListener("toggle", (event) => (toggleEvent = event));
    el.addEventListener("tree-item-select", (event) => (selectEvent = event));

    chevron.click();
    await el.updateComplete;

    expect(el.expanded).to.be.true;
    expect(toggleEvent).to.exist;
    expect((toggleEvent as CustomEvent).detail.expanded).to.be.true;
    expect(selectEvent).to.not.exist;
  });

  it("hides the children group when collapsed, shows it when expanded", async () => {
    const el = await itemFixture();
    const group = el.shadowRoot!.querySelector(".group") as HTMLElement;
    expect(group.hidden).to.be.true;
    el.expanded = true;
    await el.updateComplete;
    expect(group.hidden).to.be.false;
  });

  it("dispatches tree-item-select when the row (not the chevron) is clicked", async () => {
    const el = await itemFixture();
    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;
    let selectEvent: Event | undefined;
    el.addEventListener("tree-item-select", (event) => (selectEvent = event));
    row.click();
    expect(selectEvent).to.exist;
  });

  it("reflects aria-selected/aria-expanded/aria-disabled", async () => {
    const el = await itemFixture();
    expect(el.getAttribute("aria-selected")).to.equal("false");
    expect(el.getAttribute("aria-expanded")).to.equal("false");

    el.selected = true;
    el.expanded = true;
    el.disabled = true;
    await el.updateComplete;
    expect(el.getAttribute("aria-selected")).to.equal("true");
    expect(el.getAttribute("aria-expanded")).to.equal("true");
    expect(el.getAttribute("aria-disabled")).to.equal("true");
  });

  it("does not toggle or dispatch tree-item-select when disabled", async () => {
    const el = await itemFixture();
    el.disabled = true;
    await el.updateComplete;
    const chevron = el.shadowRoot!.querySelector(".chevron") as HTMLButtonElement;
    const row = el.shadowRoot!.querySelector(".row") as HTMLElement;

    let events = 0;
    el.addEventListener("toggle", () => events++);
    el.addEventListener("tree-item-select", () => events++);
    chevron.click();
    row.click();
    expect(events).to.equal(0);
    expect(el.expanded).to.be.false;
  });

  it("passes axe accessibility checks (wrapped in a tree — role=treeitem requires a tree/group ancestor)", async () => {
    const tree = await fixture(html`
      <lit-material-tree>
        <lit-material-tree-item expanded>
          <span slot="label">Documents</span>
          <lit-material-tree-item>
            <span slot="label">Resume.pdf</span>
          </lit-material-tree-item>
        </lit-material-tree-item>
      </lit-material-tree>
    `);
    await expect(tree).to.be.accessible();
  });
});
