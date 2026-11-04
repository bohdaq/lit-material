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

const formatters = new Map<string, Intl.DateTimeFormat>();

/**
 * A `DateTimeFormat` for `lang`, built once per language and option set. An invalid `lang` falls back to the
 * runtime's default locale rather than throwing mid-render.
 */
function formatter(lang: string, name: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${lang}|${name}`;
  let format = formatters.get(key);
  if (!format) {
    try {
      format = new Intl.DateTimeFormat(lang, options);
    } catch {
      format = new Intl.DateTimeFormat(undefined, options);
    }
    formatters.set(key, format);
  }
  return format;
}

const numberFormatters = new Map<string, Intl.NumberFormat>();

/** A day or year number in `lang`'s digits, without grouping separators (`2026`, not `2,026`). */
export function numberLabel(lang: string, value: number): string {
  let format = numberFormatters.get(lang);
  if (!format) {
    try {
      format = new Intl.NumberFormat(lang, { useGrouping: false });
    } catch {
      format = new Intl.NumberFormat(undefined, { useGrouping: false });
    }
    numberFormatters.set(lang, format);
  }
  return format.format(value);
}

interface WeekInfo {
  firstDay: number; // 1 = Monday .. 7 = Sunday
}

/**
 * The first day of the week for `lang` (0 = Sunday, 1 = Monday, ...), from `Intl.Locale` week info where the
 * browser has it, else Sunday.
 */
export function localeFirstDayOfWeek(lang: string): number {
  try {
    const locale = new Intl.Locale(lang) as Intl.Locale & { getWeekInfo?: () => WeekInfo; weekInfo?: WeekInfo };
    const info = locale.getWeekInfo?.() ?? locale.weekInfo;
    if (info && typeof info.firstDay === "number") return info.firstDay % 7;
  } catch {
    // invalid language tag: fall through
  }
  return 0;
}

export function weekdayLabels(lang: string, firstDayOfWeek: number): string[] {
  // 2023-01-01 was a Sunday — a fixed, known-Sunday anchor to walk forward from.
  const sunday: CalendarDate = { year: 2023, month: 0, day: 1 };
  const format = formatter(lang, "weekday", { weekday: "narrow" });
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(sunday, firstDayOfWeek + i);
    return format.format(new Date(d.year, d.month, d.day));
  });
}

export function monthYearLabel(lang: string, year: number, month: number): string {
  return formatter(lang, "monthYear", { month: "long", year: "numeric" }).format(new Date(year, month, 1));
}

export function fullDateLabel(lang: string, date: CalendarDate): string {
  const options: Intl.DateTimeFormatOptions = { weekday: "long", month: "long", day: "numeric", year: "numeric" };
  return formatter(lang, "full", options).format(new Date(date.year, date.month, date.day));
}

export function headlineDateLabel(lang: string, date: CalendarDate): string {
  const options: Intl.DateTimeFormatOptions = { weekday: "short", month: "short", day: "numeric" };
  return formatter(lang, "headline", options).format(new Date(date.year, date.month, date.day));
}
