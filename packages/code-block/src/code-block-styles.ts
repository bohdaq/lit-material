import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .code-block {
    box-sizing: border-box;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    box-sizing: border-box;
    padding: 8px 12px;
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .label {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .copy {
    flex: none;
    box-sizing: border-box;
    margin: 0;
    padding: 4px 10px;
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: none;
    color: inherit;
    font: inherit;
    cursor: pointer;
  }

  .copy:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .copy:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 1px;
  }

  .pre {
    margin: 0;
    box-sizing: border-box;
    padding: 12px 16px;
    overflow-x: auto;
    font-family: var(--md-sys-typescale-code-font, "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    font-size: 0.875rem;
    line-height: 1.5;
    white-space: pre;
  }

  :host([expandable]:not([expanded])) .pre {
    max-height: 200px;
    overflow-y: hidden;
  }

  .expand-toggle {
    display: block;
    width: 100%;
    box-sizing: border-box;
    margin: 0;
    padding: 6px;
    border: none;
    border-top: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    background: none;
    color: var(--md-sys-color-primary, #6750a4);
    font: inherit;
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    cursor: pointer;
  }

  .expand-toggle:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .expand-toggle:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: -2px;
  }
`;
