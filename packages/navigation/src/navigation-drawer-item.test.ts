import { expect, fixture, html } from "@open-wc/testing";
import "./navigation-drawer-item.js";
import type { LitMaterialNavigationDrawerItem } from "./navigation-drawer-item.js";

describe("lit-material-navigation-drawer-item", () => {
  it("renders a native button by default", async () => {
    const el = await fixture<LitMaterialNavigationDrawerItem>(
      html`<lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>`,
    );
    expect(el.shadowRoot!.querySelector("button")).to.exist;
    expect(el.shadowRoot!.querySelector("a")).to.not.exist;
  });

  it("renders an anchor when href is set", async () => {
    const el = await fixture<LitMaterialNavigationDrawerItem>(
      html`<lit-material-navigation-drawer-item href="/inbox">Inbox</lit-material-navigation-drawer-item>`,
    );
    const anchor = el.shadowRoot!.querySelector("a")!;
    expect(anchor.getAttribute("href")).to.equal("/inbox");
  });

  it("sets aria-current=page only when selected", async () => {
    const el = await fixture<LitMaterialNavigationDrawerItem>(
      html`<lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>`,
    );
    const button = el.shadowRoot!.querySelector("button")!;
    expect(button.hasAttribute("aria-current")).to.be.false;

    el.selected = true;
    await el.updateComplete;
    expect(button.getAttribute("aria-current")).to.equal("page");
  });

  it("reflects disabled to the attribute and disables the inner button", async () => {
    const el = await fixture<LitMaterialNavigationDrawerItem>(
      html`<lit-material-navigation-drawer-item disabled>Inbox</lit-material-navigation-drawer-item>`,
    );
    expect(el.hasAttribute("disabled")).to.be.true;
    expect(el.shadowRoot!.querySelector("button")!.disabled).to.be.true;
  });

  it("marks the state layer as pressed on pointerdown", async () => {
    const el = await fixture<LitMaterialNavigationDrawerItem>(
      html`<lit-material-navigation-drawer-item>Inbox</lit-material-navigation-drawer-item>`,
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

  it("passes axe accessibility checks inside a nav landmark", async () => {
    const wrapper = await fixture<HTMLElement>(html`
      <nav><lit-material-navigation-drawer-item selected>Inbox</lit-material-navigation-drawer-item></nav>
    `);
    await expect(wrapper).to.be.accessible();
  });
});
