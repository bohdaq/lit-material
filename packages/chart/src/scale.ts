/** Axis helpers shared by the chart components. Pure, so they test without a DOM. */

/** A "nice" step (1, 2, 2.5, 5 × 10ⁿ) for about `count` intervals over `span`. */
export function niceStep(span: number, count: number): number {
  if (!(span > 0) || !Number.isFinite(span)) return 1;
  const raw = span / Math.max(1, count);
  const power = 10 ** Math.floor(Math.log10(raw));
  for (const m of [1, 2, 2.5, 5, 10]) {
    if (m * power >= raw) return m * power;
  }
  return 10 * power;
}

/**
 * Ticks covering `[min, max]` with nice steps: the domain is widened to
 * the outer ticks. A flat domain is widened around its value.
 */
export function niceTicks(min: number, max: number, count = 4): { ticks: number[]; min: number; max: number } {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return { ticks: [0, 1], min: 0, max: 1 };
  if (min === max) {
    const pad = min === 0 ? 1 : Math.abs(min) * 0.1;
    min -= pad;
    max += pad;
  }
  const step = niceStep(max - min, count);
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  // Bounded: at most count * 3 + 2 ticks whatever the input.
  for (let v = lo, i = 0; v <= hi + step / 2 && i < count * 3 + 2; v += step, i++) {
    ticks.push(Number(v.toPrecision(12)));
  }
  return { ticks, min: lo, max: hi };
}

/** Evenly spaced ticks inside `[min, max]` for an x axis, ends included. */
export function linearTicks(min: number, max: number, count = 5): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
  if (min === max) return [min];
  return Array.from({ length: count }, (_, i) => min + ((max - min) * i) / (count - 1));
}

/** Compact number formatting: 1.2k, 3.4M, and up to 3 significant decimals below 1000. */
export function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return "";
  const abs = Math.abs(value);
  if (abs >= 1e9) return `${trim(value / 1e9)}G`;
  if (abs >= 1e6) return `${trim(value / 1e6)}M`;
  if (abs >= 1e4) return `${trim(value / 1e3)}k`;
  if (abs >= 100 || Number.isInteger(value)) return String(Math.round(value));
  return trim(value);
}

function trim(value: number): string {
  return String(Number(value.toPrecision(3)));
}

/** Push label positions apart so none is closer than `gap` to the next, keeping order. */
export function spread(positions: number[], gap: number, min: number, max: number): number[] {
  const order = positions.map((p, i) => ({ p, i })).sort((a, b) => a.p - b.p);
  const out = [...positions];
  let last = -Infinity;
  for (const { p, i } of order) {
    const y = Math.max(p, last + gap, min);
    out[i] = y;
    last = y;
  }
  // If the stack ran past the bottom, shift it up as a whole.
  const overflow = Math.max(0, Math.max(...out) - max);
  return overflow ? out.map((y) => y - overflow) : out;
}
