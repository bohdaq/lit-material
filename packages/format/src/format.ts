/**
 * Locale-aware formatting for what consoles show all day: sizes, counts,
 * durations, CPU and Kubernetes resource quantities. Plain functions on
 * `Intl`, so they run in the browser, in Node and during SSR, and follow
 * the page's language (or `locale`).
 */

export interface FormatOptions {
  /** A BCP 47 locale; default: the runtime's. */
  locale?: string;
  /** Most digits after the decimal point (default 1). */
  maximumFractionDigits?: number;
}

const BINARY = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB"];
const DECIMAL = ["B", "kB", "MB", "GB", "TB", "PB", "EB"];

function number(value: number, options: FormatOptions & Intl.NumberFormatOptions = {}): string {
  const { locale, maximumFractionDigits = 1, ...rest } = options;
  return new Intl.NumberFormat(locale, { maximumFractionDigits, ...rest }).format(value);
}

/**
 * `1536` → `"1.5 KiB"`; `{ binary: false }` → `"1.5 kB"` (powers of 1000).
 * Binary (KiB, MiB) matches Kubernetes `Mi`/`Gi` and most tools' memory
 * figures; decimal matches disk vendors and network rates.
 */
export function formatBytes(bytes: number, options: FormatOptions & { binary?: boolean } = {}): string {
  if (!Number.isFinite(bytes)) return "";
  const base = options.binary === false ? 1000 : 1024;
  const units = options.binary === false ? DECIMAL : BINARY;
  let value = Math.abs(bytes);
  let unit = 0;
  while (value >= base && unit < units.length - 1) {
    value /= base;
    unit++;
  }
  // Round first: 1023.96 KiB shows as "1 MiB", not "1,024 KiB".
  const digits = options.maximumFractionDigits ?? 1;
  if (unit < units.length - 1 && Number(value.toFixed(digits)) >= base) {
    value /= base;
    unit++;
  }
  return `${bytes < 0 ? "-" : ""}${number(value, { ...options, maximumFractionDigits: unit === 0 ? 0 : digits })} ${units[unit]}`;
}

/** `12345` → `"12,345"`; `{ compact: true }` → `"12K"`. */
export function formatNumber(value: number, options: FormatOptions & { compact?: boolean } = {}): string {
  if (!Number.isFinite(value)) return "";
  const { compact, ...rest } = options;
  return number(value, compact ? { ...rest, notation: "compact" } : { ...rest, maximumFractionDigits: rest.maximumFractionDigits ?? 2 });
}

const DURATION_UNITS: [Intl.NumberFormatOptions["unit"], number][] = [
  ["day", 86_400_000],
  ["hour", 3_600_000],
  ["minute", 60_000],
  ["second", 1000],
  ["millisecond", 1],
];

/**
 * `7_500_000` (ms) → `"2 hr, 5 min"` in English. `largest` caps how many
 * units are shown (default 2); `unitDisplay` is `"short"` (default),
 * `"long"` ("2 hours, 5 minutes") or `"narrow"` ("2h 5m").
 */
export function formatDuration(
  milliseconds: number,
  options: { locale?: string; largest?: number; unitDisplay?: "short" | "long" | "narrow" } = {},
): string {
  if (!Number.isFinite(milliseconds)) return "";
  const { locale, largest = 2, unitDisplay = "short" } = options;
  let rest = Math.abs(Math.round(milliseconds));
  const parts: string[] = [];
  for (const [unit, size] of DURATION_UNITS) {
    // Milliseconds only when the whole duration is under a second.
    if (unit === "millisecond" && (parts.length || Math.abs(milliseconds) >= 1000)) break;
    const count = Math.floor(rest / size);
    rest -= count * size;
    if (count > 0) parts.push(new Intl.NumberFormat(locale, { style: "unit", unit, unitDisplay }).format(count));
    if (parts.length === largest) break;
  }
  if (parts.length === 0) parts.push(new Intl.NumberFormat(locale, { style: "unit", unit: "second", unitDisplay }).format(0));
  const list = new Intl.ListFormat(locale, { style: unitDisplay, type: "unit" }).format(parts);
  return milliseconds < 0 ? `-${list}` : list;
}

const SUFFIXES: Record<string, number> = {
  n: 1e-9,
  u: 1e-6,
  m: 1e-3,
  "": 1,
  k: 1e3,
  M: 1e6,
  G: 1e9,
  T: 1e12,
  P: 1e15,
  E: 1e18,
  Ki: 2 ** 10,
  Mi: 2 ** 20,
  Gi: 2 ** 30,
  Ti: 2 ** 40,
  Pi: 2 ** 50,
  Ei: 2 ** 60,
};

/**
 * A Kubernetes resource quantity as a number: `"512Mi"` → `536870912`,
 * `"500m"` → `0.5`, `"1.5G"` → `1500000000`, `"2e3"` → `2000`. `NaN` when it
 * isn't one.
 */
export function parseQuantity(quantity: string | number): number {
  if (typeof quantity === "number") return quantity;
  const match = /^\s*([+-]?(?:\d+\.?\d*|\.\d+))(?:([eE][+-]?\d+)|(Ki|Mi|Gi|Ti|Pi|Ei|[numkMGTPE]))?\s*$/.exec(quantity);
  if (!match) return Number.NaN;
  const value = Number(match[1] + (match[2] ?? ""));
  return value * (SUFFIXES[match[3] ?? ""] ?? 1);
}

/** CPU as cores: `"250m"` → `"0.25 cores"`, `2` → `"2 cores"`, `1` → `"1 core"`. */
export function formatCpu(quantity: string | number, options: FormatOptions = {}): string {
  const cores = parseQuantity(quantity);
  if (!Number.isFinite(cores)) return "";
  const text = number(cores, { ...options, maximumFractionDigits: options.maximumFractionDigits ?? 2 });
  return `${text} ${cores === 1 ? "core" : "cores"}`;
}
