import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "@lit-material/list";
import "./search-view.js";
import type { LitMaterialSearchView } from "./search-view.js";

async function viewFixture() {
  const wrapper = await fixture<HTMLDivElement>(html`
    <div>
      <input id="bar" />
      <lit-material-search-view id="view" anchor="bar">
        <lit-material-list-item interactive id="one">One</lit-material-list-item>
        <lit-material-list-item interactive id="two">Two</lit-material-list-item>
        <lit-material-list-item interactive disabled id="three">Three (disabled)</lit-material-list-item>
        <lit-material-list-item interactive id="four">Four</lit-material-list-item>
      </lit-material-search-view>
    </div>
  `);
  const view = wrapper.querySelector<LitMaterialSearchView>("#view")!;
  const anchor = wrapper.querySelector<HTMLInputElement>("#bar")!;
  return { wrapper, view, anchor };
}

describe("lit-material-search-view", () => {
  it("defaults to closed", async () => {
    const { view } = await viewFixture();
    expect(view.open).to.be.false;
    expect(view.matches(":popover-open")).to.be.false;
  });

  it("opens automatically when the anchor is focused", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    expect(view.open).to.be.true;
    expect(view.matches(":popover-open")).to.be.true;
    view.close();
  });

  it("does not move focus into itself on open — the anchor keeps it", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    expect(document.activeElement).to.equal(anchor);
    view.close();
  });

  it("stretches to the anchor's width when positioned", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    const anchorRect = anchor.getBoundingClientRect();
    const viewRect = view.getBoundingClientRect();
    expect(Math.abs(viewRect.width - anchorRect.width)).to.be.lessThan(1);
    view.close();
  });

  it("highlights (not focuses) items with ArrowDown/ArrowUp while the anchor keeps real focus, wrapping and skipping disabled items", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;

    await sendKeys({ press: "ArrowDown" });
    expect(view.querySelector("#one")!.hasAttribute("selected")).to.be.true;
    expect(document.activeElement).to.equal(anchor);

    await sendKeys({ press: "ArrowDown" });
    expect(view.querySelector("#one")!.hasAttribute("selected")).to.be.false;
    expect(view.querySelector("#two")!.hasAttribute("selected")).to.be.true;

    await sendKeys({ press: "ArrowDown" });
    expect(view.querySelector("#four")!.hasAttribute("selected")).to.be.true; // skips #three (disabled)

    await sendKeys({ press: "ArrowDown" });
    expect(view.querySelector("#one")!.hasAttribute("selected")).to.be.true; // wraps

    await sendKeys({ press: "ArrowUp" });
    expect(view.querySelector("#four")!.hasAttribute("selected")).to.be.true; // wraps backward

    view.close();
  });

  it("Enter activates the highlighted item and closes the view", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;

    const two = view.querySelector<HTMLElement>("#two")!;
    let clicked = false;
    two.addEventListener("click", () => (clicked = true));

    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "ArrowDown" });
    await sendKeys({ press: "Enter" });
    await view.updateComplete;

    expect(clicked).to.be.true;
    expect(view.open).to.be.false;
  });

  it("Enter with nothing highlighted does not activate anything", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;

    let clicked = false;
    view.querySelector<HTMLElement>("#one")!.addEventListener("click", () => (clicked = true));

    await sendKeys({ press: "Enter" });
    await view.updateComplete;

    expect(clicked).to.be.false;
    expect(view.open).to.be.true;
    view.close();
  });

  it("Escape closes the view", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    await sendKeys({ press: "Escape" });
    expect(view.open).to.be.false;
  });

  it("closes when an item is activated by click", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    view.querySelector<HTMLElement>("#two")!.shadowRoot!.querySelector("button")!.click();
    await view.updateComplete;
    expect(view.open).to.be.false;
  });

  it("dispatches a close event and clears the highlight when closed", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    await sendKeys({ press: "ArrowDown" });
    expect(view.querySelector("#one")!.hasAttribute("selected")).to.be.true;

    setTimeout(() => view.close());
    const event = await oneEvent(view, "close");
    expect(event).to.exist;
    expect(view.querySelector("#one")!.hasAttribute("selected")).to.be.false;
  });

  it("resolves anchorElement from the anchor id via getRootNode", async () => {
    const { view, anchor } = await viewFixture();
    expect(view.anchorElement).to.equal(anchor);
  });

  it("passes axe accessibility checks while open", async () => {
    const { view, anchor } = await viewFixture();
    anchor.focus();
    await view.updateComplete;
    await expect(view).to.be.accessible();
    view.close();
  });
});
