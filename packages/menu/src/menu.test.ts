import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys, sendMouse } from "@web/test-runner-commands";
import { shadowFixture } from "@lit-material/testing";
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

  it("opens at the pointer for a right click and stays open after the release", async () => {
    const host = await fixture<HTMLDivElement>(html`<div>
      <button id="row" style="width: 200px; height: 40px">Request</button>
      <lit-material-menu id="ctx">
        <lit-material-list-item interactive>Rename</lit-material-list-item>
      </lit-material-menu>
    </div>`);
    const row = host.querySelector("#row") as HTMLElement;
    const menu = host.querySelector("#ctx") as LitMaterialMenu;
    row.addEventListener("contextmenu", (e) => menu.showForEvent(e));
    const box = row.getBoundingClientRect();
    const x = Math.round(box.left + 50), y = Math.round(box.top + 20);
    await sendMouse({ type: "move", position: [x, y] });
    await sendMouse({ type: "down", button: "right" });
    await sendMouse({ type: "up", button: "right" });
    await new Promise((r) => setTimeout(r, 50));
    await menu.updateComplete;
    expect(menu.open).to.be.true;
    expect(menu.matches(":popover-open")).to.be.true;
    const m = menu.getBoundingClientRect();
    expect(Math.abs(m.left - x)).to.be.below(2);
    expect(Math.abs(m.top - y)).to.be.below(2);
    menu.close();
  });

  it("opens under the element for the context menu key", async () => {
    const host = await fixture<HTMLDivElement>(html`<div>
      <button id="row2" style="width: 200px; height: 40px">Request</button>
      <lit-material-menu id="ctx2"><lit-material-list-item interactive>Rename</lit-material-list-item></lit-material-menu>
    </div>`);
    const row = host.querySelector("#row2") as HTMLElement;
    const menu = host.querySelector("#ctx2") as LitMaterialMenu;
    row.addEventListener("contextmenu", (e) => menu.showForEvent(e));
    row.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 0, clientX: 0, clientY: 0 }));
    await menu.updateComplete;
    expect(menu.open).to.be.true;
    expect(menu.getBoundingClientRect().top).to.be.at.least(row.getBoundingClientRect().bottom);
    menu.close();
  });

  it("lines up with the anchor's right edge in a right-to-left layout", async () => {
    const host = await fixture<HTMLDivElement>(html`<div dir="rtl" style="padding-inline-start: 300px">
      <button id="rtl-trigger" style="width: 200px">Menu</button>
      <lit-material-menu anchor="rtl-trigger"><lit-material-list-item interactive>One</lit-material-list-item></lit-material-menu>
    </div>`);
    const trigger = host.querySelector("#rtl-trigger") as HTMLElement;
    const menu = host.querySelector("lit-material-menu") as LitMaterialMenu;
    menu.show();
    await menu.updateComplete;
    const anchorRect = trigger.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    expect(Math.abs(menuRect.right - anchorRect.right)).to.be.lessThan(1);
    expect(menuRect.top).to.be.greaterThan(anchorRect.bottom - 1);
    menu.close();
  });

  it("opens leftwards from the pointer in a right-to-left layout", async () => {
    const host = await fixture<HTMLDivElement>(html`<div dir="rtl">
      <button id="rtl-row" style="width: 400px; height: 40px">Request</button>
      <lit-material-menu id="rtl-ctx"><lit-material-list-item interactive>Rename</lit-material-list-item></lit-material-menu>
    </div>`);
    const row = host.querySelector("#rtl-row") as HTMLElement;
    const menu = host.querySelector("#rtl-ctx") as LitMaterialMenu;
    row.addEventListener("contextmenu", (e) => menu.showForEvent(e));
    const box = row.getBoundingClientRect();
    const x = Math.round(box.right - 20), y = Math.round(box.top + 20);
    row.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true, cancelable: true, button: 2, clientX: x, clientY: y }));
    await menu.updateComplete;
    expect(menu.open).to.be.true;
    expect(Math.abs(menu.getBoundingClientRect().right - x)).to.be.below(2);
    menu.close();
  });
});

describe("lit-material-menu inside another component's shadow root", () => {
  async function shadowMenu() {
    const { root } = await shadowFixture<HTMLDivElement>(html`
      <div>
        <button id="trigger">Open</button>
        <lit-material-menu id="menu" anchor="trigger">
          <lit-material-list-item interactive id="one">Apple</lit-material-list-item>
          <lit-material-list-item interactive id="two">Banana</lit-material-list-item>
          <lit-material-list-item interactive id="three">Blueberry</lit-material-list-item>
          <lit-material-list-item interactive id="four">Cherry</lit-material-list-item>
        </lit-material-menu>
      </div>
    `);
    const menu = root.querySelector<LitMaterialMenu>("#menu")!;
    const trigger = root.querySelector<HTMLButtonElement>("#trigger")!;
    const item = (id: string) => root.querySelector<HTMLElement>(`#${id}`)!;
    return { root, menu, trigger, item };
  }

  it("walks every item with ArrowDown/ArrowUp", async () => {
    const { root, menu, trigger, item } = await shadowMenu();
    menu.show(trigger);
    await menu.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    expect(root.activeElement).to.equal(item("one"));
    await sendKeys({ press: "ArrowDown" });
    expect(root.activeElement).to.equal(item("two"));
    await sendKeys({ press: "ArrowDown" });
    expect(root.activeElement).to.equal(item("three"));
    await sendKeys({ press: "ArrowUp" });
    expect(root.activeElement).to.equal(item("two"));
    menu.close();
  });

  it("exposes menu semantics and keeps the anchor's aria-expanded in sync", async () => {
    const { menu, trigger, item } = await shadowMenu();
    expect(menu.getAttribute("role")).to.equal("menu");
    menu.show(trigger);
    await menu.updateComplete;
    await item("one").updateComplete;
    expect(trigger.getAttribute("aria-haspopup")).to.equal("menu");
    expect(trigger.getAttribute("aria-expanded")).to.equal("true");
    expect(trigger.getAttribute("aria-controls")).to.equal("menu");
    expect(item("one").shadowRoot!.querySelector("button")!.getAttribute("role")).to.equal("menuitem");
    menu.close();
    await menu.updateComplete;
    expect(trigger.getAttribute("aria-expanded")).to.equal("false");
  });

  it("moves to items by typed letters (typeahead) and cycles on a repeated letter", async () => {
    const { root, menu, trigger, item } = await shadowMenu();
    menu.show(trigger);
    await menu.updateComplete;
    await sendKeys({ press: "c" });
    expect(root.activeElement).to.equal(item("four"));
    await new Promise((r) => setTimeout(r, 600));
    await sendKeys({ press: "b" });
    expect(root.activeElement).to.equal(item("two"));
    await sendKeys({ press: "b" });
    expect(root.activeElement).to.equal(item("three"));
    menu.close();
  });

  it("closes on Tab and returns focus to the anchor", async () => {
    const { root, menu, trigger } = await shadowMenu();
    menu.show(trigger);
    await menu.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Tab" });
    await menu.updateComplete;
    expect(menu.open).to.be.false;
    expect(root.activeElement).to.equal(trigger);
  });
});
