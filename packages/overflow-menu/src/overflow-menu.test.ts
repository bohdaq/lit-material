import { expect, fixture, html } from "@open-wc/testing";
import "./overflow-menu.js";
import type { LitMaterialOverflowMenu } from "./overflow-menu.js";

function wait(ms = 80): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 5 buttons, 50px each, 8px gap between: cumulative widths (with the "more"
// button's 32px + 8px gap reserved whenever items remain) make a 200px
// container fit exactly items 0-1, overflowing items 2-4.
async function overflowFixture(containerWidth: string) {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div style="width: ${containerWidth}; box-sizing: border-box;">
      <lit-material-overflow-menu>
        <button style="width: 50px;">Item 1</button>
        <button style="width: 50px;">Item 2</button>
        <button style="width: 50px;">Item 3</button>
        <button style="width: 50px;">Item 4</button>
        <button style="width: 50px;">Item 5</button>
      </lit-material-overflow-menu>
    </div>
  `);
  const menu = wrapper.querySelector<LitMaterialOverflowMenu>("lit-material-overflow-menu")!;
  await wait();
  return { wrapper, menu };
}

describe("lit-material-overflow-menu", () => {
  it("keeps all items visible and hides the more button when everything fits", async () => {
    const { menu } = await overflowFixture("500px");
    const items = Array.from(menu.children);
    expect(items.every((item) => item.getAttribute("slot") !== "overflow")).to.be.true;
    const moreButton = menu.shadowRoot!.querySelector(".more") as HTMLButtonElement;
    expect(moreButton.hidden).to.be.true;
  });

  it("moves overflowing items into the overflow slot and shows the more button", async () => {
    const { menu } = await overflowFixture("200px");
    const items = Array.from(menu.children);
    expect(items[0]!.getAttribute("slot")).to.not.equal("overflow");
    expect(items[1]!.getAttribute("slot")).to.not.equal("overflow");
    expect(items[2]!.getAttribute("slot")).to.equal("overflow");
    expect(items[3]!.getAttribute("slot")).to.equal("overflow");
    expect(items[4]!.getAttribute("slot")).to.equal("overflow");
    const moreButton = menu.shadowRoot!.querySelector(".more") as HTMLButtonElement;
    expect(moreButton.hidden).to.be.false;
  });

  it("fires overflow-change when items start/stop overflowing", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="width: 500px; box-sizing: border-box;">
        <lit-material-overflow-menu>
          <button style="width: 50px;">Item 1</button>
          <button style="width: 50px;">Item 2</button>
          <button style="width: 50px;">Item 3</button>
          <button style="width: 50px;">Item 4</button>
          <button style="width: 50px;">Item 5</button>
        </lit-material-overflow-menu>
      </div>
    `);
    const menu = wrapper.querySelector<LitMaterialOverflowMenu>("lit-material-overflow-menu")!;
    await wait();

    let lastDetail: { overflowing: number } | undefined;
    menu.addEventListener("overflow-change", (event) => {
      lastDetail = (event as CustomEvent).detail;
    });

    wrapper.style.width = "200px";
    await wait();
    expect(lastDetail?.overflowing).to.equal(3);
  });

  it("grows the visible row back out when space returns", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="width: 200px; box-sizing: border-box;">
        <lit-material-overflow-menu>
          <button style="width: 50px;">Item 1</button>
          <button style="width: 50px;">Item 2</button>
          <button style="width: 50px;">Item 3</button>
          <button style="width: 50px;">Item 4</button>
          <button style="width: 50px;">Item 5</button>
        </lit-material-overflow-menu>
      </div>
    `);
    const menu = wrapper.querySelector<LitMaterialOverflowMenu>("lit-material-overflow-menu")!;
    await wait();
    expect(Array.from(menu.children).some((item) => item.getAttribute("slot") === "overflow")).to.be.true;

    wrapper.style.width = "500px";
    await wait();
    expect(Array.from(menu.children).every((item) => item.getAttribute("slot") !== "overflow")).to.be.true;
    expect((menu.shadowRoot!.querySelector(".more") as HTMLButtonElement).hidden).to.be.true;
  });

  it("opens the overflow popover when the more button is clicked", async () => {
    const { menu } = await overflowFixture("200px");
    const moreButton = menu.shadowRoot!.querySelector(".more") as HTMLButtonElement;
    moreButton.click();
    await menu.updateComplete;
    const menuElement = menu.shadowRoot!.querySelector(".menu")!;
    expect(menuElement.matches(":popover-open")).to.be.true;
    expect(moreButton.getAttribute("aria-expanded")).to.equal("true");
  });

  it("closes the overflow popover on a second click", async () => {
    const { menu } = await overflowFixture("200px");
    const moreButton = menu.shadowRoot!.querySelector(".more") as HTMLButtonElement;
    moreButton.click();
    await menu.updateComplete;
    moreButton.click();
    await menu.updateComplete;
    const menuElement = menu.shadowRoot!.querySelector(".menu")!;
    expect(menuElement.matches(":popover-open")).to.be.false;
    expect(moreButton.getAttribute("aria-expanded")).to.equal("false");
  });

  it("sets aria-haspopup and a default aria-label on the more button", async () => {
    const { menu } = await overflowFixture("200px");
    const moreButton = menu.shadowRoot!.querySelector(".more") as HTMLButtonElement;
    expect(moreButton.getAttribute("aria-haspopup")).to.equal("true");
    expect(moreButton.getAttribute("aria-label")).to.equal("More actions");
  });

  it("uses a custom label for the more button", async () => {
    const wrapper = await fixture<HTMLDivElement>(html`
      <div style="width: 200px; box-sizing: border-box;">
        <lit-material-overflow-menu label="Overflow items">
          <button style="width: 50px;">Item 1</button>
          <button style="width: 50px;">Item 2</button>
          <button style="width: 50px;">Item 3</button>
        </lit-material-overflow-menu>
      </div>
    `);
    const menu = wrapper.querySelector<LitMaterialOverflowMenu>("lit-material-overflow-menu")!;
    await wait();
    const moreButton = menu.shadowRoot!.querySelector(".more") as HTMLButtonElement;
    expect(moreButton.getAttribute("aria-label")).to.equal("Overflow items");
  });

  it("passes axe accessibility checks", async () => {
    const { menu } = await overflowFixture("200px");
    await expect(menu).to.be.accessible();
  });
});
