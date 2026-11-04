/**
 * Calendar math and event layout, with no DOM. All times are in the runtime's local time zone: a `Date`
 * is shown at its local wall-clock time, and ISO strings without an offset are read as local time.
 * Date-only strings (`"2026-06-15"`) are parsed by hand, never through `new Date(str)` (which reads
 * them as UTC midnight and shifts them a day in negative-offset zones).
 */

export interface CalendarDate {
  year: number;
  month: number; // 0-11
  day: number;
}

/** An event as the app passes it in. Extra fields are kept and handed back in event details. */
export interface CalendarEvent {
  id: string | number;
  title: string;
  /** A `Date`, or an ISO string: `"2026-06-15"` (a day), `"2026-06-15T09:30"` (local time), or with an offset. */
  start: string | Date;
  /** Exclusive. Missing (or not after `start`): one hour for a timed event, one day for an all-day one. */
  end?: string | Date;
  /** Shown in the all-day row. Default: `true` when `start` is a date-only string, else `false`. */
  allDay?: boolean;
  /** Any CSS colour, used as the chip's accent. */
  color?: string;
  /** `false` keeps this event from being dragged, resized or moved with the keyboard. */
  editable?: boolean;
  [key: string]: unknown;
}

/** An event with its times resolved to `Date`s. */
export interface NormalizedEvent {
  source: CalendarEvent;
  key: string;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  color?: string;
  editable: boolean;
}

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const LOCAL_DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
export const MINUTE = 60_000;
export const DAY_MINUTES = 24 * 60;

export function parseISODate(iso: string | undefined | null): CalendarDate | undefined {
  const match = iso ? DATE_ONLY.exec(iso) : null;
  if (!match) return undefined;
  return { year: Number(match[1]), month: Number(match[2]) - 1, day: Number(match[3]) };
}

