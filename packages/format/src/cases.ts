// Shared by the browser and Node test runs: the same answers in both.
import { formatBytes, formatCpu, formatDuration, formatNumber, parseQuantity } from "./format.js";

export const cases: [string, () => unknown, unknown][] = [
  ["bytes", () => formatBytes(0, { locale: "en" }), "0 B"],
  ["bytes binary", () => formatBytes(1536, { locale: "en" }), "1.5 KiB"],
  ["bytes decimal", () => formatBytes(1500, { locale: "en", binary: false }), "1.5 kB"],
  ["bytes rounds up a unit", () => formatBytes(1024 * 1024 - 1, { locale: "en" }), "1 MiB"],
  ["bytes large", () => formatBytes(8 * 2 ** 30, { locale: "en" }), "8 GiB"],
  ["bytes negative", () => formatBytes(-2048, { locale: "en" }), "-2 KiB"],
  ["bytes locale", () => formatBytes(1536, { locale: "de" }), "1,5 KiB"],
  ["number", () => formatNumber(12345.678, { locale: "en" }), "12,345.68"],
  ["number compact", () => formatNumber(12345, { locale: "en", compact: true }), "12.3K"],
  ["duration", () => formatDuration(7_500_000, { locale: "en" }), "2 hr, 5 min"],
  ["duration long", () => formatDuration(90_061_000, { locale: "en", unitDisplay: "long", largest: 3 }), "1 day, 1 hour, 1 minute"],
  ["duration narrow", () => formatDuration(65_000, { locale: "en", unitDisplay: "narrow" }), "1m 5s"],
  ["duration ms", () => formatDuration(250, { locale: "en" }), "250 ms"],
  ["duration zero", () => formatDuration(0, { locale: "en" }), "0 sec"],
  ["quantity Mi", () => parseQuantity("512Mi"), 536870912],
  ["quantity milli", () => parseQuantity("500m"), 0.5],
  ["quantity G", () => parseQuantity("1.5G"), 1.5e9],
  ["quantity exponent", () => parseQuantity("2e3"), 2000],
  ["quantity bad", () => Number.isNaN(parseQuantity("12 apples")), true],
  ["cpu milli", () => formatCpu("250m", { locale: "en" }), "0.25 cores"],
  ["cpu one", () => formatCpu(1, { locale: "en" }), "1 core"],
  ["cpu bad", () => formatCpu("x"), ""],
];
