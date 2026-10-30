import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }
  .box {
    position: relative;
  }
  .viewport {
    box-sizing: border-box;
    height: var(--lit-material-log-viewer-height, 320px);
    overflow: auto;
    padding: 8px 0;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-large, 12px);
    background: var(--md-sys-color-surface-container-lowest, light-dark(#ffffff, #0f0d13));
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--lit-material-log-viewer-font, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
    font-size: var(--lit-material-log-viewer-font-size, 0.75rem);
    line-height: 1.6;
  }
  .viewport:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    outline-offset: 2px;
  }
  .line {
    position: relative;
    padding: 0 12px 0 20px;
    white-space: pre;
  }
  :host([wrap]) .line {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  .line:hover {
    background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
  }
  .mark {
    position: absolute;
    left: 8px;
    top: 0.5em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: currentColor;
  }
  .error { color: var(--lit-material-log-viewer-error-color, var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5))); }
  .warning { color: var(--lit-material-log-viewer-warning-color, light-dark(#7d5300, #f0c060)); }
  .warning .mark { border-radius: 0; transform: rotate(45deg); }
  .info { color: var(--lit-material-log-viewer-info-color, var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff))); }
  .info .mark { border-radius: 1px; }

  .jump {
    position: absolute;
    left: 50%;
    bottom: 12px;
    transform: translateX(-50%);
    border: 0;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    padding: 6px 12px;
    background: var(--md-sys-color-inverse-surface, light-dark(#322f35, #e6e0e9));
    color: var(--md-sys-color-inverse-on-surface, light-dark(#f5eff7, #322f35));
    font: inherit;
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    font-weight: 600;
    cursor: pointer;
  }
  .jump:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    outline-offset: 2px;
  }
  .held {
    margin-top: 8px;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-family: var(--md-sys-typescale-body-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
  }
`;
