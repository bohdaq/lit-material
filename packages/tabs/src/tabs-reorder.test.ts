import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./tabs.js";
import "./tab.js";
import type { LitMaterialTabs } from "./tabs.js";

async function strip(reorderable = true) {
  const el = await fixture<LitMaterialTabs>(html`
    <lit-material-tabs ?reorderable=${reorderable}>
      <lit-material-tab>One</lit-material-tab>
      <lit-material-tab>Two</lit-material-tab>
      <lit-material-tab>Three</lit-material-tab>
    </lit-material-tabs>
  `);
  const tabs = Array.from(el.querySelectorAll("lit-material-tab"));
  await Promise.all(tabs.map((t) => t.updateComplete));
  await new Promise((r) => setTimeout(r));
  return { el, tabs };
}

describe("lit-material-tabs reorderable", () => {
  it("moves the focused tab with Alt+Shift+ArrowRight and fires reorder without moving it", async () => {
    const { el, tabs } = await strip();
    const events: { from: number; to: number }[] = [];
    el.addEventListener("reorder", (e) => events.push((e as CustomEvent).detail));
    tabs[0]!.focus();
    await sendKeys({ press: "Alt+Shift+ArrowRight" });
    expect(events).to.deep.equal([{ from: 0, to: 1 }]);
    expect(el.querySelector("lit-material-tab")).to.equal(tabs[0], "the app moves tabs, not the element");
    expect(el.selected).to.equal(0, "a reorder key doesn't change the selection");
    await sendKeys({ press: "Alt+Shift+ArrowLeft" });
    expect(events.length).to.equal(1, "nothing before the first tab");
  });

  it("fires reorder when a tab is dragged past another", async () => {
    const { el, tabs } = await strip();
    let detail: { from: number; to: number } | undefined;
    el.addEventListener("reorder", (e) => (detail = (e as CustomEvent).detail));
    const first = tabs[0]!.getBoundingClientRect();
    const last = tabs[2]!.getBoundingClientRect();
    const y = first.top + first.height / 2;
    tabs[0]!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, button: 0, pointerId: 7, clientX: first.left + 5, clientY: y }));
    window.dispatchEvent(new PointerEvent("pointermove", { pointerId: 7, clientX: last.right - 2, clientY: y }));
    expect(tabs[0]!.hasAttribute("dragging")).to.be.true;
    window.dispatchEvent(new PointerEvent("pointerup", { pointerId: 7, clientX: last.right - 2, clientY: y }));
    expect(detail).to.deep.equal({ from: 0, to: 2 });
    expect(tabs[0]!.hasAttribute("dragging")).to.be.false;
  });

  it("does nothing without reorderable", async () => {
    const { el, tabs } = await strip(false);
    let fired = false;
    el.addEventListener("reorder", () => (fired = true));
    tabs[0]!.focus();
    await sendKeys({ press: "Alt+Shift+ArrowRight" });
    expect(fired).to.be.false;
  });

  it("fades the end of a scrollable row with hidden tabs", async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div style="width: 240px">
        <lit-material-tabs scrollable>
          ${[1, 2, 3, 4, 5, 6].map((i) => html`<lit-material-tab>Request ${i}</lit-material-tab>`)}
        </lit-material-tabs>
      </div>
    `);
    const tabs = wrap.querySelector("lit-material-tabs")!;
    await new Promise((r) => setTimeout(r, 50));
    const scroller = tabs.shadowRoot!.querySelector(".scroller")!;
    expect(scroller.classList.contains("fade-end")).to.be.true;
    expect(scroller.classList.contains("fade-start")).to.be.false;
  });

  it("uses the compact height under density=compact", async () => {
    const wrap = await fixture<HTMLElement>(html`
      <div density="compact" style="--md-sys-density-tab-height: 36px">
        <lit-material-tabs><lit-material-tab>One</lit-material-tab></lit-material-tabs>
      </div>
    `);
    const tab = wrap.querySelector("lit-material-tab")!;
    await tab.updateComplete;
    expect(getComputedStyle(tab.shadowRoot!.querySelector(".tab")!).height).to.equal("36px");
  });
});
