import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { addMonths, layoutDay, layoutSpans, localeFirstDayOfWeek, normalizeEvents, parseTime, startOfWeek } from "./calendar-utils.js";

const day = { year: 2026, month: 5, day: 15 }; // Monday, June 15 2026

describe("calendar-utils (no browser)", () => {
  it("parses date-only strings as local days and local date-times without shifting", () => {
    const d = parseTime("2026-06-15")!;
    assert.equal(d.dateOnly, true);
    assert.deepEqual([d.date.getFullYear(), d.date.getMonth(), d.date.getDate(), d.date.getHours()], [2026, 5, 15, 0]);
    const t = parseTime("2026-06-15T09:30")!;
    assert.deepEqual([t.date.getDate(), t.date.getHours(), t.date.getMinutes()], [15, 9, 30]);
    assert.equal(parseTime("nope"), undefined);
  });

  it("normalizes events: all-day from date-only starts, default ends, unreadable starts dropped", () => {
    const events = normalizeEvents([
      { id: 1, title: "Trip", start: "2026-06-15", end: "2026-06-17" },
      { id: 2, title: "Call", start: "2026-06-15T09:00" },
      { id: 3, title: "Bad", start: "never" },
      { id: 4, title: "Off", start: "2026-06-16", editable: false },
    ]);
    assert.deepEqual(events.map((e) => e.key), ["1", "2", "4"]);
    assert.equal(events[0]!.allDay, true);
    assert.equal(events[1]!.allDay, false);
    assert.equal(events[1]!.end.getHours(), 10);
    assert.equal(events[2]!.end.getDate(), 17);
    assert.equal(events[2]!.editable, false);
    assert.equal(normalizeEvents([{ id: 1, title: "x", start: "2026-06-15" }], true)[0]!.editable, false);
  });

  it("lays overlapping timed events out in columns per cluster", () => {
    const events = normalizeEvents([
      { id: "a", title: "A", start: "2026-06-15T09:00", end: "2026-06-15T11:00" },
      { id: "b", title: "B", start: "2026-06-15T09:30", end: "2026-06-15T10:00" },
      { id: "c", title: "C", start: "2026-06-15T10:00", end: "2026-06-15T10:30" },
      { id: "d", title: "D", start: "2026-06-15T13:00", end: "2026-06-15T14:00" },
    ]);
    const byKey = Object.fromEntries(layoutDay(events, day).map((s) => [s.item.key, s]));
    assert.deepEqual([byKey.a!.column, byKey.a!.columns], [0, 2]);
    assert.deepEqual([byKey.b!.column, byKey.b!.columns], [1, 2]);
    // C starts when B ends: it reuses B's column.
    assert.deepEqual([byKey.c!.column, byKey.c!.columns], [1, 2]);
    // D doesn't overlap anything: its own cluster, full width.
    assert.deepEqual([byKey.d!.column, byKey.d!.columns], [0, 1]);
    assert.deepEqual([byKey.a!.top, byKey.a!.bottom], [540, 660]);
  });

  it("clips events that cross midnight to each day", () => {
    const [event] = normalizeEvents([{ id: 1, title: "Night", start: "2026-06-15T22:00", end: "2026-06-16T02:00" }]);
    const first = layoutDay([event!], day)[0]!;
    const second = layoutDay([event!], { year: 2026, month: 5, day: 16 })[0]!;
    assert.deepEqual([first.top, first.bottom, first.continuesAfter], [1320, 1440, true]);
    assert.deepEqual([second.top, second.bottom, second.continuesBefore], [0, 120, true]);
  });

  it("stacks multi-day bars in lanes across a week", () => {
    const events = normalizeEvents([
      { id: "long", title: "Long", start: "2026-06-13", end: "2026-06-18" },
      { id: "one", title: "One", start: "2026-06-15" },
      { id: "later", title: "Later", start: "2026-06-18" },
    ]);
    const week = startOfWeek(day, 1); // Monday
    const segments = Object.fromEntries(layoutSpans(events, week, 7).map((s) => [s.item.key, s]));
    assert.deepEqual([segments.long!.startColumn, segments.long!.endColumn, segments.long!.lane, segments.long!.continuesBefore], [0, 2, 0, true]);
    assert.deepEqual([segments.one!.startColumn, segments.one!.lane], [0, 1]);
    // Starts after the long bar ends: back in lane 0.
    assert.deepEqual([segments.later!.startColumn, segments.later!.lane], [3, 0]);
  });

  it("week starts and month steps", () => {
    assert.deepEqual(startOfWeek(day, 0), { year: 2026, month: 5, day: 14 });
    assert.deepEqual(startOfWeek(day, 1), { year: 2026, month: 5, day: 15 });
    assert.deepEqual(addMonths({ year: 2026, month: 0, day: 31 }, 1), { year: 2026, month: 1, day: 28 });
    assert.equal(localeFirstDayOfWeek("not a locale!"), 0);
  });
});
