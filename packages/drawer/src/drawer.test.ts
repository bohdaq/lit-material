import { expect, fixture, html } from "@open-wc/testing";
import "./drawer.js";
import type { LitMaterialDrawer } from "./drawer.js";

describe("lit-material-drawer", () => {
  it("starts closed with role=complementary and popover=manual", async () => {
    const el = await fixture<LitMaterialDrawer>(html`<lit-material-drawer>Content</lit-material-drawer>`);
    expect(el.open).to.be.false;
    expect(el.getAttribute("role")).to.equal("complementary");
    expect(el.getAttribute("popover")).to.equal("manual");
    expect(el.matches(":popover-open")).to.be.false;
  });

  it("defaults to position=end", async () => {
    const el = await fixture<LitMaterialDrawer>(html`<lit-material-drawer>Content</lit-material-drawer>`);
    expect(el.getAttribute("position")).to.equal("end");
  });

  it("reflects position=start", async () => {
    const el = await fixture<LitMaterialDrawer>(html`<lit-material-drawer position="start">Content</lit-material-drawer>`);
    expect(el.getAttribute("position")).to.equal("start");
  });

  it("opens/closes via the open property, syncing the popover state", async () => {
    const el = await fixture<LitMaterialDrawer>(html`<lit-material-drawer>Content</lit-material-drawer>`);
    el.open = true;
    await el.updateComplete;
    expect(el.matches(":popover-open")).to.be.true;

    el.open = false;
    await el.updateComplete;
    expect(el.matches(":popover-open")).to.be.false;
  });

  it("show()/close() toggle open", async () => {
    const el = await fixture<LitMaterialDrawer>(html`<lit-material-drawer>Content</lit-material-drawer>`);
    el.show();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(el.matches(":popover-open")).to.be.true;

    el.close();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(el.matches(":popover-open")).to.be.false;
  });

  it("renders header and default slot content", async () => {
    const el = await fixture<LitMaterialDrawer>(html`
      <lit-material-drawer>
        <div slot="header">Notifications</div>
        <p>Item</p>
      </lit-material-drawer>
    `);
    expect(el.querySelector('[slot="header"]')).to.exist;
    expect(el.querySelector("p")).to.exist;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialDrawer>(html`
      <lit-material-drawer open>
        <div slot="header">Notifications</div>
        <p>Item</p>
      </lit-material-drawer>
    `);
    await expect(el).to.be.accessible();
  });
});
