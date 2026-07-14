/**
 * Plain-number calendar math, deliberately never parsing an ISO string via
 * `new Date(str)` (that parses as UTC and is a classic source of
 * off-by-one-day bugs in negative-UTC-offset timezones). Every `Date` this
 * module constructs uses the local-time `(year, month, day)` constructor
 * instead, which has no such ambiguity.
 */

export interface CalendarDate {
  year: number;
  month: number; // 0-11
  day: number;
}

const ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseISODate(iso: string): CalendarDate | undefined {
  const match = ISO_PATTERN.exec(iso);
  if (!match) return undefined;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  return { year, month, day };
}

export function formatISODate(date: CalendarDate): string {
  const y = String(date.year).padStart(4, "0");
  const m = String(date.month + 1).padStart(2, "0");
  const d = String(date.day).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function today(): CalendarDate {
  const now = new Date();
  return { year: now.getFullYear(), month: now.getMonth(), day: now.getDate() };
}

export function compareDate(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function addDays(date: CalendarDate, delta: number): CalendarDate {
  const d = new Date(date.year, date.month, date.day + delta);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}

export function addMonths(date: CalendarDate, delta: number): CalendarDate {
  const d = new Date(date.year, date.month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth(), day: date.day };
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** 0 = the grid's first column, per `firstDayOfWeek` (0 = Sunday, 1 = Monday, ...). */
export function firstWeekdayOffset(year: number, month: number, firstDayOfWeek: number): number {
  const jsWeekday = new Date(year, month, 1).getDay(); // 0 (Sun) .. 6 (Sat)
  return (jsWeekday - firstDayOfWeek + 7) % 7;
}

export function isInRange(date: CalendarDate, min?: CalendarDate, max?: CalendarDate): boolean {
  if (min && compareDate(date, min) < 0) return false;
  if (max && compareDate(date, max) > 0) return false;
  return true;
}

/** Whether every day of the given month is outside [min, max] — used to disable month/year navigation. */
export function isMonthFullyOutOfRange(year: number, month: number, min?: CalendarDate, max?: CalendarDate): boolean {
  const lastDay = daysInMonth(year, month);
  const monthStart: CalendarDate = { year, month, day: 1 };
  const monthEnd: CalendarDate = { year, month, day: lastDay };
  if (min && compareDate(monthEnd, min) < 0) return true;
  if (max && compareDate(monthStart, max) > 0) return true;
  return false;
}

const WEEKDAY_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "narrow" });
const MONTH_YEAR_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const FULL_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  month: "long",
  day: "numeric",
  year: "numeric",
});
const HEADLINE_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { weekday: "short", month: "short", day: "numeric" });

export function weekdayLabels(firstDayOfWeek: number): string[] {
  // 2023-01-01 was a Sunday — a fixed, known-Sunday anchor to walk forward from.
  const sunday: CalendarDate = { year: 2023, month: 0, day: 1 };
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(sunday, firstDayOfWeek + i);
    return WEEKDAY_FORMATTER.format(new Date(d.year, d.month, d.day));
  });
}

export function monthYearLabel(year: number, month: number): string {
  return MONTH_YEAR_FORMATTER.format(new Date(year, month, 1));
}

export function fullDateLabel(date: CalendarDate): string {
  return FULL_DATE_FORMATTER.format(new Date(date.year, date.month, date.day));
}

export function headlineDateLabel(date: CalendarDate): string {
  return HEADLINE_DATE_FORMATTER.format(new Date(date.year, date.month, date.day));
}
