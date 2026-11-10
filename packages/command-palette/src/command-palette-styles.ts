import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  dialog {
    box-sizing: border-box;
    width: var(--lit-material-command-palette-width, min(640px, 100vw - 32px));
    max-width: none;
    margin: var(--lit-material-command-palette-top, 12vh) auto auto;
    padding: 0;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-extra-large, 16px);
    background: var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930));
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: 0.875rem;
    line-height: 1.25rem;
    box-shadow: 0 24px 80px rgb(0 0 0 / 0.45);
    overflow: hidden;
  }
  dialog:has(.with-preview) {
    width: var(--lit-material-command-palette-preview-width, min(960px, 100vw - 32px));
  }
  dialog::backdrop {
    background: rgb(0 0 0 / 0.5);
  }

  .field {
    display: flex;
    align-items: center;
    gap: 12px;
    height: 56px;
    padding: 0 16px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
  }
  .search {
    flex: none;
    width: 18px;
    height: 18px;
    fill: none;
    stroke: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    stroke-width: 1.8;
    stroke-linecap: round;
  }
  input {
    flex: 1;
    min-width: 0;
    height: 100%;
    border: 0;
    outline: 0;
    background: none;
    color: inherit;
    font: inherit;
    font-size: 1rem;
  }
  input::placeholder {
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }

  .body {
    display: flex;
    min-height: 0;
  }
  .list {
    flex: 1;
    min-width: 0;
    max-height: var(--lit-material-command-palette-max-height, min(60vh, 420px));
    overflow-y: auto;
    padding: 6px;
  }
  .preview {
    flex: 0 0 52%;
    min-width: 0;
    max-height: var(--lit-material-command-palette-max-height, min(60vh, 420px));
    overflow: auto;
    padding: 12px 16px;
    border-inline-start: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
  }
  @media (max-width: 719.98px) {
    .preview {
      display: none;
    }
    dialog:has(.with-preview) {
      width: var(--lit-material-command-palette-width, min(640px, 100vw - 32px));
    }
  }
  .method {
    flex: none;
    min-width: 3.25em;
  }
  .section {
    padding: 10px 10px 4px;
    font-size: 0.6875rem;
    font-weight: 600;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }
  .option {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    padding: 0 10px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    cursor: pointer;
  }
  .option[aria-selected="true"] {
    background: var(--md-sys-color-surface-container-highest, light-dark(#e6e0e9, #36343b));
    box-shadow: inset 2px 0 0 var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
  }
  .option[aria-disabled="true"] {
    opacity: 0.5;
    cursor: default;
  }
  .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  mark {
    background: none;
    color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    font-weight: 600;
  }
  .hint {
    flex: none;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-size: 0.75rem;
  }
  .keys {
    display: inline-flex;
    gap: 4px;
  }
  kbd {
    display: inline-block;
    min-width: 1.4em;
    padding: 0 5px;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-bottom-width: 2px;
    border-radius: 5px;
    font-family: ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
    font-size: 0.6875rem;
    line-height: 1.1rem;
    text-align: center;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }
  .empty {
    padding: 24px 10px;
    text-align: center;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }
  .footer {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    padding: 8px 16px;
    border-top: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    font-size: 0.75rem;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
  }
  .footer kbd {
    margin-inline-end: 2px;
  }

  @media (prefers-reduced-motion: no-preference) {
    dialog[open] {
      animation: enter 120ms ease-out;
    }
    @keyframes enter {
      from {
        opacity: 0;
        transform: translateY(-4px);
      }
    }
  }
`;
