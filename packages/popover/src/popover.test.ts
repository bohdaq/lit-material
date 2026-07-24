import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./popover.js";
import type { LitMaterialPopover } from "./popover.js";

async function popoverFixture() {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div>
      <button id="trigger">Open</button>
      <lit-material-popover id="popover" anchor="trigger">
        <span slot="header">Details</span>
        Some rich content.
        <button slot="footer">Got it</button>
      </lit-material-popover>
    </div>
  `);
  const popover = wrapper.querySelector<LitMaterialPopover>("#popover")!;
  const trigger = wrapper.querySelector<HTMLButtonElement>("#trigger")!;
  return { wrapper, popover, trigger };
}

describe("lit-material-popover", () => {
  it("defaults to closed, dismissible, popover=auto", async () => {
    const { popover } = await popoverFixture();
    expect(popover.open).to.be.false;
    expect(popover.matches(":popover-open")).to.be.false;
    expect(popover.dismissible).to.be.true;
    expect(popover.getAttribute("popover")).to.equal("auto");
  });

  it("opens as a popover when show() is called (or open is set)", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    expect(popover.open).to.be.true;
    expect(popover.matches(":popover-open")).to.be.true;
    popover.close();
  });

  it("positions itself near its anchor", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    const anchorRect = trigger.getBoundingClientRect();
    const popoverRect = popover.getBoundingClientRect();
    expect(Math.abs(popoverRect.left - anchorRect.left)).to.be.lessThan(1);
    expect(popoverRect.top).to.be.greaterThan(anchorRect.bottom - 1);
    popover.close();
  });

  it("focuses itself on open", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    expect(document.activeElement).to.equal(popover);
    popover.close();
  });

  it("renders header, body, and footer slot content", async () => {
    const { popover } = await popoverFixture();
    expect(popover.querySelector('[slot="header"]')!.textContent).to.equal("Details");
    expect(popover.querySelector('[slot="footer"]')!.textContent).to.equal("Got it");
    expect(popover.shadowRoot!.querySelector(".content")).to.exist;
  });

  it("points aria-labelledby at the slotted header element, assigning it an id if it has none", async () => {
    const { popover } = await popoverFixture();
    const header = popover.querySelector('[slot="header"]')!;
    expect(header.id).to.not.equal("");
    expect(popover.getAttribute("aria-labelledby")).to.equal(header.id);
  });

  it("has no aria-labelledby when there's no header slotted", async () => {
    const popover = await fixture<LitMaterialPopover>(html`<lit-material-popover>Plain content.</lit-material-popover>`);
    expect(popover.hasAttribute("aria-labelledby")).to.be.false;
  });

  it("renders a close button by default, which closes the popover", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    const closeButton = popover.shadowRoot!.querySelector(".close") as HTMLButtonElement;
    expect(closeButton).to.exist;
    closeButton.click();
    await popover.updateComplete;
    expect(popover.open).to.be.false;
  });

  it("does not render a close button when dismissible=false", async () => {
    const { popover } = await popoverFixture();
    popover.dismissible = false;
    await popover.updateComplete;
    expect(popover.shadowRoot!.querySelector(".close")).to.not.exist;
  });

  it("dispatches a close event and returns focus to the anchor when closed", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    setTimeout(() => popover.close());
    const event = await oneEvent(popover, "close");
    expect(event).to.exist;
    expect(document.activeElement).to.equal(trigger);
  });

  it("closes on Escape", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    await sendKeys({ press: "Escape" });
    expect(popover.open).to.be.false;
  });

  it("resolves anchorElement from the anchor id via getRootNode", async () => {
    const { popover, trigger } = await popoverFixture();
    expect(popover.anchorElement).to.equal(trigger);
  });

  it("passes axe accessibility checks while open", async () => {
    const { popover, trigger } = await popoverFixture();
    popover.show(trigger);
    await popover.updateComplete;
    await expect(popover).to.be.accessible();
    popover.close();
  });
});
