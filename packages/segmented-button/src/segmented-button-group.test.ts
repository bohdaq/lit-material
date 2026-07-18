import { expect, fixture, html } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./segmented-button-group.js";
import "./segmented-button.js";
import type { LitMaterialSegmentedButtonGroup } from "./segmented-button-group.js";

async function groupFixture(multiselect = false) {
  const el = await fixture<LitMaterialSegmentedButtonGroup>(html`
    <lit-material-segmented-button-group ?multiselect=${multiselect}>
      <lit-material-segmented-button selected>Day</lit-material-segmented-button>
      <lit-material-segmented-button>Week</lit-material-segmented-button>
      <lit-material-segmented-button disabled>Month (disabled)</lit-material-segmented-button>
      <lit-material-segmented-button>Year</lit-material-segmented-button>
    </lit-material-segmented-button-group>
  `);
  const buttons = Array.from(el.querySelectorAll("lit-material-segmented-button"));
  return { el, buttons };
}

describe("lit-material-segmented-button-group", () => {
  it("renders with role=group", async () => {
    const { el } = await groupFixture();
    expect(el.getAttribute("role")).to.equal("group");
  });

  it("gives only the selected button a real tabindex of 0 by default", async () => {
    const { buttons } = await groupFixture();
    const inner = buttons.map((button) => button.shadowRoot!.querySelector("button")!);
    expect(inner[0]!.tabIndex).to.equal(0);
    expect(inner[1]!.tabIndex).to.equal(-1);
  });

  it("single-select: clicking an unselected button selects it and deselects the others, dispatching change", async () => {
    const { el, buttons } = await groupFixture();
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    buttons[1]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(buttons[1]!.selected).to.be.true;
    expect(buttons[0]!.selected).to.be.false;
    expect(changeEvent).to.exist;
  });

  it("single-select: clicking the already-selected button is a no-op (still selected, no change event)", async () => {
    const { el, buttons } = await groupFixture();
    let changed = false;
    el.addEventListener("change", () => (changed = true));

    buttons[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(buttons[0]!.selected).to.be.true;
    expect(changed).to.be.false;
  });

  it("ignores clicks on a disabled button", async () => {
    const { el, buttons } = await groupFixture();
    let changed = false;
    el.addEventListener("change", () => (changed = true));

    buttons[2]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(buttons[2]!.selected).to.be.false;
    expect(changed).to.be.false;
  });

  it("multiselect: clicking toggles each button independently, allowing more than one selected", async () => {
    const { el, buttons } = await groupFixture(true);
    buttons[1]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;

    expect(buttons[0]!.selected).to.be.true;
    expect(buttons[1]!.selected).to.be.true;

    buttons[0]!.shadowRoot!.querySelector("button")!.click();
    await el.updateComplete;
    expect(buttons[0]!.selected).to.be.false;
    expect(buttons[1]!.selected).to.be.true;
  });

  it("moves the roving tabindex with ArrowRight/ArrowLeft, wrapping, and skips disabled buttons", async () => {
    const { buttons } = await groupFixture();
    const inner = buttons.map((button) => button.shadowRoot!.querySelector("button")!);
    inner[0]!.focus();

    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(buttons[1]);

    // Month is disabled, so ArrowRight from Week skips straight to Year.
    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(buttons[3]);

    await sendKeys({ press: "ArrowRight" });
    expect(document.activeElement).to.equal(buttons[0]);

    await sendKeys({ press: "ArrowLeft" });
    expect(document.activeElement).to.equal(buttons[3]);
  });

  it("jumps to the first/last enabled button with Home/End", async () => {
    const { buttons } = await groupFixture();
    const inner = buttons.map((button) => button.shadowRoot!.querySelector("button")!);
    inner[1]!.focus();

    await sendKeys({ press: "End" });
    expect(document.activeElement).to.equal(buttons[3]);

    await sendKeys({ press: "Home" });
    expect(document.activeElement).to.equal(buttons[0]);
  });

  it("does not select on arrow-key navigation alone (manual activation, unlike lit-material-tabs)", async () => {
    const { el, buttons } = await groupFixture();
    const inner = buttons.map((button) => button.shadowRoot!.querySelector("button")!);
    inner[0]!.focus();

    await sendKeys({ press: "ArrowRight" });
    await el.updateComplete;

    expect(buttons[0]!.selected).to.be.true;
    expect(buttons[1]!.selected).to.be.false;
  });

  it("passes axe accessibility checks", async () => {
    const { el } = await groupFixture();
    await expect(el).to.be.accessible();
  });
});
