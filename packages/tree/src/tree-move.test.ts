import { expect, fixture, html } from "@open-wc/testing";
import { render } from "lit";
import { repeat } from "lit/directives/repeat.js";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./tree.js";
import "./tree-item.js";
import type { LitMaterialTree, TreeMoveDetail } from "./tree.js";
import type { LitMaterialTreeItem } from "./tree-item.js";

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));

async function folders(dir: "ltr" | "rtl" = "ltr") {
  const wrap = await fixture<HTMLElement>(html`
    <div dir=${dir}>
      <lit-material-tree reorderable>
        <lit-material-tree-item id="src" droppable expanded>
          <span slot="label">src</span>
          <lit-material-tree-item id="a"><span slot="label">a.ts</span></lit-material-tree-item>
          <lit-material-tree-item id="b"><span slot="label">b.ts</span></lit-material-tree-item>
        </lit-material-tree-item>
        <lit-material-tree-item id="docs" droppable><span slot="label">docs</span></lit-material-tree-item>
        <lit-material-tree-item id="readme"><span slot="label">README.md</span></lit-material-tree-item>
      </lit-material-tree>
      <button id="after">after</button>
    </div>
  `);
  const el = wrap.querySelector("lit-material-tree") as LitMaterialTree;
  const items = Array.from(el.querySelectorAll("lit-material-tree-item")) as LitMaterialTreeItem[];
  await Promise.all(items.map((i) => i.updateComplete));
  const byId = (id: string) => el.querySelector(`#${id}`) as LitMaterialTreeItem;
  const moves: { item: string; target: string; place: string }[] = [];
  el.addEventListener("move", (e) => {
    const d = (e as CustomEvent<TreeMoveDetail>).detail;
    moves.push({ item: d.item.id, target: d.target.id, place: d.place });
  });
  return { el, byId, moves };
}

const rowOf = (item: LitMaterialTreeItem) => item.shadowRoot!.querySelector(".row")!.getBoundingClientRect();

function drag(item: LitMaterialTreeItem, toY: number, { up = true } = {}) {
  const r = rowOf(item);
  const x = r.left + 40;
  item.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, button: 0, pointerId: 5, clientX: x, clientY: r.top + 5 }));
  window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 5, clientX: x, clientY: toY }));
  if (up) window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 5, clientX: x, clientY: toY }));
}

