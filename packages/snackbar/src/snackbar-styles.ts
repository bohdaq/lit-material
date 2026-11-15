import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    /* Reset the popover's UA \`inset: 0\` (it pinned the snackbar to the top
       edge), then centre it at the bottom in either writing direction. */
    inset: auto;
    inset-block-end: var(--lit-material-snackbar-offset, 24px);
    inset-inline: 0;
    margin: 0 auto;
    width: fit-content;
    height: fit-content;
    padding-block: 6px;
    padding-inline: 16px 8px;
    border: none;
    box-sizing: border-box;
    display: none;
    align-items: center;
    gap: 8px;
    min-height: 48px;
    max-width: min(560px, calc(100vw - 32px));
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: var(--md-sys-color-inverse-surface, #313033);
    color: var(--md-sys-color-inverse-on-surface, #f4eff4);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    box-shadow: var(
      --md-sys-elevation-level3,
      0 1px 3px 0 rgba(0, 0, 0, 0.3),
      0 4px 8px 3px rgba(0, 0, 0, 0.15)
    );
  }

  :host(:popover-open) {
    display: flex;
  }

  .content {
    flex: 1;
    min-width: 0;
  }

  ::slotted([slot="action"]) {
    flex: none;
    color: var(--md-sys-color-inverse-primary, #d0bcff);
  }

  .close {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .close:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .close:focus-visible {
    outline: 2px solid var(--md-sys-color-inverse-primary, #d0bcff);
    outline-offset: -2px;
  }

  .close svg {
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  .close path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }
`;
