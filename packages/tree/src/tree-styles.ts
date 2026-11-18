import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: block;
    outline: none;
  }

  :host([dragging]) {
    -webkit-user-select: none;
    user-select: none;
    cursor: grabbing;
  }

  :host([hidden]) {
    display: none;
  }

  .tree {
    display: flex;
    flex-direction: column;
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  .drop-line {
    position: absolute;
    inset-inline-end: 8px;
    height: 2px;
    border-radius: 1px;
    background: var(--lit-material-tree-drop-indicator-color, var(--md-sys-color-primary, #6750a4));
    pointer-events: none;
    z-index: 2;
  }

  .drop-line::before {
    content: "";
    position: absolute;
    inset-inline-start: -4px;
    top: -3px;
    width: 8px;
    height: 8px;
    box-sizing: border-box;
    border: 2px solid var(--lit-material-tree-drop-indicator-color, var(--md-sys-color-primary, #6750a4));
    border-radius: 50%;
    background: var(--md-sys-color-surface, #fef7ff);
  }

  .ghost {
    position: fixed;
    z-index: 1000;
    max-width: 280px;
    padding: 4px 12px;
    overflow: hidden;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: var(--md-sys-color-inverse-surface, #313033);
    color: var(--md-sys-color-inverse-on-surface, #f4eff4);
    box-shadow: var(--md-sys-elevation-level2, 0 2px 6px 2px rgb(0 0 0 / 0.15), 0 1px 2px rgb(0 0 0 / 0.3));
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    line-height: 1.5rem;
    white-space: nowrap;
    text-overflow: ellipsis;
    pointer-events: none;
  }

  .ghost.rtl {
    translate: -100% 0;
  }

  .drop-line[hidden],
  .ghost[hidden] {
    display: none;
  }
`;
