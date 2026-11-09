import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    vertical-align: baseline;
  }

  :host([hidden]) {
    display: none;
  }

  .keys {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    font-family: var(--lit-material-kbd-font, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    font-size: 0.75rem;
    line-height: 1rem;
    font-variant-numeric: tabular-nums;
    color: var(--lit-material-kbd-color, var(--md-sys-color-on-surface-variant, #49454f));
  }

  :host([size="medium"]) .keys {
    font-size: 0.875rem;
    line-height: 1.25rem;
  }

  .key {
    display: inline-block;
    box-sizing: border-box;
    min-width: 1.6em;
    padding: 0 0.35em;
    border: 1px solid var(--lit-material-kbd-border, var(--md-sys-color-outline-variant, #c4c7c5));
    border-bottom-width: 2px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: var(--lit-material-kbd-background, var(--md-sys-color-surface-container, #f3edf7));
    font: inherit;
    text-align: center;
  }

  .plus {
    opacity: 0.7;
  }

  .then {
    display: inline-block;
    width: 0.4em;
  }

  .label {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
    border: 0;
  }
`;
