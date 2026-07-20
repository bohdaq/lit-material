import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    width: 100%;
    max-width: 720px;
    outline: none;
    vertical-align: top;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .search-bar {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    height: 56px;
    padding-inline: 16px;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    box-shadow: var(--md-sys-elevation-level0, none);
  }

  .leading-icon,
  .trailing {
    display: inline-flex;
    align-items: center;
    flex: none;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  .leading-icon {
    margin-inline-end: 12px;
  }

  .trailing {
    margin-inline-start: 8px;
  }

  slot.leading-icon::slotted(*),
  slot.trailing::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
  }

  .leading-icon svg {
    width: 24px;
    height: 24px;
  }

  .input {
    flex: 1;
    min-width: 0;
    margin: 0;
    padding: 0;
    border: none;
    background: transparent;
    outline: none;
    color: inherit;
    font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .input::placeholder {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    opacity: 1;
  }

  /* Hide every browser's own decorations for type="search" — a custom
     .clear button (below) replaces them so the clear affordance looks and
     behaves the same across browsers. */
  .input::-webkit-search-cancel-button,
  .input::-webkit-search-decoration {
    display: none;
  }

  .clear {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 24px;
    height: 24px;
    margin-inline-start: 8px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 50%;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .clear:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .clear:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 1px;
  }

  .clear-icon {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  .clear-icon path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
  }

  :host([disabled]) .search-bar {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }
`;
