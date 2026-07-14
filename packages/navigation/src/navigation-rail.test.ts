import { expect, fixture, html } from "@open-wc/testing";
import "./navigation-rail.js";
import "./navigation-rail-item.js";
import type { LitMaterialNavigationRail } from "./navigation-rail.js";
import type { LitMaterialNavigationRailItem } from "./navigation-rail-item.js";

async function railFixture() {
  const el = await fixture<LitMaterialNavigationRail>(html`
    <lit-material-navigation-rail>
      <lit-material-navigation-rail-item>Music</lit-material-navigation-rail-item>
      <lit-material-navigation-rail-item>Videos</lit-material-navigation-rail-item>
      <lit-material-navigation-rail-item disabled>Photos</lit-material-navigation-rail-item>
    </lit-material-navigation-rail>
  `);
  const items = Array.from(el.querySelectorAll("lit-material-navigation-rail-item"));
  return { el, items };
}

describe("lit-material-navigation-rail", () => {
  it("has no selection by default", async () => {
    const { el, items } = await railFixture();
    expect(el.selected).to.equal(-1);
    expect(items.every((item) => !item.selected)).to.be.true;
  });

  it("defaults to top alignment", async () => {
    const { el } = await railFixture();
    expect(el.shadowRoot!.querySelector(".items")!.classList.contains("top")).to.be.true;
  });

  it("reflects the alignment property onto the items container's class", async () => {
    const el = await fixture<LitMaterialNavigationRail>(
      html`<lit-material-navigation-rail alignment="center"></lit-material-navigation-rail>`,
    );
    expect(el.shadowRoot!.querySelector(".items")!.classList.contains("center")).to.be.true;
  });

  it("syncs selected onto the matching item", async () => {
    const { el, items } = await railFixture();
    el.selected = 1;
    await el.updateComplete;
    expect(items[0]!.selected).to.be.false;
    expect(items[1]!.selected).to.be.true;
  });

  it("selects an item on click and dispatches change", async () => {
    const { el, items } = await railFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    (items[0] as LitMaterialNavigationRailItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(0);
    expect(items[0]!.selected).to.be.true;
    expect(changeEvent).to.exist;
  });

  it("ignores clicks on a disabled item", async () => {
    const { el, items } = await railFixture();
    let changed = false;
    el.addEventListener("change", () => (changed = true));

    (items[2] as LitMaterialNavigationRailItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(-1);
    expect(changed).to.be.false;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await railFixture();
    await expect(el).to.be.accessible();
  });
});
