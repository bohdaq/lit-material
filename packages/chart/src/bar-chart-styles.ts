import { css } from "lit";
import { textTokens } from "./series-colors.js";

export const styles = [
  textTokens,
  css`
    /* Bars are sized in percentages, so there's no intrinsic width: fill the
       line in flex/grid parents too. */
    :host {
      display: block;
      width: 100%;
      box-sizing: border-box;
      min-width: 0;
      color: var(--chart-text);
      font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
      font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
      line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
      --accent: var(--lit-material-chart-series-1, light-dark(#2a78d6, #3987e5));
    }
    .chart {
      position: relative;
      display: grid;
      gap: 6px;
      /* One row (20px) plus the gap: the tooltip's vertical step. */
      --row-pitch: 26px;
      border-radius: 4px;
    }
    .chart:focus-visible {
      outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
      outline-offset: 4px;
    }
    .row {
      display: grid;
      grid-template-columns: var(--lit-material-bar-chart-name-width, 112px) minmax(0, 1fr);
      align-items: center;
      gap: 8px;
      height: 20px;
    }
    .name {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--chart-muted);
    }
    .highlight .name {
      color: var(--chart-text);
      font-weight: 600;
    }
    /* Room for a value label after the longest bar, so lengths stay
       comparable across rows. */
    .track {
      position: relative;
      display: block;
      height: 100%;
      --label: 88px;
    }
    .bar {
      position: absolute;
      left: 0;
      top: 2px;
      height: 16px;
      width: max(2px, calc((100% - var(--label)) * var(--f)));
      border-radius: 0 4px 4px 0;
      background: var(--accent);
      transition: opacity 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
    }
    .highlight .bar {
      background: var(--lit-material-bar-chart-highlight, var(--accent));
    }
    .muted .bar {
      background: var(--lit-material-bar-chart-muted, var(--chart-grid));
    }
    .chart:has(.active) .row:not(.active) .bar {
      opacity: 0.55;
    }
    .value {
      position: absolute;
      top: 2px;
      left: calc((100% - var(--label)) * var(--f) + 6px);
      white-space: nowrap;
      font-variant-numeric: tabular-nums;
      font-weight: 600;
    }

    .tooltip {
      position: absolute;
      right: 0;
      transform: translateY(-100%);
      pointer-events: none;
      padding: 6px 8px;
      border-radius: var(--md-sys-shape-corner-small, 8px);
      background: var(--md-sys-color-inverse-surface, light-dark(#322f35, #e6e0e9));
      color: var(--md-sys-color-inverse-on-surface, light-dark(#f5eff7, #322f35));
      font-variant-numeric: tabular-nums;
      white-space: nowrap;
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

    @media (prefers-reduced-motion: reduce) {
      .bar { transition: none; }
    }
    @media (forced-colors: active) {
      .bar { background: CanvasText; }
      .highlight .bar { background: Highlight; }
    }
  `,
];
