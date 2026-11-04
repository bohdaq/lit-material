import { expect, fixture, html, oneEvent } from "@open-wc/testing";
import { resetMouse, sendKeys, sendMouse } from "@web/test-runner-commands";
import { registerTranslation } from "@lit-material/core/localize.js";
import "./calendar.js";
import type { CalendarEvent, LitMaterialCalendar } from "./calendar.js";

const sample: CalendarEvent[] = [
  { id: "standup", title: "Standup", start: "2026-06-15T09:00", end: "2026-06-15T09:30" },
  { id: "review", title: "Review", start: "2026-06-15T09:00", end: "2026-06-15T10:30" },
  { id: "lunch", title: "Lunch", start: "2026-06-15T12:00", end: "2026-06-15T13:00", color: "#386a20" },
  { id: "offsite", title: "Offsite", start: "2026-06-16", end: "2026-06-18" },
];

const $ = <T extends Element = HTMLElement>(el: LitMaterialCalendar, selector: string) => el.shadowRoot!.querySelector<T & HTMLElement>(selector)!;
const $$ = (el: LitMaterialCalendar, selector: string) => [...el.shadowRoot!.querySelectorAll<HTMLElement>(selector)];
const chip = (el: LitMaterialCalendar, key: string) => $$(el, ".event").find((c) => c.dataset.key === key)!;
const focused = (el: LitMaterialCalendar) => el.shadowRoot!.activeElement as HTMLElement | null;
/**
 * Alt+Left/Right and Alt+Shift chords are browser shortcuts (history, layout switching) that Firefox and WebKit
 * don't always hand to the page under automation, so those are dispatched on the focused element; Alt+Up/Down
 * use real key presses.
 */
const altKey = (el: LitMaterialCalendar, key: string, shiftKey = false) => {
  const target = focused(el);
  expect(target?.classList.contains("event"), "an event chip has focus").to.be.true;
  target!.dispatchEvent(new KeyboardEvent("keydown", { key, altKey: true, shiftKey, bubbles: true, composed: true, cancelable: true }));
};
const center = (target: Element): [number, number] => {
  const r = target.getBoundingClientRect();
  return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)];
};

async function calendar(attrs: { view?: string; date?: string; events?: CalendarEvent[]; firstDay?: number; lang?: string; dir?: string } = {}) {
  const el = await fixture<LitMaterialCalendar>(html`<lit-material-calendar
    view=${attrs.view ?? "month"}
    date=${attrs.date ?? "2026-06-15"}
    first-day-of-week=${attrs.firstDay ?? 1}
    lang=${attrs.lang ?? "en"}
    dir=${attrs.dir ?? "ltr"}
    .events=${attrs.events ?? sample}
  ></lit-material-calendar>`);
  await el.updateComplete;
  return el;
}

