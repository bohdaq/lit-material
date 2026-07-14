import { expect, fixture, html } from "@open-wc/testing";
import "./navigation-drawer.js";
import "./navigation-drawer-item.js";
import type { LitMaterialNavigationDrawer } from "./navigation-drawer.js";
import type { LitMaterialNavigationDrawerItem } from "./navigation-drawer-item.js";

async function drawerFixture() {
  const el = await fixture<LitMaterialNavigationDrawer>(html`
    <lit-material-navigation-drawer>
      <lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>
      <lit-material-navigation-drawer-item>Sent</lit-material-navigation-drawer-item>
      <lit-material-navigation-drawer-item disabled>Trash</lit-material-navigation-drawer-item>
    </lit-material-navigation-drawer>
  `);
  const items = Array.from(el.querySelectorAll("lit-material-navigation-drawer-item"));
  return { el, items };
}

describe("lit-material-navigation-drawer", () => {
  it("renders a standard drawer as a plain <nav> with no selection by default", async () => {
    const { el, items } = await drawerFixture();
    expect(el.shadowRoot!.querySelector("dialog")).to.not.exist;
    expect(el.shadowRoot!.querySelector("nav")).to.exist;
    expect(el.selected).to.equal(-1);
    expect(items.every((item) => !item.selected)).to.be.true;
  });

  it("syncs selected onto the matching item", async () => {
    const { el, items } = await drawerFixture();
    el.selected = 1;
    await el.updateComplete;
    expect(items[0]!.selected).to.be.false;
    expect(items[1]!.selected).to.be.true;
  });

  it("selects an item on click and dispatches change", async () => {
    const { el, items } = await drawerFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    (items[0] as LitMaterialNavigationDrawerItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(0);
    expect(items[0]!.selected).to.be.true;
    expect(changeEvent).to.exist;
  });

  it("ignores clicks on a disabled item", async () => {
    const { el, items } = await drawerFixture();
    let changed = false;
    el.addEventListener("change", () => (changed = true));

    (items[2] as LitMaterialNavigationDrawerItem).shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(el.selected).to.equal(-1);
    expect(changed).to.be.false;
  });

  it("renders a modal drawer wrapped in a native <dialog>, closed by default", async () => {
    const el = await fixture<LitMaterialNavigationDrawer>(html`
      <lit-material-navigation-drawer variant="modal">
        <lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>
      </lit-material-navigation-drawer>
    `);
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog).to.exist;
    expect(dialog.open).to.be.false;
  });

  it("opens and closes a modal drawer via show()/close()", async () => {
    const el = await fixture<LitMaterialNavigationDrawer>(html`
      <lit-material-navigation-drawer variant="modal">
        <lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>
      </lit-material-navigation-drawer>
    `);
    const dialog = el.shadowRoot!.querySelector("dialog")!;

    el.show();
    await el.updateComplete;
    expect(dialog.open).to.be.true;

    el.close();
    await el.updateComplete;
    expect(dialog.open).to.be.false;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await drawerFixture();
    await expect(el).to.be.accessible();
  });
});
