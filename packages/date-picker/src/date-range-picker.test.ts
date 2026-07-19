import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./date-range-picker.js";
import type { LitMaterialDateRangePicker } from "./date-range-picker.js";

function dayButton(el: LitMaterialDateRangePicker, iso: string): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(`.day[data-iso="${iso}"]`)!;
}

function okButton(el: LitMaterialDateRangePicker): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='ok-button']")!;
}

function cancelButton(el: LitMaterialDateRangePicker): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='cancel-button']")!;
}

describe("lit-material-date-range-picker", () => {
  it("shows a placeholder headline and a disabled OK button before any range", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker></lit-material-date-range-picker>`,
    );
    expect(el.shadowRoot!.querySelector(".headline")!.textContent?.trim()).to.equal("Select dates");
    expect(okButton(el).disabled).to.be.true;
  });

  it("syncs the view and range from start/end without calling show()", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("June 2026");
    expect(dayButton(el, "2026-06-10").classList.contains("range-start")).to.be.true;
    expect(dayButton(el, "2026-06-20").classList.contains("range-end")).to.be.true;
    const midCell = dayButton(el, "2026-06-15").closest(".day-cell")!;
    expect(midCell.classList.contains("in-range")).to.be.true;
  });

  it("first click sets a pending start; OK stays disabled until an end is picked", async () => {
    // A degenerate same-day start/end just fixes the view on June 2026 —
    // since `end` is already set, the test's own click below is treated as
    // starting a brand new range, not extending this one.
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-01" end="2026-06-01"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    dayButton(el, "2026-06-10").click();
    await el.updateComplete;

    expect(dayButton(el, "2026-06-10").classList.contains("range-start")).to.be.true;
    expect(okButton(el).disabled).to.be.true;
    expect(el.start).to.equal("2026-06-01"); // unchanged — nothing committed yet
  });

  it("second click (after start) sets the pending end; OK commits both and fires change", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-01" end="2026-06-01"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    dayButton(el, "2026-06-10").click();
    await el.updateComplete;
    dayButton(el, "2026-06-20").click();
    await el.updateComplete;

    expect(el.start).to.equal("2026-06-01"); // not yet committed
    expect(okButton(el).disabled).to.be.false;

    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));
    okButton(el).click();
    await el.updateComplete;

    expect(el.start).to.equal("2026-06-10");
    expect(el.end).to.equal("2026-06-20");
    expect(changeEvent).to.exist;
    expect(el.open).to.be.false;
  });

  it("clicking before the pending start restarts the range from that earlier day", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-01" end="2026-06-01"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    dayButton(el, "2026-06-20").click();
    await el.updateComplete;
    dayButton(el, "2026-06-10").click();
    await el.updateComplete;

    expect(dayButton(el, "2026-06-10").classList.contains("range-start")).to.be.true;
    expect(dayButton(el, "2026-06-20").classList.contains("range-end")).to.be.false;
    expect(okButton(el).disabled).to.be.true;
  });

  it("clicking a third day after a full range restarts a new range", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-01" end="2026-06-01"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    dayButton(el, "2026-06-10").click();
    await el.updateComplete;
    dayButton(el, "2026-06-20").click();
    await el.updateComplete;
    dayButton(el, "2026-06-05").click();
    await el.updateComplete;

    expect(dayButton(el, "2026-06-05").classList.contains("range-start")).to.be.true;
    expect(dayButton(el, "2026-06-20").classList.contains("range-end")).to.be.false;
    expect(okButton(el).disabled).to.be.true;
  });

  it("does not fire change when OK is clicked without changing the range", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    let changed = false;
    el.addEventListener("change", () => (changed = true));
    okButton(el).click();
    await el.updateComplete;

    expect(el.start).to.equal("2026-06-10");
    expect(el.end).to.equal("2026-06-20");
    expect(changed).to.be.false;
  });

  it("cancel discards the in-progress pick and leaves start/end untouched", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    dayButton(el, "2026-06-01").click();
    await el.updateComplete;
    cancelButton(el).click();
    await el.updateComplete;

    expect(el.start).to.equal("2026-06-10");
    expect(el.end).to.equal("2026-06-20");
    expect(el.open).to.be.false;
  });

  it("previews the range on hover between a picked start and the hovered day", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-01" end="2026-06-01"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    dayButton(el, "2026-06-10").click();
    await el.updateComplete;

    dayButton(el, "2026-06-15").dispatchEvent(new MouseEvent("mouseover", { bubbles: true }));
    await el.updateComplete;

    expect(dayButton(el, "2026-06-15").classList.contains("range-end")).to.be.true;
    const midCell = dayButton(el, "2026-06-12").closest(".day-cell")!;
    expect(midCell.classList.contains("in-range")).to.be.true;

    // Leaving the grid clears the preview.
    el.shadowRoot!.querySelector(".calendar")!.dispatchEvent(new MouseEvent("mouseleave", { bubbles: true }));
    await el.updateComplete;
    expect(dayButton(el, "2026-06-15").classList.contains("range-end")).to.be.false;
  });

  it("previews the range as keyboard focus moves past a picked start", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-01" end="2026-06-01"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    // This click starts a fresh range (the seeded start/end above was only
    // there to fix the view on June 2026) — its sole purpose is to pick a
    // start with no end yet, so the arrow-key moves below preview a range.
    dayButton(el, "2026-06-10").click();
    await el.updateComplete;
    dayButton(el, "2026-06-10").focus();

    await sendKeys({ press: "ArrowRight" });
    await sendKeys({ press: "ArrowRight" });
    await el.updateComplete;

    expect(dayButton(el, "2026-06-12").classList.contains("range-end")).to.be.true;
  });

  it("disables day cells outside min/max", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(html`
      <lit-material-date-range-picker
        start="2026-06-15"
        min="2026-06-10"
        max="2026-06-20"
      ></lit-material-date-range-picker>
    `);
    expect(dayButton(el, "2026-06-09").disabled).to.be.true;
    expect(dayButton(el, "2026-06-21").disabled).to.be.true;
    expect(dayButton(el, "2026-06-15").disabled).to.be.false;
  });

  it("navigates to the previous/next month", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button[part='next-button']")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("July 2026");
  });

  it("toggles to the year grid and selecting a year returns to the calendar on that year", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    el.shadowRoot!.querySelector<HTMLButtonElement>(".month-year-button")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".year-grid")).to.exist;

    const yearButton = Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".year")).find(
      (btn) => btn.textContent?.trim() === "2030",
    )!;
    yearButton.click();
    await el.updateComplete;

    expect(el.shadowRoot!.querySelector(".year-grid")).to.not.exist;
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("June 2030");
  });

  it("re-dispatches a composed, bubbling close event", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;

    const closeEventPromise = oneEvent(el, "close");
    el.close();
    const closeEvent = await closeEventPromise;

    expect(closeEvent).to.exist;
    expect(closeEvent.bubbles).to.be.true;
    expect(closeEvent.composed).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialDateRangePicker>(
      html`<lit-material-date-range-picker start="2026-06-10" end="2026-06-20"></lit-material-date-range-picker>`,
    );
    el.show();
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });

  describe("docked variant", () => {
    it("renders the calendar in-flow with no <dialog>, regardless of `open`", async () => {
      const el = await fixture<LitMaterialDateRangePicker>(
        html`<lit-material-date-range-picker
          variant="docked"
          start="2026-06-10"
          end="2026-06-20"
        ></lit-material-date-range-picker>`,
      );
      expect(el.shadowRoot!.querySelector("dialog")).to.not.exist;
      expect(el.shadowRoot!.querySelector(".container")).to.exist;
      expect(dayButton(el, "2026-06-10").classList.contains("range-start")).to.be.true;
    });

    it("commits a range via OK without needing show()/open", async () => {
      const el = await fixture<LitMaterialDateRangePicker>(
        html`<lit-material-date-range-picker
          variant="docked"
          start="2026-06-01"
          end="2026-06-01"
        ></lit-material-date-range-picker>`,
      );
      dayButton(el, "2026-06-10").click();
      await el.updateComplete;
      dayButton(el, "2026-06-20").click();
      await el.updateComplete;

      let changeEvent: Event | undefined;
      el.addEventListener("change", (event) => (changeEvent = event));
      okButton(el).click();
      await el.updateComplete;

      expect(el.start).to.equal("2026-06-10");
      expect(el.end).to.equal("2026-06-20");
      expect(changeEvent).to.exist;
    });

    it("cancel visibly snaps the calendar back to start/end instead of closing anything", async () => {
      const el = await fixture<LitMaterialDateRangePicker>(
        html`<lit-material-date-range-picker
          variant="docked"
          start="2026-06-10"
          end="2026-06-20"
        ></lit-material-date-range-picker>`,
      );
      dayButton(el, "2026-06-01").click();
      await el.updateComplete;
      expect(dayButton(el, "2026-06-01").classList.contains("range-start")).to.be.true;

      cancelButton(el).click();
      await el.updateComplete;

      expect(el.start).to.equal("2026-06-10");
      expect(el.end).to.equal("2026-06-20");
      expect(dayButton(el, "2026-06-10").classList.contains("range-start")).to.be.true;
      expect(dayButton(el, "2026-06-20").classList.contains("range-end")).to.be.true;
    });
  });
});
