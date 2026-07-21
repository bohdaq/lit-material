import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./tree.js";
import "./tree-item.js";
import type { LitMaterialTree } from "./tree.js";
import type { LitMaterialTreeItem } from "./tree-item.js";

async function treeFixture(multiple = false) {
  const el = await fixture<LitMaterialTree>(html`
    <lit-material-tree ?multiple=${multiple}>
      <lit-material-tree-item id="docs">
        <span slot="label">Documents</span>
        <lit-material-tree-item id="resume">
          <span slot="label">Resume.pdf</span>
        </lit-material-tree-item>
        <lit-material-tree-item id="cover-letter" disabled>
          <span slot="label">Cover Letter.pdf</span>
        </lit-material-tree-item>
      </lit-material-tree-item>
      <lit-material-tree-item id="photos">
        <span slot="label">Photos</span>
      </lit-material-tree-item>
    </lit-material-tree>
  `);
  const byId = (id: string) => el.querySelector(`#${id}`) as LitMaterialTreeItem;
  return {
    el,
    docs: byId("docs"),
    resume: byId("resume"),
    coverLetter: byId("cover-letter"),
    photos: byId("photos"),
  };
}

describe("lit-material-tree", () => {
  it("sets role=tree, and aria-multiselectable only when multiple", async () => {
    const { el } = await treeFixture();
    expect(el.getAttribute("role")).to.equal("tree");
    expect(el.hasAttribute("aria-multiselectable")).to.be.false;

    const { el: multiEl } = await treeFixture(true);
    expect(multiEl.getAttribute("aria-multiselectable")).to.equal("true");
  });

  it("gives exactly one node tabindex=0 initially (the first top-level node)", async () => {
    const { docs, photos, resume } = await treeFixture();
    expect(docs.tabIndex).to.equal(0);
    expect(photos.tabIndex).to.equal(-1);
    expect(resume.tabIndex).to.equal(-1);
  });

  it("single-select: clicking a node selects it and deselects any other node anywhere in the tree", async () => {
    const { el, docs, resume, photos } = await treeFixture();
    docs.expanded = true;
    await docs.updateComplete;

    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    (resume.shadowRoot!.querySelector(".row") as HTMLElement).click();
    await el.updateComplete;
    expect(resume.selected).to.be.true;
    expect(changeEvent).to.exist;

    changeEvent = undefined;
    (photos.shadowRoot!.querySelector(".row") as HTMLElement).click();
    await el.updateComplete;
    expect(photos.selected).to.be.true;
    expect(resume.selected).to.be.false;
    expect(changeEvent).to.exist;
  });

  it("multi-select: each click toggles that node independently", async () => {
    const { docs, photos } = await treeFixture(true);
    (docs.shadowRoot!.querySelector(".row") as HTMLElement).click();
    (photos.shadowRoot!.querySelector(".row") as HTMLElement).click();
    expect(docs.selected).to.be.true;
    expect(photos.selected).to.be.true;

    (docs.shadowRoot!.querySelector(".row") as HTMLElement).click();
    expect(docs.selected).to.be.false;
    expect(photos.selected).to.be.true;
  });

  it("does not select a disabled node", async () => {
    const { docs, coverLetter } = await treeFixture();
    docs.expanded = true;
    await docs.updateComplete;
    (coverLetter.shadowRoot!.querySelector(".row") as HTMLElement).click();
    expect(coverLetter.selected).to.be.false;
  });

  it("ArrowDown/ArrowUp move focus across visible nodes only, skipping a disabled node, without wrapping", async () => {
    const { docs, resume, photos } = await treeFixture();
    docs.expanded = true;
    await docs.updateComplete;
    docs.focus();

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(resume);

    // cover-letter (disabled) is skipped — next stop is photos.
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(photos);

    // No wrapping past the last node (unlike lit-material-tabs).
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(photos);

    await sendKeys({ press: "ArrowUp" });
    expect(document.activeElement).to.equal(resume);
  });

  it("ArrowDown does not descend into a collapsed node's children", async () => {
    const { docs, photos } = await treeFixture();
    docs.focus();
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(photos);
  });

  it("ArrowRight expands a collapsed branch without moving focus, then moves into it on a second press", async () => {
    const { docs, resume } = await treeFixture();
    docs.focus();
    await sendKeys({ press: "ArrowRight" });
    expect(docs.expanded).to.be.true;
    expect(document.activeElement).to.equal(docs);

    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(resume);
  });

  it("ArrowRight on a leaf node does nothing", async () => {
    const { photos } = await treeFixture();
    photos.focus();
    await sendKeys({ press: "ArrowRight" });
    expect(photos.expanded).to.be.false;
  });

  it("ArrowLeft collapses an expanded branch without moving focus, then moves to the parent on a second press", async () => {
    const { docs, resume } = await treeFixture();
    docs.expanded = true;
    await docs.updateComplete;
    resume.focus();

    await sendKeys({ press: "ArrowLeft" });
    // resume is a leaf with a parent — moves focus to docs.
    expect(document.activeElement).to.equal(docs);

    await sendKeys({ press: "ArrowLeft" });
    expect(docs.expanded).to.be.false;
    expect(document.activeElement).to.equal(docs);
  });

  it("Home/End jump to the first/last visible enabled node", async () => {
    const { docs, resume, photos } = await treeFixture();
    docs.expanded = true;
    await docs.updateComplete;
    resume.focus();

    await sendKeys({ press: "End" });
    expect(document.activeElement).to.equal(photos);

    await sendKeys({ press: "Home" });
    expect(document.activeElement).to.equal(docs);
  });

  it("Enter/Space select the focused node", async () => {
    const { photos } = await treeFixture();
    photos.focus();
    await sendKeys({ press: "Enter" });
    expect(photos.selected).to.be.true;
  });

  it("moving focus with arrow keys updates which node has tabindex=0", async () => {
    const { docs, photos } = await treeFixture();
    docs.focus();
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(photos);
    expect(photos.tabIndex).to.equal(0);
    expect(docs.tabIndex).to.equal(-1);
  });

  it("passes axe accessibility checks", async () => {
    const { el, docs } = await treeFixture();
    docs.expanded = true;
    await docs.updateComplete;
    await expect(el).to.be.accessible();
  });
});
