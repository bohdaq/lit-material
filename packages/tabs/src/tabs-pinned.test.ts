import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./tabs.js";
import "./tab.js";
import type { LitMaterialTabs, TabDragDetail } from "./tabs.js";
import type { LitMaterialTab } from "./tab.js";

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => requestAnimationFrame(r))));

/** One, Two (pinned, second in the document), Three. */
async function strip(dir: "ltr" | "rtl" = "ltr") {
  const wrap = await fixture<HTMLElement>(html`
    <div dir=${dir} style="width: 600px">
      <lit-material-tabs reorderable>
        <lit-material-tab closable>One</lit-material-tab>
        <lit-material-tab closable pinned>Two</lit-material-tab>
        <lit-material-tab closable>Three</lit-material-tab>
      </lit-material-tabs>
      <div id="drop" style="height: 80px; margin-top: 60px">drop here</div>
    </div>
  `);
  const el = wrap.querySelector("lit-material-tabs") as LitMaterialTabs;
  const tabs = Array.from(el.querySelectorAll("lit-material-tab")) as LitMaterialTab[];
  await Promise.all(tabs.map((t) => t.updateComplete));
  await new Promise((r) => setTimeout(r));
  const reorders: { from: number; to: number }[] = [];
  el.addEventListener("reorder", (e) => reorders.push((e as CustomEvent).detail));
  return { wrap, el, tabs, reorders, drop: wrap.querySelector("#drop") as HTMLElement };
}

function press(tab: LitMaterialTab, id = 9) {
  const r = tab.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  tab.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, button: 0, pointerId: id, clientX: x, clientY: y }));
  return {
    to(cx: number, cy: number) {
      window.dispatchEvent(new PointerEvent("pointermove", { pointerId: id, clientX: cx, clientY: cy }));
    },
    up(cx: number, cy: number) {
      window.dispatchEvent(new PointerEvent("pointerup", { pointerId: id, clientX: cx, clientY: cy }));
    },
  };
}

describe("lit-material-tab pinned", () => {
  it("shows first with a pin and no close button; Delete doesn't close it", async () => {
    const { tabs } = await strip();
    const [one, two] = tabs;
    expect(two!.getBoundingClientRect().left).to.be.below(one!.getBoundingClientRect().left);
    expect(two!.shadowRoot!.querySelector(".pin")).to.exist;
    expect(two!.shadowRoot!.querySelector(".close")).to.be.null;
    expect(one!.shadowRoot!.querySelector(".close")).to.exist;
    let closed = false;
    two!.addEventListener("close", () => (closed = true));
    expect(two!.requestClose()).to.be.false;
    two!.dispatchEvent(new KeyboardEvent("keydown", { key: "Delete", bubbles: true }));
    expect(closed).to.be.false;
    expect(two!.shadowRoot!.querySelector("button")!.getAttribute("aria-description")).to.equal("Pinned");
  });

  it("stays compact in a strip whose tabs share the width", async () => {
    const { tabs } = await strip();
    expect(tabs[1]!.getBoundingClientRect().width).to.be.below(tabs[0]!.getBoundingClientRect().width - 20);
  });

  it("shows first right to left too", async () => {
    const { tabs } = await strip("rtl");
    expect(tabs[1]!.getBoundingClientRect().right).to.be.above(tabs[0]!.getBoundingClientRect().right);
  });

  it("arrow keys follow the order people see", async () => {
    const { el, tabs } = await strip();
    el.selected = 1;
    await el.updateComplete;
    tabs[1]!.focus();
    await sendKeys({ press: "ArrowRight" });
    expect(el.selected).to.equal(0, "after the pinned tab comes One");
    await sendKeys({ press: "Home" });
    expect(el.selected).to.equal(1, "Home is the pinned tab");
  });

  it("keeps unpinned tabs after pinned ones when moving by keyboard or drag", async () => {
    const { tabs, reorders } = await strip();
    tabs[0]!.focus();
    await sendKeys({ press: "Alt+Shift+ArrowLeft" });
    expect(reorders).to.deep.equal([], "One can't go before the pinned tab");
    const pinned = tabs[1]!.getBoundingClientRect();
    const drag = press(tabs[2]!);
    drag.to(pinned.left + 2, pinned.top + 5);
    drag.up(pinned.left + 2, pinned.top + 5);
    expect(reorders).to.deep.equal([{ from: 2, to: 0 }], "Three lands right after the pinned tab: before One in the document");
  });

  it("translates the pinned description", async () => {
    registerTranslation({ $code: "x-tabs-pin", "tabs.pinned": "Angeheftet", "tabs.pinnedUnsavedChanges": "Angeheftet. Ungespeichert" });
    const { tabs } = await strip();
    const two = tabs[1]!;
    two.setAttribute("lang", "x-tabs-pin");
    two.dirty = true;
    await two.updateComplete;
    expect(two.shadowRoot!.querySelector("button")!.getAttribute("aria-description")).to.equal("Angeheftet. Ungespeichert");
  });

  it("is accessible with a pinned tab", async () => {
    const { el } = await strip();
    await expect(el).to.be.accessible();
  });
});

