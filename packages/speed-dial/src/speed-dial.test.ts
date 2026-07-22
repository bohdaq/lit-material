import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./speed-dial.js";
import "./speed-dial-action.js";
import type { LitMaterialSpeedDial } from "./speed-dial.js";
import type { LitMaterialSpeedDialAction } from "./speed-dial-action.js";

async function speedDialFixture(direction: "up" | "down" = "up") {
  const el = await fixture<LitMaterialSpeedDial>(html`
    <lit-material-speed-dial label="Actions" direction=${direction}>
      <svg slot="icon" viewBox="0 0 24 24"></svg>
      <lit-material-speed-dial-action id="one" label="One">
        <svg slot="icon" viewBox="0 0 24 24"></svg>
      </lit-material-speed-dial-action>
      <lit-material-speed-dial-action id="two" label="Two" disabled>
        <svg slot="icon" viewBox="0 0 24 24"></svg>
      </lit-material-speed-dial-action>
      <lit-material-speed-dial-action id="three" label="Three">
        <svg slot="icon" viewBox="0 0 24 24"></svg>
      </lit-material-speed-dial-action>
    </lit-material-speed-dial>
  `);
  const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLButtonElement;
  const actions = el.shadowRoot!.querySelector(".actions") as HTMLDivElement;
  return { el, trigger, actions };
}

// Not `document.activeElement`: it never equals an element nested inside any
// shadow root (it retargets to the outermost shadow host). Each action is a
// separate custom element (a normal light-DOM child of the speed dial), so
// `document.activeElement` does resolve directly to *it*; the trigger button
// is internal to the speed dial's own shadow root, though, so that needs the
// scoped `el.shadowRoot.activeElement` instead.
//
// These are asserted as booleans, not `expect(x).to.equal(y)` directly on
// the DOM nodes: chai's failure-message formatting has to describe both
// sides when an assertion fails, and describing a real DOM element (shadow
// roots, popover state, ancestor chains) over the test runner's browser/Node
// bridge can hang the whole run instead of just failing that one test.
function isFocused(candidate: Element | null, expected: Element): boolean {
  return candidate === expected;
}

describe("lit-material-speed-dial", () => {
  it("defaults to closed", async () => {
    const { el, actions } = await speedDialFixture();
    expect(el.open).to.be.false;
    expect(actions.matches(":popover-open")).to.be.false;
  });

  it("opens on trigger click and closes on a second click", async () => {
    const { el, trigger, actions } = await speedDialFixture();
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.true;
    expect(actions.matches(":popover-open")).to.be.true;

    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
    expect(actions.matches(":popover-open")).to.be.false;
  });

  it("does not open when disabled", async () => {
    const el = await fixture<LitMaterialSpeedDial>(
      html`<lit-material-speed-dial label="Actions" disabled
        ><svg slot="icon" viewBox="0 0 24 24"></svg
      ></lit-material-speed-dial>`,
    );
    const trigger = el.shadowRoot!.querySelector(".trigger") as HTMLButtonElement;
    trigger.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
  });

  it("closes and refocuses the trigger when an action is activated", async () => {
    const { el, trigger } = await speedDialFixture();
    // `.click()` called programmatically doesn't focus the element the way a
    // real click does — explicitly focus first so the interaction matches
    // what a real user click leaves behind.
    trigger.focus();
    trigger.click();
    await el.updateComplete;
    const one = el.querySelector<LitMaterialSpeedDialAction>("#one")!;
    const oneButton = one.shadowRoot!.querySelector("button") as HTMLButtonElement;
    oneButton.focus();
    oneButton.click();
    await el.updateComplete;
    expect(el.open).to.be.false;
    // The native `toggle` event (which runs the refocus) fires synchronously
    // as part of hidePopover(), but this browser's own post-hide focus
    // handling isn't guaranteed to have settled by the very next microtask —
    // give it one more tick.
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(isFocused(el.shadowRoot!.activeElement, trigger)).to.be.true;
  });

  it("dispatches a close event when closed", async () => {
    const { el, trigger } = await speedDialFixture();
    trigger.click();
    await el.updateComplete;
    setTimeout(() => el.close());
    const event = await oneEvent(el, "close");
    expect(event).to.exist;
  });

  it("closes on Escape and refocuses the trigger", async () => {
    const { el, trigger } = await speedDialFixture();
    trigger.focus();
    trigger.click();
    await el.updateComplete;
    await sendKeys({ press: "Escape" });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(el.open).to.be.false;
    expect(isFocused(el.shadowRoot!.activeElement, trigger)).to.be.true;
  });

  it("direction=up: ArrowUp from the trigger enters the first (closest) action, skipping disabled", async () => {
    const { el, trigger } = await speedDialFixture("up");
    trigger.click();
    await el.updateComplete;
    trigger.focus();

    await sendKeys({ press: "ArrowUp" });
    expect(isFocused(document.activeElement, el.querySelector("#one")!)).to.be.true;

    await sendKeys({ press: "ArrowUp" });
    expect(isFocused(document.activeElement, el.querySelector("#three")!)).to.be.true; // #two is disabled

    // Past the last action, ArrowUp does nothing further (no wrap).
    await sendKeys({ press: "ArrowUp" });
    expect(isFocused(document.activeElement, el.querySelector("#three")!)).to.be.true;

    // ArrowDown steps back toward the trigger.
    await sendKeys({ press: "ArrowDown" });
    expect(isFocused(document.activeElement, el.querySelector("#one")!)).to.be.true;
    await sendKeys({ press: "ArrowDown" });
    expect(isFocused(el.shadowRoot!.activeElement, trigger)).to.be.true;
  });

  it("direction=down: ArrowDown from the trigger enters the actions instead of ArrowUp", async () => {
    const { el, trigger } = await speedDialFixture("down");
    trigger.click();
    await el.updateComplete;
    trigger.focus();

    await sendKeys({ press: "ArrowDown" });
    expect(isFocused(document.activeElement, el.querySelector("#one")!)).to.be.true;
  });

  it("Home/End jump to the first/last enabled action", async () => {
    const { el, trigger } = await speedDialFixture();
    trigger.click();
    await el.updateComplete;
    trigger.focus();

    await sendKeys({ press: "End" });
    expect(isFocused(document.activeElement, el.querySelector("#three")!)).to.be.true;
    await sendKeys({ press: "Home" });
    expect(isFocused(document.activeElement, el.querySelector("#one")!)).to.be.true;
  });

  it("rotates the trigger icon while open (visual state via the open attribute)", async () => {
    const { el, trigger } = await speedDialFixture();
    expect(el.hasAttribute("open")).to.be.false;
    trigger.click();
    await el.updateComplete;
    expect(el.hasAttribute("open")).to.be.true;
  });

  it("passes axe accessibility checks while open", async () => {
    const { el, trigger } = await speedDialFixture();
    trigger.click();
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });
});
