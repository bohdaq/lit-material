import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { sendKeys } from "@web/test-runner-commands";
import "./date-picker.js";
import type { LitMaterialDatePicker } from "./date-picker.js";

describe("lit-material-date-picker", () => {
  it("shows a placeholder headline and no selected day before any value", async () => {
    const el = await fixture<LitMaterialDatePicker>(html`<lit-material-date-picker></lit-material-date-picker>`);
    expect(el.shadowRoot!.querySelector(".headline")!.textContent?.trim()).to.equal("Enter date");
    expect(el.shadowRoot!.querySelector(".day.selected")).to.not.exist;
  });

  it("syncs the view and selected day from value without calling show()", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("June 2026");
    const selected = el.shadowRoot!.querySelector(".day.selected") as HTMLButtonElement;
    expect(selected.dataset.iso).to.equal("2026-06-15");
  });

  it("show() opens the dialog", async () => {
    const el = await fixture<LitMaterialDatePicker>(html`<lit-material-date-picker></lit-material-date-picker>`);
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog.open).to.be.false;
    el.show();
    await el.updateComplete;
    expect(dialog.open).to.be.true;
    expect(el.open).to.be.true;
  });

  it("selecting a day highlights it but does not commit value or fire change until OK", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    el.show();
    await el.updateComplete;

    let changed = false;
    el.addEventListener("change", () => (changed = true));

    el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-20"]')!.click();
    await el.updateComplete;

    expect(el.value).to.equal("2026-06-15"); // not yet committed
    expect(changed).to.be.false;
    expect(
      el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-20"]')!.classList.contains("selected"),
    ).to.be.true;

    el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='ok-button']")!.click();
    await el.updateComplete;

    expect(el.value).to.equal("2026-06-20");
    expect(changed).to.be.true;
    expect(el.open).to.be.false;
  });

  it("does not fire change when OK is clicked without changing the selection", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    el.show();
    await el.updateComplete;

    let changed = false;
    el.addEventListener("change", () => (changed = true));

    el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='ok-button']")!.click();
    await el.updateComplete;

    expect(el.value).to.equal("2026-06-15");
    expect(changed).to.be.false;
  });

  it("cancel discards the in-progress pick and leaves value untouched", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    el.show();
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-20"]')!.click();
    await el.updateComplete;

    el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='cancel-button']")!.click();
    await el.updateComplete;

    expect(el.value).to.equal("2026-06-15");
    expect(el.open).to.be.false;

    // Reopening should show the confirmed value again, not the discarded pick.
    el.show();
    await el.updateComplete;
    const selected = el.shadowRoot!.querySelector(".day.selected") as HTMLButtonElement;
    expect(selected.dataset.iso).to.equal("2026-06-15");
  });

  it("navigates to the previous/next month", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button[part='next-button']")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("July 2026");

    el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button[part='prev-button']")!.click();
    await el.updateComplete;
    el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button[part='prev-button']")!.click();
    await el.updateComplete;
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("May 2026");
  });

  it("disables month navigation past min/max", async () => {
    const el = await fixture<LitMaterialDatePicker>(html`
      <lit-material-date-picker value="2026-06-15" min="2026-06-01" max="2026-06-30"></lit-material-date-picker>
    `);
    const prev = el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button[part='prev-button']")!;
    const next = el.shadowRoot!.querySelector<HTMLButtonElement>(".nav-button[part='next-button']")!;
    expect(prev.disabled).to.be.true;
    expect(next.disabled).to.be.true;
  });

  it("disables day cells outside min/max", async () => {
    const el = await fixture<LitMaterialDatePicker>(html`
      <lit-material-date-picker value="2026-06-15" min="2026-06-10" max="2026-06-20"></lit-material-date-picker>
    `);
    const before = el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-09"]')!;
    const after = el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-21"]')!;
    const within = el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-15"]')!;
    expect(before.disabled).to.be.true;
    expect(after.disabled).to.be.true;
    expect(within.disabled).to.be.false;
  });

  it("toggles to the year grid and selecting a year returns to the calendar on that year", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
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

  it("moves the roving-focused day with arrow keys, crossing month boundaries", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-01"></lit-material-date-picker>`,
    );
    // A closed native <dialog> is `display: none` (no [open] attribute), so
    // its descendants can't actually take real focus until it's shown.
    el.show();
    await el.updateComplete;
    const startDay = el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-01"]')!;
    startDay.focus();

    await sendKeys({ press: "ArrowLeft" });
    await el.updateComplete;
    // Crossing the month boundary should switch the view to May 2026.
    expect(el.shadowRoot!.querySelector(".month-year-button")!.textContent).to.contain("May 2026");
    const focused = el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-05-31"]')!;
    expect(el.shadowRoot!.activeElement).to.equal(focused);
  });

  it("Home/End move focus to the first/last day of the visible month", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    el.show();
    await el.updateComplete;
    const startDay = el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-15"]')!;
    startDay.focus();

    await sendKeys({ press: "End" });
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).to.equal(
      el.shadowRoot!.querySelector('.day[data-iso="2026-06-30"]'),
    );

    await sendKeys({ press: "Home" });
    await el.updateComplete;
    expect(el.shadowRoot!.activeElement).to.equal(
      el.shadowRoot!.querySelector('.day[data-iso="2026-06-01"]'),
    );
  });

  it("re-dispatches a composed, bubbling close event", async () => {
    const el = await fixture<LitMaterialDatePicker>(html`<lit-material-date-picker></lit-material-date-picker>`);
    el.show();
    await el.updateComplete;

    // The native <dialog> "close" event this re-dispatches from is queued as
    // a task (per the HTML spec's close() steps), not fired synchronously or
    // even within a microtask — awaiting the real event via oneEvent(),
    // rather than a fixed setTimeout/updateComplete wait, is what actually
    // survives that.
    const closeEventPromise = oneEvent(el, "close");
    el.close();
    const closeEvent = await closeEventPromise;

    expect(closeEvent).to.exist;
    expect(closeEvent.bubbles).to.be.true;
    expect(closeEvent.composed).to.be.true;
  });

  it("passes axe accessibility checks", async () => {
    const el = await fixture<LitMaterialDatePicker>(
      html`<lit-material-date-picker value="2026-06-15"></lit-material-date-picker>`,
    );
    el.show();
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });

  describe("docked variant", () => {
    it("renders the calendar in-flow with no <dialog>, regardless of `open`", async () => {
      const el = await fixture<LitMaterialDatePicker>(
        html`<lit-material-date-picker variant="docked" value="2026-06-15"></lit-material-date-picker>`,
      );
      expect(el.shadowRoot!.querySelector("dialog")).to.not.exist;
      expect(el.shadowRoot!.querySelector(".container")).to.exist;
      expect(el.shadowRoot!.querySelector(".day.selected")).to.exist;
    });

    it("commits a pick via OK without needing show()/open", async () => {
      const el = await fixture<LitMaterialDatePicker>(
        html`<lit-material-date-picker variant="docked" value="2026-06-15"></lit-material-date-picker>`,
      );
      let changeEvent: Event | undefined;
      el.addEventListener("change", (event) => (changeEvent = event));

      el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-20"]')!.click();
      await el.updateComplete;
      expect(el.value).to.equal("2026-06-15"); // not yet committed

      el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='ok-button']")!.click();
      await el.updateComplete;

      expect(el.value).to.equal("2026-06-20");
      expect(changeEvent).to.exist;
    });

    it("cancel visibly snaps the calendar back to value instead of closing anything", async () => {
      const el = await fixture<LitMaterialDatePicker>(
        html`<lit-material-date-picker variant="docked" value="2026-06-15"></lit-material-date-picker>`,
      );
      el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-20"]')!.click();
      await el.updateComplete;
      expect(
        el.shadowRoot!.querySelector<HTMLButtonElement>('.day[data-iso="2026-06-20"]')!.classList.contains("selected"),
      ).to.be.true;

      el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='cancel-button']")!.click();
      await el.updateComplete;

      expect(el.value).to.equal("2026-06-15");
      const reselected = el.shadowRoot!.querySelector(".day.selected") as HTMLButtonElement;
      expect(reselected.dataset.iso).to.equal("2026-06-15");
    });

    it("passes axe accessibility checks", async () => {
      const el = await fixture<LitMaterialDatePicker>(
        html`<lit-material-date-picker variant="docked" value="2026-06-15"></lit-material-date-picker>`,
      );
      await expect(el).to.be.accessible();
    });
  });
});