describe("lit-material-tabs drop out", () => {
  it("fires tabdragout when a drag leaves the strip and tabdrop on the element it's released over", async () => {
    const { el, tabs, reorders, drop } = await strip();
    const outs: TabDragDetail[] = [];
    const drops: TabDragDetail[] = [];
    el.addEventListener("tabdragout", (e) => outs.push((e as CustomEvent<TabDragDetail>).detail));
    drop.addEventListener("tabdrop", (e) => {
      drops.push((e as CustomEvent<TabDragDetail>).detail);
      e.preventDefault();
    });
    const box = drop.getBoundingClientRect();
    const x = box.left + 20;
    const y = box.top + 20;
    const drag = press(tabs[2]!);
    drag.to(x, y);
    expect(outs.length).to.equal(1);
    expect(outs[0]).to.include({ index: 2, clientX: x, clientY: y, source: el, tab: tabs[2] });
    expect(tabs[2]!.hasAttribute("dragging-out")).to.be.true;
    drag.to(x + 5, y + 5);
    expect(outs.length).to.equal(1, "once per exit");
    drag.up(x, y);
    expect(drops.length).to.equal(1);
    expect(drops[0]).to.include({ index: 2, tab: tabs[2], source: el });
    expect(reorders).to.deep.equal([], "an accepted drop doesn't reorder");
    expect(tabs[2]!.hasAttribute("dragging")).to.be.false;
  });

  it("reorders as usual when nobody accepts the drop, and keeps the tab in when tabdragout is cancelled", async () => {
    const { el, tabs, reorders, drop } = await strip();
    let dropped = 0;
    drop.addEventListener("tabdrop", () => dropped++);
    const box = drop.getBoundingClientRect();
    const first = tabs[1]!.getBoundingClientRect();
    let drag = press(tabs[2]!);
    drag.to(first.left + 2, box.top + 20);
    drag.up(first.left + 2, box.top + 20);
    expect(dropped).to.equal(1);
    expect(reorders).to.deep.equal([{ from: 2, to: 0 }]);

    el.addEventListener("tabdragout", (e) => e.preventDefault());
    drag = press(tabs[2]!, 10);
    drag.to(first.left + 2, box.top + 20);
    expect(tabs[2]!.hasAttribute("dragging-out")).to.be.false;
    drag.up(first.left + 2, box.top + 20);
    expect(dropped).to.equal(1, "a cancelled drag-out drops nowhere else");
  });

  it("scrolls a scrollable row while dragging near its end", async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div style="width: 240px">
        <lit-material-tabs scrollable reorderable>
          ${[1, 2, 3, 4, 5, 6, 7, 8].map((i) => html`<lit-material-tab>Request ${i}</lit-material-tab>`)}
        </lit-material-tabs>
      </div>
    `);
    const el = wrap.querySelector("lit-material-tabs") as LitMaterialTabs;
    await new Promise((r) => setTimeout(r, 50));
    const scroller = el.shadowRoot!.querySelector(".scroller") as HTMLElement;
    const box = scroller.getBoundingClientRect();
    const tab = el.querySelector("lit-material-tab") as LitMaterialTab;
    const drag = press(tab);
    drag.to(box.right - 4, box.top + 10);
    await frames();
    await frames();
    expect(scroller.scrollLeft).to.be.above(0);
    el.endDrag();
    expect(tab.style.transform).to.equal("");
  });
});
