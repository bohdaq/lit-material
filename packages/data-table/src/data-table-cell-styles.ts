import { css } from "lit";

export const styles = css`
  :host {
    display: table-cell;
    box-sizing: border-box;
    padding: 12px 16px;
    vertical-align: middle;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    text-align: start;
  }

  :host([numeric]) {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  :host([header]) {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
    white-space: nowrap;
  }

  .content {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  :host([numeric]) .content {
    justify-content: flex-end;
  }

  /* Sortable header cells get a real <button> around their content (see the
     component) — an ARIA APG "sortable column header" pattern, rather than
     making the cell's own columnheader role itself the interactive target. */
  .sort-button {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    border: none;
    margin: 0;
    padding: 0;
    background: transparent;
    color: inherit;
    cursor: pointer;
    font: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .sort-button:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  .sort-icon {
    display: inline-block;
    width: 1em;
    font-size: 0.75em;
    opacity: 0;
  }

  :host([sort-direction="ascending"]) .sort-icon,
  :host([sort-direction="descending"]) .sort-icon {
    opacity: 1;
  }
`;
