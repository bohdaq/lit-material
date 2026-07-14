import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./tooltip.js";
import type { LitMaterialTooltip } from "./tooltip.js";

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fixtureWithAnchor() {
  const container = await fixture<HTMLDivElement>(html`
    <div>
      <button id="anchor-btn">Hover me</button>
      <lit-material-tooltip anchor="anchor-btn" show-delay="10" hide-delay="10">More info</lit-material-tooltip>
    </div>
  `);
  const anchor = container.querySelector<HTMLButtonElement>("#anchor-btn")!;
  const tooltip = container.querySelector<LitMaterialTooltip>("lit-material-tooltip")!;
  return { container, anchor, tooltip };
}

describe("lit-material-tooltip", () => {
  it("starts closed with role=tooltip and popover=manual", async () => {
    const el = await fixture<LitMaterialTooltip>(html`<lit-material-tooltip>More info</lit-material-tooltip>`);
    expect(el.open).to.be.false;
    expect(el.getAttribute("role")).to.equal("tooltip");
    expect(el.getAttribute("popover")).to.equal("manual");
  });

  it("auto-assigns an id when none is set, and keeps an explicit one", async () => {
    const auto = await fixture<LitMaterialTooltip>(html`<lit-material-tooltip>More info</lit-material-tooltip>`);
    expect(auto.id).to.match(/^lit-material-tooltip-\d+$/);

    const explicit = await fixture<LitMaterialTooltip>(
      html`<lit-material-tooltip id="my-tooltip">More info</lit-material-tooltip>`,
    );
    expect(explicit.id).to.equal("my-tooltip");
  });

  it("resolves anchorElement from the anchor id and sets aria-describedby on it", async () => {
    const { anchor, tooltip } = await fixtureWithAnchor();
    expect(tooltip.anchorElement).to.equal(anchor);
    expect(anchor.getAttribute("aria-describedby")).to.equal(tooltip.id);
  });

  it("shows after showDelay on anchor mouseenter, hides after hideDelay on mouseleave", async () => {
    const { anchor, tooltip } = await fixtureWithAnchor();
    anchor.dispatchEvent(new MouseEvent("mouseenter"));
    expect(tooltip.open).to.be.false; // not yet — still within showDelay

    await wait(30);
    expect(tooltip.open).to.be.true;
    expect(tooltip.matches(":popover-open")).to.be.true;

    anchor.dispatchEvent(new MouseEvent("mouseleave"));
    expect(tooltip.open).to.be.true; // not yet — still within hideDelay

    await wait(30);
    expect(tooltip.open).to.be.false;
    expect(tooltip.matches(":popover-open")).to.be.false;
  });

  it("shows on anchor focus and hides on blur", async () => {
    const { anchor, tooltip } = await fixtureWithAnchor();
    anchor.focus();
    await wait(30);
    expect(tooltip.open).to.be.true;

    anchor.blur();
    await wait(30);
    expect(tooltip.open).to.be.false;
  });

  it("Escape hides an open tooltip", async () => {
    const { anchor, tooltip } = await fixtureWithAnchor();
    anchor.focus();
    await wait(30);
    expect(tooltip.open).to.be.true;

    await sendKeys({ press: "Escape" });
    await tooltip.updateComplete;
    expect(tooltip.open).to.be.false;
  });

  it("show()/hide() bypass the delays immediately", async () => {
    const { tooltip } = await fixtureWithAnchor();
    tooltip.show();
    expect(tooltip.open).to.be.true;
    // `open` is a synchronous property set, but the actual showPopover()
    // call happens in updated(), which Lit batches asynchronously — so
    // ":popover-open" only reflects reality after updateComplete.
    await tooltip.updateComplete;
    expect(tooltip.matches(":popover-open")).to.be.true;

    tooltip.hide();
    expect(tooltip.open).to.be.false;
    await tooltip.updateComplete;
    expect(tooltip.matches(":popover-open")).to.be.false;
  });

  it("positions itself relative to the anchor once shown", async () => {
    const { tooltip } = await fixtureWithAnchor();
    tooltip.show();
    await tooltip.updateComplete;
    expect(tooltip.style.top).to.not.equal("");
    expect(tooltip.style.left).to.not.equal("");
  });

  it("supports setting anchorElement directly instead of the anchor id", async () => {
    const other = document.createElement("button");
    document.body.appendChild(other);
    const tooltip = await fixture<LitMaterialTooltip>(
      html`<lit-material-tooltip show-delay="10" hide-delay="10">More info</lit-material-tooltip>`,
    );
    tooltip.anchorElement = other;

    other.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(30);
    expect(tooltip.open).to.be.true;
    expect(other.getAttribute("aria-describedby")).to.equal(tooltip.id);

    other.remove();
  });

  it("re-dispatches to a new anchor when the anchor id changes", async () => {
    const { container, anchor, tooltip } = await fixtureWithAnchor();
    const secondAnchor = document.createElement("button");
    secondAnchor.id = "second-anchor";
    container.appendChild(secondAnchor);

    tooltip.anchor = "second-anchor";
    await tooltip.updateComplete;

    expect(anchor.hasAttribute("aria-describedby")).to.be.false;
    expect(secondAnchor.getAttribute("aria-describedby")).to.equal(tooltip.id);

    secondAnchor.dispatchEvent(new MouseEvent("mouseenter"));
    await wait(30);
    expect(tooltip.open).to.be.true;
  });

  it("cleans up its anchor listeners and aria-describedby on disconnect", async () => {
    const { anchor, tooltip } = await fixtureWithAnchor();
    tooltip.remove();
    expect(anchor.hasAttribute("aria-describedby")).to.be.false;
  });

  it("passes axe accessibility checks while open", async () => {
    const { tooltip } = await fixtureWithAnchor();
    tooltip.show();
    await tooltip.updateComplete;
    await expect(tooltip).to.be.accessible();
  });
});
