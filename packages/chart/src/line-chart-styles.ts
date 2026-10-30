import { css } from "lit";
import { seriesColors, textTokens } from "./series-colors.js";

export const styles = [
  textTokens,
  seriesColors,
  css`
    :host {
      display: block;
      min-width: 0;
      color: var(--chart-text);
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    }
    .chart {
      position: relative;
    }
    svg {
      display: block;
      width: 100%;
      height: auto;
      overflow: visible;
      touch-action: pan-y;
    }
    svg:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: 4px;
      border-radius: 4px;
    }
    .grid {
      stroke: var(--chart-grid);
      stroke-width: 1;
    }
    .axis,
    .end-label {
      fill: var(--chart-muted);
      font-size: 12px;
      font-variant-numeric: tabular-nums;
    }
    .end-label {
      fill: var(--chart-text);
    }
    .line {
      fill: none;
      stroke: var(--series);
      stroke-width: 2;
      stroke-linejoin: round;
      stroke-linecap: round;
    }
    .dot,
    .marker {
      fill: var(--series);
      stroke: var(--chart-surface);
      stroke-width: 2;
    }
    .crosshair {
      stroke: var(--chart-muted);
      stroke-width: 1;
    }

    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 4px 16px;
      margin: 0 0 8px;
      padding: 0;
      list-style: none;
      color: var(--chart-text);
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
    }
    .legend li {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .swatch {
      display: inline-block;
      width: 12px;
      height: 3px;
      border-radius: 2px;
      background: var(--series);
    }

    .tooltip {
      position: absolute;
      top: 0;
      transform: translateX(-50%);
      pointer-events: none;
      padding: 6px 8px;
      border-radius: var(--md-sys-shape-corner-small, 8px);
      background: var(--md-sys-color-inverse-surface, light-dark(#322f35, #e6e0e9));
      color: var(--md-sys-color-inverse-on-surface, light-dark(#f5eff7, #322f35));
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
    }
    .tip-x {
      opacity: 0.8;
    }
    .tip-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .empty {
      display: grid;
      place-items: center;
      min-height: 120px;
      border: 1px dashed var(--chart-grid);
      border-radius: var(--md-sys-shape-corner-large, 12px);
      color: var(--chart-muted);
      font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    @media (forced-colors: active) {
      .line { stroke: CanvasText; }
      .swatch, .dot, .marker { background: CanvasText; fill: CanvasText; }
    }
  `,
];
