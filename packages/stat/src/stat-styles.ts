import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 0;
  }

  .stat {
    box-sizing: border-box;
    height: 100%;
    padding: 16px;
    border-radius: var(--md-sys-shape-corner-large, 12px);
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
  }
  .outlined {
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
  }
  .filled {
    background: var(--md-sys-color-surface-container-highest, light-dark(#e6e0e9, #36343b));
  }
  .plain {
    padding: 0;
  }

  .label {
    display: flex;
    align-items: center;
    gap: 8px;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }
  ::slotted([slot="icon"]) {
    display: inline-flex;
    width: 20px;
    height: 20px;
  }

  .value {
    margin-top: 4px;
    font-size: var(--lit-material-stat-value-size, 1.5rem);
    line-height: var(--lit-material-stat-value-line-height, 2rem);
    font-weight: var(--lit-material-stat-value-weight, 600);
    font-variant-numeric: tabular-nums;
    overflow-wrap: anywhere;
  }

  .caption {
    display: flex;
    flex-wrap: wrap;
    gap: 4px 8px;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
  }
  .caption:empty { display: none; }

  .trend { font-weight: 600; }
  .trend.positive { color: var(--lit-material-stat-positive-color, light-dark(#3f6b2a, #9fcf86)); }
  .trend.negative { color: var(--lit-material-stat-negative-color, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5))); }
`;
