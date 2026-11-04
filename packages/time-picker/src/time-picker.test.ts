import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./time-picker.js";
import type { LitMaterialTimePicker } from "./time-picker.js";

function hourField(el: LitMaterialTimePicker): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(".field.hour")!;
}

function minuteField(el: LitMaterialTimePicker): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(".field.minute")!;
}

function dialButton(el: LitMaterialTimePicker, label: string): HTMLButtonElement {
  return Array.from(el.shadowRoot!.querySelectorAll<HTMLButtonElement>(".dial-number")).find(
    (button) => button.textContent?.trim() === label,
  )!;
}

function okButton(el: LitMaterialTimePicker): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='ok-button']")!;
}

function cancelButton(el: LitMaterialTimePicker): HTMLButtonElement {
  return el.shadowRoot!.querySelector<HTMLButtonElement>(".text-button[part='cancel-button']")!;
}

describe("lit-material-time-picker", () => {
  it("syncs the displayed hour/minute from value without calling show()", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="14:05"></lit-material-time-picker>`);
    expect(hourField(el).textContent?.trim()).to.equal("2"); // 12-hour display by default
    expect(minuteField(el).textContent?.trim()).to.equal("05");
  });

  it("show() opens the dialog and resets the pending selection to value", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    const dialog = el.shadowRoot!.querySelector("dialog")!;
    expect(dialog.open).to.be.false;
    el.show();
    await el.updateComplete;
    expect(dialog.open).to.be.true;
    expect(hourField(el).textContent?.trim()).to.equal("9");
  });

  it("starts in hour mode; clicking an hour on the dial selects it and auto-advances to minute mode", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;
    expect(hourField(el).classList.contains("active")).to.be.true;

    dialButton(el, "3").click();
    await el.updateComplete;

    expect(hourField(el).textContent?.trim()).to.equal("3");
    expect(minuteField(el).classList.contains("active")).to.be.true; // auto-advanced
  });

  it("clicking a minute on the dial selects it without changing mode further", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;
    minuteField(el).click();
    await el.updateComplete;

    dialButton(el, "45").click();
    await el.updateComplete;

    expect(minuteField(el).textContent?.trim()).to.equal("45");
  });

  it("clicking the hour/minute fields switches which one the dial edits", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;

    minuteField(el).click();
    await el.updateComplete;
    expect(minuteField(el).classList.contains("active")).to.be.true;
    expect(hourField(el).classList.contains("active")).to.be.false;

    hourField(el).click();
    await el.updateComplete;
    expect(hourField(el).classList.contains("active")).to.be.true;
  });

  it("toggling AM/PM changes the period without changing the hour-of-day number shown", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;

    const pmButton = el.shadowRoot!.querySelector<HTMLButtonElement>(".period[part='pm-button']")!;
    expect(pmButton.classList.contains("selected")).to.be.false;
    pmButton.click();
    await el.updateComplete;

    expect(pmButton.classList.contains("selected")).to.be.true;
    expect(hourField(el).textContent?.trim()).to.equal("9"); // still "9", now PM instead of AM
  });

  it("commits the pending selection via OK and fires change", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;

    dialButton(el, "3").click();
    await el.updateComplete;
    dialButton(el, "45").click();
    await el.updateComplete;

    expect(el.value).to.equal("09:30"); // not yet committed
    let changeEvent: Event | undefined;
    el.addEventListener("change", (event) => (changeEvent = event));

    okButton(el).click();
    await el.updateComplete;

    expect(el.value).to.equal("03:45");
    expect(changeEvent).to.exist;
    expect(el.open).to.be.false;
  });

  it("does not fire change when OK is clicked without changing the selection", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;

    let changed = false;
    el.addEventListener("change", () => (changed = true));
    okButton(el).click();
    await el.updateComplete;

    expect(el.value).to.equal("09:30");
    expect(changed).to.be.false;
  });

  it("cancel discards the in-progress pick and leaves value untouched", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;

    dialButton(el, "3").click();
    await el.updateComplete;
    cancelButton(el).click();
    await el.updateComplete;

    expect(el.value).to.equal("09:30");
    expect(el.open).to.be.false;
  });

  it("dragging on the dial selects the value at the pointed-at position", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;

    const dial = el.shadowRoot!.querySelector<HTMLElement>(".dial")!;
    const rect = dial.getBoundingClientRect();
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    // The "3" position on the outer ring is 90° clockwise from 12 o'clock —
    // directly to the right of center, at the dial's 100px number radius.
    const targetX = centerX + 100;
    const targetY = centerY;

    dial.dispatchEvent(
      new PointerEvent("pointerdown", { clientX: targetX, clientY: targetY, pointerId: 1, bubbles: true, composed: true }),
    );
    await el.updateComplete;
    dial.dispatchEvent(
      new PointerEvent("pointerup", { clientX: targetX, clientY: targetY, pointerId: 1, bubbles: true, composed: true }),
    );
    await el.updateComplete;

    expect(hourField(el).textContent?.trim()).to.equal("3");
    expect(minuteField(el).classList.contains("active")).to.be.true; // drag-release also auto-advances
  });

  describe("24-hour mode", () => {
    it("shows a zero-padded hour with no AM/PM toggle", async () => {
      const el = await fixture<LitMaterialTimePicker>(
        html`<lit-material-time-picker value="14:05" hour-cycle="24"></lit-material-time-picker>`,
      );
      expect(hourField(el).textContent?.trim()).to.equal("14");
      expect(el.shadowRoot!.querySelector(".period-toggle")).to.not.exist;
    });

    it("renders both an outer (1-12) and inner (13-23, 00) ring, and selects an inner-ring hour correctly", async () => {
      const el = await fixture<LitMaterialTimePicker>(
        html`<lit-material-time-picker value="09:30" hour-cycle="24"></lit-material-time-picker>`,
      );
      el.show();
      await el.updateComplete;

      expect(dialButton(el, "9")).to.exist; // outer ring
      expect(dialButton(el, "18")).to.exist; // inner ring

      dialButton(el, "18").click();
      await el.updateComplete;
      expect(hourField(el).textContent?.trim()).to.equal("18");
    });

    it("selects midnight (00) from the inner ring", async () => {
      const el = await fixture<LitMaterialTimePicker>(
        html`<lit-material-time-picker value="09:30" hour-cycle="24"></lit-material-time-picker>`,
      );
      el.show();
      await el.updateComplete;

      dialButton(el, "00").click();
      await el.updateComplete;
      expect(hourField(el).textContent?.trim()).to.equal("00");
    });
  });

  it("re-dispatches a composed, bubbling close event", async () => {
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker></lit-material-time-picker>`);
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
    const el = await fixture<LitMaterialTimePicker>(html`<lit-material-time-picker value="09:30"></lit-material-time-picker>`);
    el.show();
    await el.updateComplete;
    await expect(el).to.be.accessible();
  });

  it("translates its text and formats digits in the element's language", async () => {
    registerTranslation({
      $code: "x-time",
      "timePicker.selectTime": "Choisir l'heure",
      "timePicker.hour": "Heure",
      "timePicker.cancel": "Annuler",
      "timePicker.ok": "Valider",
      "timePicker.am": "matin",
      "timePicker.pm": "soir",
    });
    const wrap = await fixture<HTMLElement>(html`<div lang="x-time"><lit-material-time-picker value="14:05"></lit-material-time-picker></div>`);
    const el = wrap.querySelector<LitMaterialTimePicker>("lit-material-time-picker")!;
    await el.updateComplete;
    const root = el.shadowRoot!;
    expect(root.querySelector("#time-headline")!.textContent!.trim()).to.equal("Choisir l'heure");
    expect(hourField(el).getAttribute("aria-label")).to.equal("Heure");
    expect(cancelButton(el).textContent!.trim()).to.equal("Annuler");
    expect(okButton(el).textContent!.trim()).to.equal("Valider");
    expect(root.querySelector("[part=am-button]")!.textContent!.trim()).to.equal("matin");
    expect(root.querySelector("[part=pm-button]")!.textContent!.trim()).to.equal("soir");
    el.label = "Départ";
    await el.updateComplete;
    expect(root.querySelector("#time-headline")!.textContent!.trim()).to.equal("Départ");

    wrap.setAttribute("lang", "ar-EG");
    el.requestUpdate();
    await el.updateComplete;
    const nf = new Intl.NumberFormat("ar-EG", { minimumIntegerDigits: 2 });
    expect(minuteField(el).textContent!.trim()).to.equal(nf.format(5));
  });

  it("keeps hours:minutes left to right, with AM/PM at the end, right to left", async () => {
    const wrap = await fixture<HTMLElement>(html`<div dir="rtl"><lit-material-time-picker value="14:05"></lit-material-time-picker></div>`);
    const el = wrap.querySelector<LitMaterialTimePicker>("lit-material-time-picker")!;
    el.show();
    await el.updateComplete;
    const hour = hourField(el).getBoundingClientRect();
    const minute = minuteField(el).getBoundingClientRect();
    const toggle = el.shadowRoot!.querySelector("[part=period-toggle]")!.getBoundingClientRect();
    expect(hour.right).to.be.at.most(minute.left);
    expect(toggle.right).to.be.at.most(hour.left);
    el.close();
  });
});
