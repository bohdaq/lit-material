import { expect, fixture, html } from "@open-wc/testing";
import "./navigation-bar.js";
import "./navigation-bar-item.js";
import type { LitMaterialNavigationBar } from "./navigation-bar.js";
import type { LitMaterialNavigationBarItem } from "./navigation-bar-item.js";

async function barFixture() {
  const el = await fixture<LitMaterialNavigationBar>(html`
    <lit-material-navigation-bar>
      <lit-material-navigation-bar-item>Music</lit-material-navigation-bar-item>
      <lit-material-navigation-bar-item>Videos</lit-material-navigation-bar-item>
      <lit-material-navigation-bar-item disabled>Photos</lit-material-navigation-bar-item>
    </lit-material-navigation-bar>
  `);
  const items = Array.from(el.querySelectorAll("lit-material-navigation-bar-item"));
  return { el, items };
}

describe("lit-material-navigation-bar", () => {
  it("has no selection by default", async () => {
    const { el, items } = await barFixture();
    expect(el.selected).to.equal(-1);
    expect(items.every((item) => !item.selected)).to.be.true;
  });

  it("syncs selected onto the matching item", async () => {
    const { el, items } = await barFixture();
    el.selected = 1;
    await el.updateComplete;
    expect(items[0]!.selected).to.be.false;
    expect(items[1]!.selected).to.be.true;
  });

  it("selects an item on click and dispatches change", async () => {
    const { el, items } = await barFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    (items[0] as LitMaterialNavigationBarItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(0);
    expect(items[0]!.selected).to.be.true;
    expect(changeEvent).to.exist;
  });

  it("does not dispatch change when clicking the already-selected item", async () => {
    const { el, items } = await barFixture();
    el.selected = 0;
    await el.updateComplete;
    let changed = false;
    el.addEventListener("change", () => (changed = true));

    (items[0] as LitMaterialNavigationBarItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(changed).to.be.false;
  });

  it("ignores clicks on a disabled item", async () => {
    const { el, items } = await barFixture();
    let changed = false;
    el.addEventListener("change", () => (changed = true));

    (items[2] as LitMaterialNavigationBarItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(-1);
    expect(changed).to.be.false;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await barFixture();
    await expect(el).to.be.accessible();
  });
});
