import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
  }

  :host([hidden]) {
    display: none;
  }

  lit-material-data-table-cell:focus-visible,
  .toggle:focus-visible,
  .select-box:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: -2px;
  }

  lit-material-data-table-cell:focus {
    outline-offset: -2px;
  }

  lit-material-data-table-row.group {
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
  }

  lit-material-data-table-row.group lit-material-data-table-cell {
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    min-height: 32px;
    border: none;
    margin: 0;
    padding-block: 0;
    padding-inline: 0 8px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
  }

  .toggle svg {
    flex: none;
    width: 24px;
    height: 24px;
    fill: currentColor;
    transition: transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .toggle[aria-expanded="true"] svg {
    transform: rotate(90deg);
  }

  :host(:dir(rtl)) .toggle[aria-expanded="false"] svg {
    transform: scaleX(-1);
  }

  .count {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-weight: normal;
  }

  .aggregate {
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .select-box {
    width: 18px;
    height: 18px;
    margin: 0;
    accent-color: var(--md-sys-color-primary, #6750a4);
  }

  .editor {
    flex: 1;
    min-width: 0;
  }

  .editor > * {
    width: 100%;
    --lit-material-text-field-min-width: 0;
    --lit-material-select-min-width: 0;
  }

  .empty {
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  lit-material-data-table-pagination {
    margin-block-start: 4px;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    margin: -1px;
    padding: 0;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .toggle svg {
      transition: none;
    }
  }
`;
