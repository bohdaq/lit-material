/**
 * Clock-dial geometry and 12/24-hour conversion helpers, kept separate from
 * the component itself the same way `date-utils.ts` keeps calendar math out
 * of `date-picker.ts` — pure functions, easy to reason about (and test) in
 * isolation from rendering/interaction.
 */

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

export function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** Parses an "H:MM"/"HH:MM" 24-hour string. Returns undefined for anything malformed or out of range. */
export function parseTime(value: string): { hour: number; minute: number } | undefined {
  const match = TIME_PATTERN.exec(value);
  if (!match) return undefined;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return undefined;
  return { hour, minute };
}

export function formatTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`;
}

/** 24-hour `hour` (0-23) to a 12-hour-clock display value (1-12) plus whether it's PM. */
export function hour24To12(hour24: number): { hour12: number; isPM: boolean } {
  const isPM = hour24 >= 12;
  const hour12 = hour24 % 12 || 12;
  return { hour12, isPM };
}

/** A 12-hour-clock display value (1-12) plus AM/PM back to a 24-hour `hour` (0-23). */
export function hour12To24(hour12: number, isPM: boolean): number {
  const base = hour12 % 12; // 12 -> 0
  return isPM ? base + 12 : base;
}

export interface DialPoint {
  x: number;
  y: number;
}

/** Offset from a dial's center for a point at `angleDeg` (0 = 12 o'clock, clockwise) and `radius`. */
export function pointAtAngle(angleDeg: number, radius: number): DialPoint {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: radius * Math.sin(rad), y: -radius * Math.cos(rad) };
}

/** The `count` evenly-spaced angles (degrees, 0 = 12 o'clock, clockwise) around a dial, starting at 12 o'clock. */
export function ringAngles(count: number): number[] {
  const step = 360 / count;
  return Array.from({ length: count }, (_, i) => i * step);
}

/**
 * The angle (degrees, 0 = 12 o'clock, clockwise) from a dial's center to a
 * pointer offset `(dx, dy)` from that same center — the inverse of
 * `pointAtAngle`, used to turn a drag gesture back into a dial value.
 */
export function angleFromCenter(dx: number, dy: number): number {
  const deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return (deg + 360) % 360;
}

/** Rounds `angleDeg` to the nearest of `count` evenly-spaced steps around the dial, wrapping at 360. */
export function angleToIndex(angleDeg: number, count: number): number {
  const step = 360 / count;
  return Math.round(angleDeg / step) % count;
}
