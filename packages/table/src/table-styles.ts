import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 0;
  }
  .container {
    overflow: auto;
    max-height: inherit;
    height: 100%;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-large, 12px);
    background: var(--md-sys-color-surface, light-dark(#fef7ff, #141218));
  }
  .container:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    outline-offset: 2px;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }
  caption {
    caption-side: top;
    text-align: left;
    padding: 12px 16px 0;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
  }
  th,
  td {
    text-align: left;
    padding: 12px 16px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    vertical-align: middle;
  }
  :host([density="compact"]) th,
  :host([density="compact"]) td {
    padding: 6px 12px;
  }
  tbody tr:last-child td {
    border-bottom: 0;
  }
  th {
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    background: var(--md-sys-color-surface-container-low, light-dark(#f7f2fa, #1d1b20));
    font-weight: 600;
    white-space: nowrap;
  }
  :host([sticky-header]) th {
    position: sticky;
    top: 0;
    z-index: 1;
  }
  .num {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .mono {
    font-family: var(--lit-material-table-mono-font, ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace);
    overflow-wrap: anywhere;
  }
  .empty {
    padding: 24px 16px;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }
  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
`;
