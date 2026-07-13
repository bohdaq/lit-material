import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "@lit-material/list";
import "./menu.js";
import type { LitMaterialMenu } from "./menu.js";

async function menuFixture() {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div>
      <button id="trigger">Open</button>
      <lit-material-menu id="menu" anchor="trigger">
        <lit-material-list-item interactive id="one">One</lit-material-list-item>
        <lit-material-list-item interactive id="two">Two</lit-material-list-item>
        <lit-material-list-item interactive disabled id="three">Three (disabled)</lit-material-list-item>
        <lit-material-list-item interactive id="four">Four</lit-material-list-item>
      </lit-material-menu>
    </div>
  `);
  const menu = wrapper.querySelector<LitMaterialMenu>("#menu")!;
  const trigger = wrapper.querySelector<HTMLButtonElement>("#trigger")!;
  return { wrapper, menu, trigger };
}

describe("lit-material-menu", () => {
  it("defaults to closed", async () => {
    const { menu } = await menuFixture();
    expect(menu.open).to.be.false;
    expect(menu.matches(":popover-open")).to.be.false;
  });

  it("opens as a popover when show() is called (or open is set)", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    expect(menu.open).to.be.true;
    expect(menu.matches(":popover-open")).to.be.true;
    menu.close();
  });

  it("positions itself near its anchor", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    const anchorRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    expect(Math.abs(menuRect.left - anchorRect.left)).to.be.lessThan(1);
    expect(menuRect.top).to.be.greaterThan(anchorRect.bottom - 1);
    menu.close();
  });

  it("focuses itself on open, not the first item (no stray highlight)", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    expect(document.activeElement).to.equal(menu);
    menu.close();
  });

  it("moves focus to the first item on ArrowDown from that neutral state", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(menu.querySelector("#one"));
    menu.close();
  });

  it("moves focus to the last item on ArrowUp from that neutral state", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    await sendKeys({ press: "ArrowUp" });
    expect(document.activeElement).to.equal(menu.querySelector("#four"));
    menu.close();
  });

  it("moves focus with ArrowDown/ArrowUp, wrapping, and skips disabled items", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(menu.querySelector("#one"));

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(menu.querySelector("#two"));

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(menu.querySelector("#four"));

    await sendKeys({ press: "ArrowDown" });
    expect(document.activeElement).to.equal(menu.querySelector("#one"));

    await sendKeys({ press: "ArrowUp" });
    expect(document.activeElement).to.equal(menu.querySelector("#four"));

    menu.close();
  });

  it("moves focus to the first/last item with Home/End", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;

    await sendKeys({ press: "End" });
    expect(document.activeElement).to.equal(menu.querySelector("#four"));

    await sendKeys({ press: "Home" });
    expect(document.activeElement).to.equal(menu.querySelector("#one"));

    menu.close();
  });

  it("closes when an item is activated", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    const item = menu.querySelector<HTMLElement>("#two")!;
    item.shadowRoot!.querySelector("button")!.click();
    await menu.updateComplete;
    expect(menu.open).to.be.false;
    expect(menu.matches(":popover-open")).to.be.false;
  });

  it("dispatches a close event and returns focus to the anchor when closed", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    setTimeout(() => menu.close());
    const event = await oneEvent(menu, "close");
    expect(event).to.exist;
    expect(document.activeElement).to.equal(trigger);
  });

  it("closes on Escape", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    await sendKeys({ press: "Escape" });
    expect(menu.open).to.be.false;
  });

  it("resolves anchorElement from the anchor id via getRootNode", async () => {
    const { menu, trigger } = await menuFixture();
    expect(menu.anchorElement).to.equal(trigger);
  });

  it("passes axe accessibility checks while open", async () => {
    const { menu, trigger } = await menuFixture();
    menu.show(trigger);
    await menu.updateComplete;
    await expect(menu).to.be.accessible();
    menu.close();
  });
});
