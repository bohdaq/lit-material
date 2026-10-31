# @lit-material/format

Locale-aware formatting for consoles: sizes, counts, durations, CPU and Kubernetes resource quantities. Plain functions on `Intl`: they run in the browser, in Node and during SSR, with no dependencies. Part of [lit-material](https://github.com/bohdaq/lit-material).

## Install

```sh
npm install @lit-material/format
```

## Usage

```js
import { formatBytes, formatNumber, formatDuration, parseQuantity, formatCpu } from "@lit-material/format";

formatBytes(1536);                          // "1.5 KiB"
formatBytes(1500, { binary: false });       // "1.5 kB"
formatBytes(parseQuantity("512Mi"));        // "512 MiB"
formatNumber(12345, { compact: true });     // "12K"
formatDuration(7_500_000);                  // "2 hr, 5 min"
formatDuration(65_000, { unitDisplay: "narrow" }); // "1m 5s"
formatCpu("250m");                          // "0.25 cores"
parseQuantity("1.5G");                      // 1500000000
```

Pair them with `lit-material-usage-meter`'s `format` or a `lit-material-stat` value.

## API

| Function | Notes |
| --- | --- |
| `formatBytes(bytes, { binary = true, maximumFractionDigits = 1, locale })` | KiB/MiB/GiB (powers of 1024, as Kubernetes `Mi`/`Gi`), or kB/MB/GB with `binary: false`. Rounds into the next unit rather than showing "1,024 KiB". |
| `formatNumber(value, { compact, maximumFractionDigits, locale })` | Grouped digits, or `compact` ("12K", "1.2M"). |
| `formatDuration(ms, { largest = 2, unitDisplay = "short", locale })` | Days to seconds, `largest` units at most; milliseconds only under a second. `"short"`, `"long"` or `"narrow"`. |
| `parseQuantity(q)` | Kubernetes quantity → number: suffixes `n u m k M G T P E`, `Ki Mi Gi Ti Pi Ei`, exponents. `NaN` when invalid. |
| `formatCpu(q, options)` | CPU quantity as cores: "0.25 cores", "1 core". |

All accept `locale` (default: the runtime's) and return `""` for a non-finite input.

## License

MIT
