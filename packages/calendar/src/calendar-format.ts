import { type CalendarDate, toDate } from "./calendar-utils.js";

const formatters = new Map<string, Intl.DateTimeFormat>();

/** A `DateTimeFormat` for `lang`, built once per language and option set; an invalid `lang` falls back to the default locale. */
export function formatter(lang: string, name: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
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

type FormatRange = Intl.DateTimeFormat & { formatRange?: (a: Date, b: Date) => string };

/** `start – end` the way the language writes a range ("Jun 14 – 20, 2026"); the same instant prints once. */
export function formatRange(format: Intl.DateTimeFormat, start: Date, end: Date): string {
  if (start.getTime() === end.getTime()) return format.format(start);
  const range = (format as FormatRange).formatRange;
  if (typeof range === "function") {
    try {
      return range.call(format, start, end);
    } catch {
      // fall through
    }
  }
  return `${format.format(start)} – ${format.format(end)}`;
}

export const OPTIONS = {
  monthTitle: { month: "long", year: "numeric" },
  rangeTitle: { month: "short", day: "numeric", year: "numeric" },
  dayTitle: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  fullDate: { weekday: "long", month: "long", day: "numeric", year: "numeric" },
  eventDate: { weekday: "long", month: "long", day: "numeric" },
  eventDateTime: { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit" },
  time: { hour: "numeric", minute: "2-digit" },
  hour: { hour: "numeric" },
  weekdayShort: { weekday: "short" },
  weekdayLong: { weekday: "long" },
  agendaDate: { weekday: "short", month: "short", day: "numeric" },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type FormatName = keyof typeof OPTIONS;

export function format(lang: string, name: FormatName, date: Date | CalendarDate): string {
  return formatter(lang, name, OPTIONS[name]).format(date instanceof Date ? date : toDate(date));
}

export function range(lang: string, name: FormatName, start: Date | CalendarDate, end: Date | CalendarDate): string {
  return formatRange(formatter(lang, name, OPTIONS[name]), start instanceof Date ? start : toDate(start), end instanceof Date ? end : toDate(end));
}

const numberFormats = new Map<string, Intl.NumberFormat>();

/** A day number in `lang`'s digits. */
export function dayNumber(lang: string, value: number): string {
  let f = numberFormats.get(lang);
  if (!f) {
    try {
      f = new Intl.NumberFormat(lang, { useGrouping: false });
    } catch {
      f = new Intl.NumberFormat(undefined, { useGrouping: false });
    }
    numberFormats.set(lang, f);
  }
  return f.format(value);
}