describe("lit-material-calendar", () => {
  afterEach(async () => {
    await resetMouse();
  });

  describe("month view", () => {
    it("renders the weeks around the month with a title, weekday headers and event chips", async () => {
      const el = await calendar();
      expect($(el, ".title").textContent!.trim()).to.equal("June 2026");
      expect($(el, ".month").getAttribute("role")).to.equal("grid");
      const days = $$(el, ".day");
      expect(days.length).to.equal(35); // Mon Jun 1 .. Sun Jul 5
      expect(days[0]!.dataset.date).to.equal("2026-06-01");
      expect(days[34]!.dataset.date).to.equal("2026-07-05");
      expect(days[34]!.classList.contains("outside")).to.be.true;
      expect($$(el, ".weekday").map((w) => w.textContent!.trim())[0]).to.equal("Mon");
      const offsite = chip(el, "offsite");
      expect(offsite.closest(".day")!.getAttribute("data-date")).to.equal("2026-06-16");
      expect(offsite.style.getPropertyValue("--span")).to.equal("2");
      expect(offsite.getAttribute("aria-label")).to.match(/^Offsite, Tuesday, June 16\s–\sWednesday, June 17, all day$/);
      expect(chip(el, "standup").getAttribute("aria-label")).to.match(/^Standup, Monday, June 15, 9:00\s?–\s?9:30\sAM$/);
      expect($(el, '[data-date="2026-06-15"]').getAttribute("aria-label")).to.equal("Monday, June 15, 2026, 3 events");
    });

    it('collapses events past day-max-events into "+N more", which opens the day', async () => {
      const el = await calendar();
      el.dayMaxEvents = 2;
      await el.updateComplete;
      const more = $(el, '[data-date="2026-06-15"] .more');
      expect(more.textContent!.trim()).to.equal("+1 more");
      expect(more.getAttribute("aria-label")).to.equal("1 more event, Monday, June 15, 2026");
      setTimeout(() => more.click());
      const { detail } = await oneEvent(el, "navigate");
      expect(detail.view).to.equal("day");
      expect(detail.date).to.equal("2026-06-15");
      expect(el.view).to.equal("day");
    });

    it("fires event-click for a chip and slot-click for an empty day", async () => {
      const el = await calendar();
      setTimeout(() => chip(el, "lunch").click());
      const click = await oneEvent(el, "event-click");
      expect(click.detail.event).to.equal(sample[2]);

      setTimeout(() => $(el, '[data-date="2026-06-20"]').click());
      const slot = await oneEvent(el, "slot-click");
      expect(slot.detail.allDay).to.be.true;
      expect(slot.detail.start.getTime()).to.equal(new Date(2026, 5, 20).getTime());
      expect(slot.detail.end.getTime()).to.equal(new Date(2026, 5, 21).getTime());
      expect(el.date).to.equal("2026-06-20");
    });

    it("moves focus by day and week with arrows, PageUp/PageDown by month, Home/End and T", async () => {
      const el = await calendar();
      $(el, '[data-date="2026-06-15"]').focus();
      await sendKeys({ press: "ArrowRight" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-16");
      await sendKeys({ press: "ArrowDown" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-23");
      await sendKeys({ press: "End" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-28");
      await sendKeys({ press: "Home" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-22");
      const navigated = oneEvent(el, "navigate");
      await sendKeys({ press: "PageDown" });
      expect((await navigated).detail.date).to.equal("2026-07-22");
      await el.updateComplete;
      expect($(el, ".title").textContent!.trim()).to.equal("July 2026");
      expect(focused(el)!.dataset.date).to.equal("2026-07-22");
      await sendKeys({ press: "t" });
      await el.updateComplete;
      const now = new Date();
      const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      expect(focused(el)!.dataset.date).to.equal(iso);
    });

    it("flips Left/Right in right-to-left layouts", async () => {
      const el = await calendar({ dir: "rtl" });
      $(el, '[data-date="2026-06-15"]').focus();
      await sendKeys({ press: "ArrowLeft" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-16");
      await sendKeys({ press: "ArrowRight" });
      await sendKeys({ press: "ArrowRight" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-14");
    });

    it("activates the focused day with Enter and an event with Enter", async () => {
      const el = await calendar();
      $(el, '[data-date="2026-06-15"]').focus();
      setTimeout(() => sendKeys({ press: "Enter" }));
      const slot = await oneEvent(el, "slot-click");
      expect(slot.detail.start.getDate()).to.equal(15);
      await sendKeys({ press: "Tab" });
      expect(focused(el)!.classList.contains("event")).to.be.true;
      setTimeout(() => sendKeys({ press: "Enter" }));
      const click = await oneEvent(el, "event-click");
      expect(click.detail.event.id).to.equal(focused(el)!.dataset.key);
    });

    it("moves an all-day event by a day with Alt+ArrowRight (mirrored in RTL) and by a week with Alt+ArrowDown", async () => {
      const el = await calendar();
      chip(el, "offsite").focus();
      setTimeout(() => altKey(el, "ArrowRight"));
      let change = await oneEvent(el, "event-change");
      expect(change.detail.event).to.equal(sample[3]);
      expect(change.detail.allDay).to.be.true;
      expect(change.detail.start.getTime()).to.equal(new Date(2026, 5, 17).getTime());
      expect(change.detail.end.getTime()).to.equal(new Date(2026, 5, 19).getTime());
      setTimeout(() => sendKeys({ press: "Alt+ArrowDown" }));
      change = await oneEvent(el, "event-change");
      expect(change.detail.start.getDate()).to.equal(23);

      el.setAttribute("dir", "rtl");
      chip(el, "offsite").focus();
      setTimeout(() => altKey(el, "ArrowRight"));
      change = await oneEvent(el, "event-change");
      expect(change.detail.start.getDate()).to.equal(15);
    });
  });

  describe("week and day views", () => {
    it("renders a time grid: day headers, an all-day row and slot rows with positioned events", async () => {
      const el = await calendar({ view: "week" });
      expect($(el, ".title").textContent!.trim()).to.match(/^Jun 15\s–\s21, 2026$/);
      expect($$(el, ".day-header").length).to.equal(7);
      expect($$(el, ".day-header")[0]!.getAttribute("aria-label")).to.equal("Monday, June 15, 2026");
      expect($$(el, ".slot-row").length).to.equal(48);
      const allDay = chip(el, "offsite");
      expect(allDay.closest(".all-day-cell")!.getAttribute("data-date")).to.equal("2026-06-16");
      const lunch = chip(el, "lunch");
      const cell = lunch.closest(".slot")!;
      expect(cell.getAttribute("data-date")).to.equal("2026-06-15");
      expect(cell.getAttribute("data-slot")).to.equal("24");
      expect(lunch.style.getPropertyValue("--length")).to.equal("2");
      expect(lunch.style.getPropertyValue("--event-color")).to.equal("#386a20");
      // The grid scrolls to 8:00.
      const grid = $(el, ".time-grid");
      expect(grid.scrollTop).to.be.greaterThan(0);
    });

    it("lays overlapping events out side by side", async () => {
      const el = await calendar({ view: "day" });
      const review = chip(el, "review");
      const standup = chip(el, "standup");
      expect([review.style.getPropertyValue("--col"), review.style.getPropertyValue("--cols")]).to.deep.equal(["0", "2"]);
      expect([standup.style.getPropertyValue("--col"), standup.style.getPropertyValue("--cols")]).to.deep.equal(["1", "2"]);
      const a = review.getBoundingClientRect();
      const b = standup.getBoundingClientRect();
      expect(b.left).to.be.at.least(a.right - 1);
      expect(chip(el, "lunch").style.getPropertyValue("--cols")).to.equal("1");
      expect($$(el, ".day-header").length).to.equal(1);
      expect($(el, ".title").textContent!.trim()).to.equal("Monday, June 15, 2026");
    });

    it("fires slot-click with the slot's times for a click on an empty slot and on the all-day row", async () => {
      const el = await calendar({ view: "week" });
      setTimeout(() => $(el, '.slot[data-date="2026-06-17"][data-slot="20"]').click());
      const slot = await oneEvent(el, "slot-click");
      expect(slot.detail).to.deep.equal({ start: new Date(2026, 5, 17, 10, 0), end: new Date(2026, 5, 17, 10, 30), allDay: false });
      setTimeout(() => $(el, '.all-day-cell[data-date="2026-06-19"]').click());
      const allDay = await oneEvent(el, "slot-click");
      expect(allDay.detail.allDay).to.be.true;
    });

    it("moves through slots and days with the keyboard, and Shift+arrows select a range for Enter", async () => {
      const el = await calendar({ view: "week" });
      $(el, '.slot[data-date="2026-06-15"][data-slot="16"]').focus();
      await sendKeys({ press: "ArrowDown" });
      await el.updateComplete;
      expect(focused(el)!.dataset.slot).to.equal("17");
      await sendKeys({ press: "ArrowRight" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-16");
      await sendKeys({ press: "Shift+ArrowDown" });
      await sendKeys({ press: "Shift+ArrowDown" });
      await el.updateComplete;
      expect($$(el, ".slot.selected").map((c) => c.dataset.slot)).to.deep.equal(["17", "18", "19"]);
      setTimeout(() => sendKeys({ press: "Enter" }));
      const slot = await oneEvent(el, "slot-click");
      expect(slot.detail.start.getTime()).to.equal(new Date(2026, 5, 16, 8, 30).getTime());
      expect(slot.detail.end.getTime()).to.equal(new Date(2026, 5, 16, 10, 0).getTime());
      await sendKeys({ press: "End" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-21");
      const navigated = oneEvent(el, "navigate");
      await sendKeys({ press: "PageDown" });
      expect((await navigated).detail.start.getTime()).to.equal(new Date(2026, 5, 22).getTime());
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-28");
    });

    it("flips Left/Right in right-to-left layouts", async () => {
      const el = await calendar({ view: "week", dir: "rtl" });
      $(el, '.slot[data-date="2026-06-16"][data-slot="18"]').focus();
      await sendKeys({ press: "ArrowLeft" });
      await el.updateComplete;
      expect(focused(el)!.dataset.date).to.equal("2026-06-17");
    });

    it("moves and resizes a timed event with Alt+arrows; the app's update is focused and announced", async () => {
      const events = [...sample];
      const el = await calendar({ view: "week", events });
      el.addEventListener("event-change", (e) => {
        const { event, start, end } = e.detail;
        el.events = el.events.map((x) => (x === event ? { ...x, start, end } : x));
      });
      chip(el, "lunch").focus();
      setTimeout(() => sendKeys({ press: "Alt+ArrowDown" }));
      let change = await oneEvent(el, "event-change");
      expect(change.detail.start.getTime()).to.equal(new Date(2026, 5, 15, 12, 30).getTime());
      expect(change.detail.end.getTime()).to.equal(new Date(2026, 5, 15, 13, 30).getTime());
      await el.updateComplete;
      await el.updateComplete;
      expect(focused(el)!.dataset.key).to.equal("lunch");
      expect(focused(el)!.closest(".slot")!.getAttribute("data-slot")).to.equal("25");
      expect($(el, '[role="status"]').textContent).to.match(/^Lunch, Monday, June 15, 12:30\s?–\s?1:30\sPM$/);

      setTimeout(() => altKey(el, "ArrowUp", true));
      change = await oneEvent(el, "event-change");
      expect(change.detail.start.getTime()).to.equal(new Date(2026, 5, 15, 12, 30).getTime());
      expect(change.detail.end.getTime()).to.equal(new Date(2026, 5, 15, 13, 0).getTime());
      await el.updateComplete;

      setTimeout(() => altKey(el, "ArrowRight"));
      change = await oneEvent(el, "event-change");
      expect(change.detail.start.getDate()).to.equal(16);
    });

    it("a canceled event-change leaves the event where it was", async () => {
      const el = await calendar({ view: "day" });
      el.addEventListener("event-change", (e) => e.preventDefault());
      chip(el, "lunch").focus();
      setTimeout(() => sendKeys({ press: "Alt+ArrowDown" }));
      const change = await oneEvent(el, "event-change");
      expect(change.defaultPrevented).to.be.true;
      await el.updateComplete;
      expect(chip(el, "lunch").closest(".slot")!.getAttribute("data-slot")).to.equal("24");
      expect($(el, '[role="status"]').textContent).to.equal("");
    });

    it("drags out a time range on empty slots", async () => {
      const el = await calendar({ view: "day" });
      const from = $(el, '.slot[data-slot="28"]');
      const to = $(el, '.slot[data-slot="30"]');
      from.scrollIntoView({ block: "center" });
      const [x1, y1] = center(from);
      const [, y2] = center(to);
      const fired = oneEvent(el, "slot-click");
      await sendMouse({ type: "move", position: [x1, y1] });
      await sendMouse({ type: "down" });
      await sendMouse({ type: "move", position: [x1, y1 + 10] });
      await sendMouse({ type: "move", position: [x1, y2] });
      await el.updateComplete;
      expect($$(el, ".slot.selected").length).to.equal(3);
      await sendMouse({ type: "up" });
      const { detail } = await fired;
      expect(detail.start.getTime()).to.equal(new Date(2026, 5, 15, 14, 0).getTime());
      expect(detail.end.getTime()).to.equal(new Date(2026, 5, 15, 15, 30).getTime());
      expect(detail.allDay).to.be.false;
    });

    it("drags an event to another time and resizes it by its bottom edge", async () => {
      const el = await calendar({ view: "day" });
      const lunch = chip(el, "lunch");
      lunch.scrollIntoView({ block: "center" });
      let clicked = false;
      el.addEventListener("event-click", () => (clicked = true));
      const [x, y] = center(lunch);
      const target = $(el, '.slot[data-slot="26"]');
      const fired = oneEvent(el, "event-change");
      await sendMouse({ type: "move", position: [x, y - 12] });
      await sendMouse({ type: "down" });
      await sendMouse({ type: "move", position: [x, y] });
      await sendMouse({ type: "move", position: [x, center(target)[1] - 12] });
      await el.updateComplete;
      expect(chip(el, "lunch").classList.contains("dragging")).to.be.true;
      await sendMouse({ type: "up" });
      const { detail } = await fired;
      expect(detail.start.getTime()).to.equal(new Date(2026, 5, 15, 13, 0).getTime());
      expect(detail.end.getTime()).to.equal(new Date(2026, 5, 15, 14, 0).getTime());
      await new Promise((r) => setTimeout(r, 10));
      expect(clicked).to.be.false;

      const handle = chip(el, "lunch").querySelector(".resize")!;
      const box = handle.getBoundingClientRect();
      const resized = oneEvent(el, "event-change");
      await sendMouse({ type: "move", position: [Math.round(box.left + box.width / 2), Math.round(box.top + 2)] });
      await sendMouse({ type: "down" });
      await sendMouse({ type: "move", position: [Math.round(box.left + box.width / 2), Math.round(box.top + 2 + 24 * 2)] });
      await sendMouse({ type: "up" });
      const r = await resized;
      expect(r.detail.start.getTime()).to.equal(new Date(2026, 5, 15, 12, 0).getTime());
      expect(r.detail.end.getTime()).to.equal(new Date(2026, 5, 15, 14, 0).getTime());
    });

    it("draws the current-time line in today's column once in the browser", async () => {
      const now = new Date();
      const iso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
      const el = await calendar({ view: "day", date: iso, events: [] });
      await el.updateComplete;
      const line = $(el, ".now");
      expect(line).to.exist;
      expect(line.closest(".slot")!.getAttribute("data-slot")).to.equal(String(Math.floor((now.getHours() * 60 + now.getMinutes()) / 30)));
    });

    it("readonly disables moves", async () => {
      const el = await calendar({ view: "day" });
      el.readonly = true;
      await el.updateComplete;
      let fired = false;
      el.addEventListener("event-change", () => (fired = true));
      chip(el, "lunch").focus();
      await sendKeys({ press: "Alt+ArrowDown" });
      expect(fired).to.be.false;
      expect(chip(el, "lunch").querySelector(".resize")).to.not.exist;
    });
  });

  describe("agenda view", () => {
    it("lists the days with events in order, and arrows move between them", async () => {
      const el = await calendar({ view: "agenda" });
      expect($$(el, ".agenda-date").map((d) => d.textContent!.trim())).to.deep.equal(["Mon, Jun 15", "Tue, Jun 16", "Wed, Jun 17"]);
      const items = $$(el, ".agenda-event");
      expect(items.map((i) => i.dataset.key)).to.deep.equal(["standup", "review", "lunch", "offsite", "offsite"]);
      expect(items[3]!.querySelector(".agenda-time")!.textContent!.trim()).to.equal("All day");
      items[0]!.focus();
      await sendKeys({ press: "ArrowDown" });
      await el.updateComplete;
      expect(focused(el)!.dataset.index).to.equal("1");
      await sendKeys({ press: "End" });
      await el.updateComplete;
      expect(focused(el)!.dataset.index).to.equal("4");
      setTimeout(() => sendKeys({ press: "Enter" }));
      const click = await oneEvent(el, "event-click");
      expect(click.detail.event).to.equal(sample[3]);
    });

    it("shows a message when there are no events", async () => {
      const el = await calendar({ view: "agenda", events: [] });
      expect($(el, ".empty").textContent!.trim()).to.equal("No events");
    });
  });

  describe("toolbar", () => {
    it("steps periods with previous/next, returns to today, and switches views", async () => {
      const el = await calendar();
      const next = $(el, '[data-nav="next"]');
      expect(next.getAttribute("aria-label")).to.equal("Next month");
      setTimeout(() => next.click());
      const nav = await oneEvent(el, "navigate");
      expect(nav.detail).to.deep.include({ view: "month", date: "2026-07-15" });
      await el.updateComplete;
      $(el, '[data-nav="previous"]').click();
      await el.updateComplete;
      expect(el.date).to.equal("2026-06-15");

      const week = $$(el, "lit-material-segmented-button").find((b) => b.dataset.view === "week")!;
      setTimeout(() => week.click());
      const switched = await oneEvent(el, "navigate");
      expect(switched.detail.view).to.equal("week");
      await el.updateComplete;
      expect(el.view).to.equal("week");
      expect($(el, '[data-nav="next"]').getAttribute("aria-label")).to.equal("Next week");
      $(el, ".today-button").click();
      await el.updateComplete;
      const now = new Date();
      expect(el.date).to.equal(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`);
    });
  });

  describe("locale", () => {
    it("starts the week on the language's first day and formats titles in it", async () => {
      const de = await fixture<LitMaterialCalendar>(html`<lit-material-calendar lang="de" date="2026-06-15"></lit-material-calendar>`);
      expect($$(de, ".day")[0]!.dataset.date).to.equal("2026-06-01"); // Monday
      expect($(de, ".title").textContent!.trim()).to.equal("Juni 2026");
      const us = await fixture<LitMaterialCalendar>(html`<lit-material-calendar lang="en-US" date="2026-06-15"></lit-material-calendar>`);
      expect($$(us, ".day")[0]!.dataset.date).to.equal("2026-05-31"); // Sunday
      const fr = await fixture<LitMaterialCalendar>(html`<lit-material-calendar lang="fr" view="day" date="2026-06-15"></lit-material-calendar>`);
      expect($(fr, ".title").textContent!.trim()).to.equal("lundi 15 juin 2026");
    });

    it("uses registered translations", async () => {
      registerTranslation({
        $code: "xx",
        "calendar.today": "Heute-xx",
        "calendar.allDay": "Ganztags-xx",
        "calendar.more": { one: "noch {count}", other: "noch {count}-xx" },
      });
      const el = await fixture<LitMaterialCalendar>(
        html`<lit-material-calendar lang="xx" view="week" date="2026-06-15" .events=${sample}></lit-material-calendar>`,
      );
      expect($(el, ".today-button").textContent!.trim()).to.equal("Heute-xx");
      expect($(el, ".all-day-label").textContent!.trim()).to.equal("Ganztags-xx");
      el.view = "month";
      el.dayMaxEvents = 1;
      await el.updateComplete;
      expect($(el, '[data-date="2026-06-15"] .more').textContent!.trim()).to.equal("noch 2-xx");
    });
  });

  it("reads events from a JSON attribute", async () => {
    const el = await fixture<LitMaterialCalendar>(
      html`<lit-material-calendar date="2026-06-15" events='[{"id":1,"title":"From JSON","start":"2026-06-10"}]'></lit-material-calendar>`,
    );
    expect(chip(el, "1").textContent).to.contain("From JSON");
  });
});
