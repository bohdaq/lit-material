import { css, unsafeCSS } from "lit";

// The categorical palette in its fixed order (light, dark), validated for
// colour-vision deficiency on adjacent pairs; themes override each slot with
// --lit-material-chart-series-N.
const PALETTE: [string, string][] = [
  ["#2a78d6", "#3987e5"],
  ["#eb6834", "#d95926"],
  ["#1baf7a", "#199e70"],
  ["#eda100", "#c98500"],
  ["#e87ba4", "#d55181"],
  ["#008300", "#008300"],
  ["#6250d6", "#9085e9"],
  ["#e34948", "#e66767"],
];

/** `.sN` sets `--series` for slot N; marks read it as stroke or fill. */
export const seriesColors = unsafeCSS(
  PALETTE.map(([light, dark], i) => `.s${i + 1} { --series: var(--lit-material-chart-series-${i + 1}, light-dark(${light}, ${dark})); }`).join("\n"),
);

export const textTokens = css`
  :host {
    --chart-text: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    --chart-muted: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    --chart-grid: var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    --chart-surface: var(--md-sys-color-surface, light-dark(#fef7ff, #141218));
  }
`;
