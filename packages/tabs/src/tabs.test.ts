import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./tabs.js";
import "./tab.js";
import type { LitMaterialTabs } from "./tabs.js";

async function tabsFixture() {
  const el = await fixture<LitMaterialTabs>(html`
    <lit-material-tabs>
      <lit-material-tab>One</lit-material-tab>
      <lit-material-tab>Two</lit-material-tab>
      <lit-material-tab disabled>Three (disabled)</lit-material-tab>
      <lit-material-tab>Four</lit-material-tab>
    </lit-material-tabs>
  `);
  const tabs = Array.from(el.querySelectorAll("lit-material-tab"));
  return { el, tabs };
}

describe("lit-material-tabs", () => {
  it("renders with role=tablist and selects the first tab by default", async () => {
    const { el, tabs } = await tabsFixture();
    expect(el.getAttribute("role")).to.equal("tablist");
    expect(el.selected).to.equal(0);
    expect(tabs[0]!.selected).to.be.true;
    expect(tabs[1]!.selected).to.be.false;
  });

  it("moves the selection when `selected` is set from code", async () => {
    const { el, tabs } = await tabsFixture();
    el.selected = 3;
    await el.updateComplete;
    await tabs[0]!.updateComplete;
    expect(tabs[0]!.selected).to.be.false;
    expect(tabs[0]!.hasAttribute("selected")).to.be.false;
    expect(tabs[3]!.selected).to.be.true;
    expect(tabs[3]!.hasAttribute("selected")).to.be.true;
  });

  it("keeps the selection in sync after being moved in the document", async () => {
    const { el, tabs } = await tabsFixture();
    el.selected = 1;
    await el.updateComplete;
    const other = document.createElement("div");
    document.body.append(other);
    other.append(el);
    el.selected = 3;
    await el.updateComplete;
    expect(tabs[1]!.selected).to.be.false;
    expect(tabs[3]!.selected).to.be.true;
    other.remove();
  });

  it("gives only the selected tab a real tabindex of 0", async () => {
    const { tabs } = await tabsFixture();
    const buttons = tabs.map((tab) => tab.shadowRoot!.querySelector("button")!);
    expect(buttons[0]!.tabIndex).to.equal(0);
    expect(buttons[1]!.tabIndex).to.equal(-1);
  });

  it("selects a tab on click, focuses it, and dispatches change", async () => {
    const { el, tabs } = await tabsFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    tabs[1]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(1);
    expect(tabs[1]!.selected).to.be.true;
    expect(tabs[0]!.selected).to.be.false;
    expect(changeEvent).to.exist;
    // Tabs are light-DOM children (slotted), so document.activeElement
    // resolves directly to the focused tab rather than needing to look
    // inside any shadow root.
    expect(document.activeElement).to.equal(tabs[1]);
  });

  it("does not dispatch change when clicking the already-selected tab", async () => {
    const { el, tabs } = await tabsFixture();
    let changed = false;
    el.addEventListener("change", () => (changed = true));
    tabs[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(changed).to.be.false;
  });

  it("moves selection with ArrowRight/ArrowLeft, wrapping, and skips disabled tabs", async () => {
    const { el, tabs } = await tabsFixture();
    tabs[0]!.shadowRoot!.querySelector("button")!.focus();

    await sendKeys({ press: "ArrowRight" });
    expect(el.selected).to.equal(1);

    await sendKeys({ press: "ArrowRight" });
    expect(el.selected).to.equal(3);

    await sendKeys({ press: "ArrowRight" });
    expect(el.selected).to.equal(0);

    await sendKeys({ press: "ArrowLeft" });
    expect(el.selected).to.equal(3);
  });

  it("jumps to the first/last tab with Home/End", async () => {
    const { el, tabs } = await tabsFixture();
    tabs[1]!.shadowRoot!.querySelector("button")!.focus();

    await sendKeys({ press: "End" });
    expect(el.selected).to.equal(3);

    await sendKeys({ press: "Home" });
    expect(el.selected).to.equal(0);
  });

  it("positions the indicator under the selected tab", async () => {
    const { el, tabs } = await tabsFixture();
    const indicator = el.shadowRoot!.querySelector(".indicator") as HTMLElement;
    const firstButton = tabs[0]!.getBoundingClientRect();
    expect(indicator.style.width).to.equal(`${firstButton.width}px`);

    el.selected = 1;
    await el.updateComplete;
    const secondButton = tabs[1]!.getBoundingClientRect();
    expect(indicator.style.width).to.equal(`${secondButton.width}px`);
  });

  it("follows the selected tab's actual rendered position under dir=\"rtl\", where tab order itself mirrors", async () => {
    // The indicator's position is computed from getBoundingClientRect() diffs
    // (tabs.ts's updateIndicator()), not assumed direction — flex's `row`
    // direction already reorders tabs right-to-left under RTL naturally, and
    // measuring already-mirrored rects keeps the indicator correct without
    // the component needing any direction-specific logic of its own.
    const el = await fixture<LitMaterialTabs>(html`
      <lit-material-tabs dir="rtl" style="display: block; width: 300px;">
        <lit-material-tab>One</lit-material-tab>
        <lit-material-tab>Two</lit-material-tab>
      </lit-material-tabs>
    `);
    const tabs = Array.from(el.querySelectorAll("lit-material-tab"));
    const hostRect = el.getBoundingClientRect();

    // In RTL, flex-direction: row lays the first tab out on the right.
    const firstTabRect = tabs[0]!.getBoundingClientRect();
    expect(firstTabRect.right).to.be.closeTo(hostRect.right, 1);

    const indicator = el.shadowRoot!.querySelector(".indicator") as HTMLElement;
    expect(indicator.style.left).to.equal(`${firstTabRect.left - hostRect.left}px`);

    el.selected = 1;
    await el.updateComplete;
    const secondTabRect = tabs[1]!.getBoundingClientRect();
    expect(secondTabRect.right).to.be.at.most(firstTabRect.left); // second tab sits to the left, in RTL (touching, no gap)
    expect(indicator.style.left).to.equal(`${secondTabRect.left - hostRect.left}px`);
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await tabsFixture();
    await expect(el).to.be.accessible();
  });

  it("closable tabs fire close from the ×, Delete and a middle click, without selecting", async () => {
    const el = await fixture<LitMaterialTabs>(html`<lit-material-tabs>
      <lit-material-tab closable>One</lit-material-tab>
      <lit-material-tab closable dirty>Two</lit-material-tab>
    </lit-material-tabs>`);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r));
    const tabs = Array.from(el.querySelectorAll("lit-material-tab")) as (HTMLElement & { updateComplete: Promise<unknown> })[];
    const closed: string[] = [];
    el.addEventListener("close", (e) => closed.push((e.target as HTMLElement).textContent!.trim()));
    let changes = 0;
    el.addEventListener("change", () => changes++);
    (tabs[1]!.shadowRoot!.querySelector(".close") as HTMLElement).click();
    expect(closed).to.deep.equal(["Two"]);
    expect(el.selected).to.equal(0);
    expect(changes).to.equal(0);
    tabs[0]!.focus();
    await sendKeys({ press: "Delete" });
    expect(closed).to.deep.equal(["Two", "One"]);
    tabs[1]!.dispatchEvent(new MouseEvent("auxclick", { bubbles: true, cancelable: true, button: 1 }));
    expect(closed).to.deep.equal(["Two", "One", "Two"]);
    const button = tabs[1]!.shadowRoot!.querySelector("button")!;
    expect(button.getAttribute("aria-description")).to.equal("Unsaved changes. Press Delete to close");
    expect(tabs[1]!.shadowRoot!.querySelector(".dirty")).to.exist;
    expect(tabs[1]!.shadowRoot!.querySelector(".close")!.getAttribute("aria-hidden")).to.equal("true");
    await expect(el).to.be.accessible();
  });

  it("a cancelled close keeps the tab", async () => {
    const el = await fixture<LitMaterialTabs>(html`<lit-material-tabs><lit-material-tab closable>One</lit-material-tab></lit-material-tabs>`);
    const tab = el.querySelector("lit-material-tab") as HTMLElement & { requestClose(): boolean };
    el.addEventListener("close", (e) => e.preventDefault());
    expect(tab.requestClose()).to.be.false;
  });

  it("scrollable keeps tabs at their width, scrolls, and keeps the selected tab in view", async () => {
    const el = await fixture<LitMaterialTabs>(html`<lit-material-tabs scrollable style="width: 300px">
      ${Array.from({ length: 12 }, (_, i) => html`<lit-material-tab>Request ${i + 1}</lit-material-tab>`)}
      <button slot="end" aria-label="New tab">+</button>
    </lit-material-tabs>`);
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 50));
    const row = el.shadowRoot!.querySelector<HTMLElement>(".scroller")!;
    expect(row.scrollWidth).to.be.above(row.clientWidth);
    el.selected = 11;
    await el.updateComplete;
    // The indicator slides (200 ms).
    await new Promise((r) => setTimeout(r, 350));
    const last = el.querySelectorAll("lit-material-tab")[11]!.getBoundingClientRect();
    const rowRect = row.getBoundingClientRect();
    expect(last.right).to.be.at.most(rowRect.right + 1);
    expect(last.left).to.be.at.least(rowRect.left - 1);
    const indicator = el.shadowRoot!.querySelector<HTMLElement>(".indicator")!.getBoundingClientRect();
    expect(Math.abs(indicator.left - last.left)).to.be.below(2);
    const add = el.querySelector("button[slot=end]")!.getBoundingClientRect();
    expect(add.left).to.be.at.least(rowRect.right - 1);
  });
});