export function formatISODate(date: CalendarDate): string {
  return `${String(date.year).padStart(4, "0")}-${String(date.month + 1).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
}

export function toDate(date: CalendarDate, minutes = 0): Date {
  return new Date(date.year, date.month, date.day, 0, minutes);
}

export function fromDate(date: Date): CalendarDate {
  return { year: date.getFullYear(), month: date.getMonth(), day: date.getDate() };
}

export function today(): CalendarDate {
  return fromDate(new Date());
}

export function compareDate(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export const sameDate = (a: CalendarDate, b: CalendarDate): boolean => compareDate(a, b) === 0;

export function addDays(date: CalendarDate, delta: number): CalendarDate {
  return fromDate(new Date(date.year, date.month, date.day + delta));
}

/** The same day `delta` months away, clamped to the target month's length (Jan 31 + 1 month = Feb 28). */
export function addMonths(date: CalendarDate, delta: number): CalendarDate {
  const first = new Date(date.year, date.month + delta, 1);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate();
  return { year: first.getFullYear(), month: first.getMonth(), day: Math.min(date.day, last) };
}

/** Whole days from `a` to `b` (calendar days, so DST changes don't matter). */
export function daysBetween(a: CalendarDate, b: CalendarDate): number {
  return Math.round((Date.UTC(b.year, b.month, b.day) - Date.UTC(a.year, a.month, a.day)) / 86_400_000);
}

export function startOfWeek(date: CalendarDate, firstDayOfWeek: number): CalendarDate {
  const weekday = new Date(date.year, date.month, date.day).getDay();
  return addDays(date, -((weekday - firstDayOfWeek + 7) % 7));
}

/** Minutes since local midnight of `day` (can be negative, or past 1440). Wall-clock, so DST days still have 24 hours of rows. */
export function minutesInto(day: CalendarDate, date: Date): number {
  return daysBetween(day, fromDate(date)) * DAY_MINUTES + date.getHours() * 60 + date.getMinutes();
}

interface WeekInfo {
  firstDay: number; // 1 = Monday .. 7 = Sunday
}

/**
 * The first day of the week for `lang` (0 = Sunday, 1 = Monday, ...), from `Intl.Locale` week info where the
 * runtime has it, else Sunday. The same approach as `@lit-material/date-picker`.
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

/** Reads an event time: a `Date`, a date-only string (local midnight), a local date-time string, or any string `Date` parses. */
export function parseTime(value: string | Date | undefined): { date: Date; dateOnly: boolean } | undefined {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? undefined : { date: value, dateOnly: false };
  if (typeof value !== "string" || !value) return undefined;
  const day = parseISODate(value);
  if (day) return { date: toDate(day), dateOnly: true };
  const local = LOCAL_DATE_TIME.exec(value);
  const date = local
    ? new Date(+local[1]!, +local[2]! - 1, +local[3]!, +local[4]!, +local[5]!, +(local[6] ?? 0), +(local[7] ?? 0))
    : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : { date, dateOnly: false };
}

/** Resolves the app's events; ones without a readable `start` are dropped. */
export function normalizeEvents(events: readonly CalendarEvent[] | null | undefined, readonly = false): NormalizedEvent[] {
  const out: NormalizedEvent[] = [];
  for (const source of Array.isArray(events) ? events : []) {
    if (!source || typeof source !== "object") continue;
    const start = parseTime(source.start);
    if (!start) continue;
    const allDay = source.allDay ?? start.dateOnly;
    let startDate = start.date;
    if (allDay) startDate = toDate(fromDate(startDate));
    let end = parseTime(source.end)?.date;
    if (allDay && end) {
      // An all-day end that isn't at midnight still covers that day.
      const endDay = fromDate(end);
      end = end.getHours() || end.getMinutes() ? toDate(addDays(endDay, 1)) : toDate(endDay);
    }
    if (!end || end.getTime() <= startDate.getTime()) {
      end = allDay ? toDate(addDays(fromDate(startDate), 1)) : new Date(startDate.getTime() + 60 * MINUTE);
    }
    out.push({
      source,
      key: String(source.id),
      title: typeof source.title === "string" ? source.title : String(source.title ?? ""),
      start: startDate,
      end,
      allDay,
      color: typeof source.color === "string" ? source.color : undefined,
      editable: !readonly && source.editable !== false,
    });
  }
  return out.sort((a, b) => a.start.getTime() - b.start.getTime() || b.end.getTime() - a.end.getTime());
}

/** The last day an event covers (its end is exclusive, so an event ending at midnight doesn't reach that day). */
export function lastDay(event: { start: Date; end: Date }): CalendarDate {
  const end = new Date(event.end.getTime() - 1);
  return end.getTime() < event.start.getTime() ? fromDate(event.start) : fromDate(end);
}

/** Whether an event covers any part of `day`. */
export function coversDay(event: { start: Date; end: Date }, day: CalendarDate): boolean {
  return compareDate(fromDate(event.start), day) <= 0 && compareDate(lastDay(event), day) >= 0;
}

export interface TimedSegment<T> {
  item: T;
  /** Minutes from the day's midnight, clipped to the day. */
  top: number;
  bottom: number;
  /** Whether the event started before this day / goes on past it. */
  continuesBefore: boolean;
  continuesAfter: boolean;
  column: number;
  columns: number;
}

/**
 * The part of each timed event that falls on `day`, laid out in side-by-side columns where they overlap:
 * each cluster of transitively overlapping events gets as many equal columns as it needs at its busiest,
 * and every event the first column free at its start. Events shorter than `minLength` minutes are laid out
 * as if they were that long, so they stay visible and don't overprint.
 */
export function layoutDay<T extends { start: Date; end: Date }>(items: readonly T[], day: CalendarDate, minLength = 15): TimedSegment<T>[] {
  const segments: TimedSegment<T>[] = [];
  for (const item of items) {
    const start = minutesInto(day, item.start);
    const end = minutesInto(day, item.end);
    if (end <= 0 || start >= DAY_MINUTES) continue;
    const top = Math.max(0, start);
    const bottom = Math.min(DAY_MINUTES, Math.max(end, Math.min(DAY_MINUTES, top + minLength)));
    segments.push({ item, top, bottom, continuesBefore: start < 0, continuesAfter: end > DAY_MINUTES, column: 0, columns: 1 });
  }
  segments.sort((a, b) => a.top - b.top || b.bottom - a.bottom);
  let cluster: TimedSegment<T>[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -1;
  const close = () => {
    for (const s of cluster) s.columns = columnEnds.length;
    cluster = [];
    columnEnds = [];
  };
  for (const segment of segments) {
    if (segment.top >= clusterEnd) close();
    let column = columnEnds.findIndex((end) => end <= segment.top);
    if (column === -1) column = columnEnds.push(segment.bottom) - 1;
    else columnEnds[column] = segment.bottom;
    segment.column = column;
    cluster.push(segment);
    clusterEnd = Math.max(clusterEnd, segment.bottom);
  }
  close();
  return segments;
}

export interface SpanSegment<T> {
  item: T;
  /** First and last column (0-based day index within the row) the event covers. */
  startColumn: number;
  endColumn: number;
  lane: number;
  continuesBefore: boolean;
  continuesAfter: boolean;
}

/**
 * Lays events out as bars across a row of `days` consecutive days (a month-view week or the all-day row):
 * each covering event becomes one bar, and bars are stacked in the first lane that's free over their whole
 * span, longer bars first.
 */
export function layoutSpans<T extends { start: Date; end: Date; allDay?: boolean }>(items: readonly T[], first: CalendarDate, days: number): SpanSegment<T>[] {
  const segments: SpanSegment<T>[] = [];
  for (const item of items) {
    const from = daysBetween(first, fromDate(item.start));
    const to = daysBetween(first, lastDay(item));
    if (to < 0 || from >= days) continue;
    segments.push({
      item,
      startColumn: Math.max(0, from),
      endColumn: Math.min(days - 1, to),
      lane: 0,
      continuesBefore: from < 0,
      continuesAfter: to >= days,
    });
  }
  segments.sort(
    (a, b) =>
      a.startColumn - b.startColumn ||
      b.endColumn - b.startColumn - (a.endColumn - a.startColumn) ||
      Number(b.item.allDay ?? false) - Number(a.item.allDay ?? false) ||
      a.item.start.getTime() - b.item.start.getTime(),
  );
  const laneEnds: number[] = [];
  for (const segment of segments) {
    let lane = laneEnds.findIndex((end) => end < segment.startColumn);
    if (lane === -1) lane = laneEnds.push(segment.endColumn) - 1;
    else laneEnds[lane] = segment.endColumn;
    segment.lane = lane;
  }
  return segments;
}
