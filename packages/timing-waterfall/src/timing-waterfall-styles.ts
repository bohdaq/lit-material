import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 0;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: 0.75rem;
    line-height: 1rem;
  }

  :host([hidden]) {
    display: none;
  }

  .bar {
    display: flex;
    gap: 2px;
    height: var(--lit-material-timing-waterfall-height, 8px);
    border-radius: 4px;
    overflow: hidden;
    background: var(--lit-material-timing-waterfall-track, var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930)));
  }

  .segment {
    display: block;
    flex: none;
    min-width: 2px;
    height: 100%;
    border-radius: 3px;
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 16px;
    margin: 8px 0 0;
    padding: 0;
    list-style: none;
  }

  .legend li {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    width: 8px;
    height: 8px;
    border-radius: 2px;
  }

  .time {
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
    font-variant-numeric: tabular-nums;
  }

  .total {
    font-weight: 600;
  }
`;