describe("lit-material-tree move (drag and drop)", () => {
  it("drops a node inside a droppable node (middle of its row)", async () => {
    const { el, byId, moves } = await folders();
    let reordered = false;
    el.addEventListener("reorder", () => (reordered = true));
    const docs = rowOf(byId("docs"));
    drag(byId("readme"), docs.top + docs.height / 2);
    expect(moves).to.deep.equal([{ item: "readme", target: "docs", place: "inside" }]);
    expect(reordered).to.be.false;
    expect(el.querySelector("#readme")!.parentElement).to.equal(el, "the element moves nothing itself");
  });

  it("drops before a node in another parent (top quarter)", async () => {
    const { byId, moves } = await folders();
    const a = rowOf(byId("a"));
    drag(byId("readme"), a.top + 2);
    expect(moves).to.deep.equal([{ item: "readme", target: "a", place: "before" }]);
  });

  it("fires move, then reorder, for a drop among the same siblings; cancelling move stops reorder", async () => {
    const { el, byId, moves } = await folders();
    const order: string[] = [];
    el.addEventListener("move", () => order.push("move"));
    el.addEventListener("reorder", (e) => order.push(`reorder ${(e as CustomEvent).detail.from}->${(e as CustomEvent).detail.to}`));
    const readme = rowOf(byId("readme"));
    drag(byId("src"), readme.bottom - 2);
    expect(moves).to.deep.equal([{ item: "src", target: "readme", place: "after" }]);
    expect(order).to.deep.equal(["move", "reorder 0->2"]);

    order.length = 0;
    el.addEventListener("move", (e) => e.preventDefault(), { once: true });
    drag(byId("src"), readme.bottom - 2);
    expect(order).to.deep.equal(["move"]);
  });

  it("drops nowhere when released beside or far below the tree", async () => {
    const { el, byId, moves } = await folders();
    el.style.width = "300px";
    const docs = rowOf(byId("docs"));
    const r = rowOf(byId("readme"));
    const x = r.left + 40;
    byId("readme").dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, button: 0, pointerId: 6, clientX: x, clientY: r.top + 5 }));
    window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 6, clientX: x, clientY: r.top + 40 }));
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 6, clientX: 600, clientY: docs.top + docs.height / 2 }));
    drag(byId("readme"), el.getBoundingClientRect().bottom + 200);
    expect(moves).to.deep.equal([]);
  });

  it("won't drop a node into itself or its own children", async () => {
    const { byId, moves } = await folders();
    const b = rowOf(byId("b"));
    drag(byId("src"), b.top + b.height / 2);
    expect(moves).to.deep.equal([]);
  });

  it("shows a drop line and a ghost while dragging, and Escape cancels", async () => {
    const { el, byId, moves } = await folders();
    const readme = rowOf(byId("readme"));
    drag(byId("a"), readme.top + 2, { up: false });
    await el.updateComplete;
    const line = el.shadowRoot!.querySelector(".drop-line") as HTMLElement;
    const ghost = el.shadowRoot!.querySelector(".ghost") as HTMLElement;
    expect(line.hidden).to.be.false;
    expect(Math.abs(line.getBoundingClientRect().top - readme.top)).to.be.below(3);
    expect(ghost.hidden).to.be.false;
    expect(ghost.textContent).to.equal("a.ts");
    expect(byId("a").hasAttribute("dragging")).to.be.true;
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    await el.updateComplete;
    expect(line.hidden).to.be.true;
    expect(byId("a").hasAttribute("dragging")).to.be.false;
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 5, clientX: 10, clientY: readme.top + 2 }));
    expect(moves).to.deep.equal([]);
    expect(el.announcement).to.equal("Move cancelled");
  });

  it("highlights a droppable row for an inside drop", async () => {
    const { el, byId } = await folders();
    const docs = rowOf(byId("docs"));
    drag(byId("readme"), docs.top + docs.height / 2, { up: false });
    expect(byId("docs").hasAttribute("drop-target")).to.be.true;
    el.endDrag();
    expect(byId("docs").hasAttribute("drop-target")).to.be.false;
  });

  it("scrolls its scrolling container while dragging near the edge", async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div style="height: 120px; overflow: auto;">
        <lit-material-tree reorderable>
          ${Array.from({ length: 20 }, (_, i) => html`<lit-material-tree-item id=${`n${i}`}><span slot="label">Node ${i}</span></lit-material-tree-item>`)}
        </lit-material-tree>
      </div>
    `);
    const el = wrap.querySelector("lit-material-tree") as LitMaterialTree;
    await Promise.all(Array.from(el.querySelectorAll("lit-material-tree-item")).map((i) => (i as LitMaterialTreeItem).updateComplete));
    const box = wrap.getBoundingClientRect();
    drag(el.querySelector("#n0") as LitMaterialTreeItem, box.bottom - 4, { up: false });
    await frames();
    await frames();
    expect(wrap.scrollTop).to.be.above(0);
    el.endDrag();
  });
});

describe("lit-material-tree move (keyboard)", () => {
  it("Alt+ArrowDown moves past the next sibling, keeps focus on a node the app really moves, and announces it", async () => {
    const host = await fixture<HTMLElement>(html`<div></div>`);
    let data = ["alpha", "beta", "gamma"];
    const draw = () =>
      render(
        html`<lit-material-tree reorderable @move=${onMove}>
          ${repeat(
            data,
            (d) => d,
            (d) => html`<lit-material-tree-item id=${d}><span slot="label">${d}</span></lit-material-tree-item>`,
          )}
        </lit-material-tree>`,
        host,
      );
    function onMove(e: CustomEvent<TreeMoveDetail>) {
      const { item, target, place } = e.detail;
      const rest = data.filter((d) => d !== item.id);
      const at = rest.indexOf(target.id) + (place === "after" ? 1 : 0);
      data = [...rest.slice(0, at), item.id, ...rest.slice(at)];
      draw();
    }
    draw();
    const el = host.querySelector("lit-material-tree") as LitMaterialTree;
    const alpha = host.querySelector("#alpha") as LitMaterialTreeItem;
    await alpha.updateComplete;
    alpha.focus();
    await sendKeys({ press: "Alt+ArrowDown" });
    await frames();
    expect(data).to.deep.equal(["beta", "alpha", "gamma"]);
    expect(document.activeElement).to.equal(alpha);
    expect(el.announcement).to.equal("alpha moved after beta");
    await sendKeys({ press: "Alt+ArrowDown" });
    await frames();
    expect(data).to.deep.equal(["beta", "gamma", "alpha"]);
    expect(document.activeElement).to.equal(alpha);
    expect(alpha.tabIndex).to.equal(0);
    expect(alpha.getAttribute("aria-posinset")).to.equal("3");
    await sendKeys({ press: "Alt+ArrowDown" });
    expect(el.announcement).to.equal("alpha can't move that way");
  });

  it("Alt+ArrowRight moves into the droppable node above (and opens it); Alt+ArrowLeft moves out of the parent", async () => {
    const { byId, moves } = await folders();
    byId("readme").focus();
    await sendKeys({ press: "Alt+ArrowRight" });
    expect(moves).to.deep.equal([{ item: "readme", target: "docs", place: "inside" }]);
    expect(byId("docs").expanded).to.be.true;
    byId("a").focus();
    await sendKeys({ press: "Alt+ArrowLeft" });
    expect(moves[1]).to.deep.equal({ item: "a", target: "src", place: "after" });
    await sendKeys({ press: "Alt+ArrowUp" });
    expect(moves.length).to.equal(2, "nothing above the first child");
  });

  it("flips Alt+ArrowLeft/Right right to left", async () => {
    const { byId, moves } = await folders("rtl");
    byId("readme").focus();
    await sendKeys({ press: "Alt+ArrowLeft" });
    expect(moves).to.deep.equal([{ item: "readme", target: "docs", place: "inside" }]);
  });

  it("does nothing without reorderable", async () => {
    const { el, byId, moves } = await folders();
    el.reorderable = false;
    await el.updateComplete;
    byId("readme").focus();
    await sendKeys({ press: "Alt+ArrowUp" });
    const docs = rowOf(byId("docs"));
    drag(byId("readme"), docs.top + docs.height / 2);
    expect(moves).to.deep.equal([]);
    expect(el.hasAttribute("aria-description")).to.be.false;
  });

  it("describes the keys and translates the announcements", async () => {
    registerTranslation({
      $code: "x-tree-move",
      "tree.moveHint": "Alt+Pfeiltasten verschieben",
      "tree.movedInside": "{item} nach {target} verschoben",
    });
    const { el, byId } = await folders();
    el.setAttribute("lang", "x-tree-move");
    el.requestUpdate();
    await el.updateComplete;
    expect(el.getAttribute("aria-description")).to.equal("Alt+Pfeiltasten verschieben");
    byId("readme").focus();
    await sendKeys({ press: "Alt+ArrowRight" });
    expect(el.announcement).to.equal("README.md nach docs verschoben");
  });

  it("re-indents a node the app moves into another node", async () => {
    const { byId } = await folders();
    const readme = byId("readme");
    byId("docs").append(readme);
    await readme.updateComplete;
    expect(readme.getAttribute("aria-level")).to.equal("2");
    const pad = parseFloat(getComputedStyle(readme.shadowRoot!.querySelector(".row")!).paddingInlineStart);
    expect(pad).to.equal(32);
  });

  it("is accessible while reorderable", async () => {
    const { el } = await folders();
    await expect(el).to.be.accessible();
  });
});
