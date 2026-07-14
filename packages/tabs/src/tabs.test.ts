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

  it("passes axe accessibility checks", async () => {
    const { el } = await tabsFixture();
    await expect(el).to.be.accessible();
  });
});
