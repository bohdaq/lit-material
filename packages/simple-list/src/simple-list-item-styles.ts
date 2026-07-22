import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  .item {
    display: block;
    box-sizing: border-box;
    width: 100%;
    margin: 0;
    padding: 8px 16px;
    border: none;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: none;
    text-align: start;
    text-decoration: none;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    cursor: pointer;
  }

  .item:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .item:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: -2px;
  }

  .item[aria-current="true"] {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
    font-weight: var(--md-sys-typescale-body-medium-weight-prominent, 500);
  }

  .item[disabled] {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
    cursor: default;
    pointer-events: none;
  }
`;
