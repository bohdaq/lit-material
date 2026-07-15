import { css } from "lit";

export const styles = css`
  :host {
    display: table-cell;
    position: relative;
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

  :host([flex]) {
    display: block;
    flex: 0 0 auto;
    min-width: 0;
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
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    vertical-align: middle;
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

  .resize-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    inset-inline-end: -4px;
    width: 8px;
    cursor: col-resize;
    touch-action: none;
    z-index: 1;
  }

  .resize-handle::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    inset-inline-start: 3px;
    width: 2px;
    background-color: var(--md-sys-color-outline-variant, #cac4d0);
    opacity: 0;
    transition: opacity 100ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .resize-handle:hover::after {
    opacity: 1;
    background-color: var(--md-sys-color-primary, #6750a4);
  }

  @media (prefers-reduced-motion: reduce) {
    .resize-handle::after {
      transition: none;
    }
  }
`;
