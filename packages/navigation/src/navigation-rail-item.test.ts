import { expect, fixture, html } from "@open-wc/testing";
import "./navigation-rail-item.js";
import type { LitMaterialNavigationRailItem } from "./navigation-rail-item.js";

describe("lit-material-navigation-rail-item", () => {
  it("renders a native button by default", async () => {
    const el = await fixture<LitMaterialNavigationRailItem>(
      html`<lit-material-navigation-rail-item>Music</lit-material-navigation-rail-item>`,
    );
    expect(el.shadowRoot!.querySelector("button")).to.exist;
    expect(el.shadowRoot!.querySelector("a")).to.not.exist;
  });

  it("renders an anchor when href is set", async () => {
    const el = await fixture<LitMaterialNavigationRailItem>(
      html`<lit-material-navigation-rail-item href="/music">Music</lit-material-navigation-rail-item>`,
    );
    const anchor = el.shadowRoot!.querySelector("a")!;
    expect(anchor.getAttribute("href")).to.equal("/music");
  });

  it("sets aria-current=page only when selected", async () => {
    const el = await fixture<LitMaterialNavigationRailItem>(
      html`<lit-material-navigation-rail-item>Music</lit-material-navigation-rail-item>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.hasAttribute("aria-current")).to.be.false;

    el.selected = true;
    await el.updateComplete;
    expect(button.getAttribute("aria-current")).to.equal("page");
  });

  it("reflects disabled to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialNavigationRailItem>(
      html`<lit-material-navigation-rail-item disabled>Music</lit-material-navigation-rail-item>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("button")!.disabled).to.be.true;
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialNavigationRailItem>(
      html`<lit-material-navigation-rail-item>Music</lit-material-navigation-rail-item>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    const rect = button.getBoundingClientRect();
    button.dispatchEvent(
      new PointerEvent("pointerdown", {
        button: 0,
        clientX: rect.x + 1,
        clientY: rect.y + 1,
        bubbles: true,
        composed: true,
      }),
    );
    expect(el.shadowRoot!.querySelector(".state-layer")!.hasAttribute("data-pressed")).to.be.true;
  });

  it("mirrors the badge slot's corner under dir=\"rtl\" instead of sitting at a fixed physical corner", async () => {
    // The badge is positioned relative to .icon-container (56px, centered
    // within .item), not .item itself — .icon-container is the nearest
    // `position: relative` ancestor, so it's the actual containing block.
    const ltr = await fixture<LitMaterialNavigationRailItem>(html`
      <lit-material-navigation-rail-item dir="ltr"><span slot="badge">5</span>Music</lit-material-navigation-rail-item>
    `);
    const ltrContainerRect = ltr.shadowRoot!.querySelector(".icon-container")!.getBoundingClientRect();
    const ltrBadgeRect = ltr.querySelector('[slot="badge"]')!.getBoundingClientRect();
    expect(ltrContainerRect.right - ltrBadgeRect.right).to.be.closeTo(8, 1); // hugs the right edge in LTR

    const rtl = await fixture<LitMaterialNavigationRailItem>(html`
      <lit-material-navigation-rail-item dir="rtl"><span slot="badge">5</span>Music</lit-material-navigation-rail-item>
    `);
    const rtlContainerRect = rtl.shadowRoot!.querySelector(".icon-container")!.getBoundingClientRect();
    const rtlBadgeRect = rtl.querySelector('[slot="badge"]')!.getBoundingClientRect();
    expect(rtlBadgeRect.left - rtlContainerRect.left).to.be.closeTo(8, 1); // mirrored: hugs the left edge in RTL
  });

  it("passes axe accessibility checks inside a nav landmark", async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <nav><lit-material-navigation-rail-item selected>Music</lit-material-navigation-rail-item></nav>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
