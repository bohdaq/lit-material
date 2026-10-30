import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    vertical-align: middle;
  }

  .status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-label-medium-line-height, 1.25rem);
    font-weight: var(--md-sys-typescale-label-medium-weight, 600);
  }

  .ok { color: var(--lit-material-status-ok-color, light-dark(#3f6b2a, #9fcf86)); }
  .warning { color: var(--lit-material-status-warning-color, light-dark(#7d5300, #f0c060)); }
  .error { color: var(--lit-material-status-error-color, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5))); }
  .info { color: var(--lit-material-status-info-color, var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff))); }
  .neutral {
    color: var(--lit-material-status-neutral-color, var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0)));
    font-weight: var(--md-sys-typescale-label-medium-weight-prominent, 500);
  }

  .icon {
    display: inline-flex;
    flex: none;
    width: 1.25em;
    height: 1.25em;
  }
  svg {
    width: 100%;
    height: 100%;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
  svg .fill { fill: currentColor; stroke: none; }
  ::slotted([slot="icon"]) { width: 100%; height: 100%; }

  @media (forced-colors: active) {
    .status { color: CanvasText; }
  }
`;
