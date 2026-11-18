import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    --_accent: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    --_container: var(--md-sys-color-error-container, light-dark(#f9dedc, #8c1d18));
  }

  :host([hidden]) {
    display: none;
  }

  :host([variant="warning"]) {
    --_accent: var(--lit-material-error-card-warning-color, light-dark(#7a4d00, #ffb945));
    --_container: var(--lit-material-error-card-warning-container, light-dark(#ffe4b3, #5c3f00));
  }

  .card {
    display: flex;
    gap: 12px;
    box-sizing: border-box;
    padding: 12px 16px;
    border: 1px solid color-mix(in srgb, var(--_accent) 40%, transparent);
    border-inline-start-width: 4px;
    border-inline-start-color: var(--_accent);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background: color-mix(in srgb, var(--_container) 45%, var(--md-sys-color-surface, light-dark(#fef7ff, #141218)));
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  .icon {
    flex: none;
    width: 24px;
    height: 24px;
    color: var(--_accent);
  }

  .icon svg {
    display: block;
    width: 100%;
    height: 100%;
  }

  .main {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  .headline {
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-title-small-font, inherit);
    font-size: var(--md-sys-typescale-title-small-size, 0.875rem);
    font-weight: var(--md-sys-typescale-title-small-weight, 600);
    line-height: 1.5rem;
    overflow-wrap: anywhere;
  }

  .body {
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    text-wrap: pretty;
    overflow-wrap: anywhere;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
  }

  .body.empty,
  .actions.empty {
    display: none;
  }

  .details-row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-height: 40px;
  }

  .toggle,
  .copy {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-height: 32px;
    margin-inline-start: -8px;
    padding: 0 12px 0 4px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background: transparent;
    color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    font: inherit;
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
    cursor: pointer;
  }

  .copy {
    margin-inline-start: 0;
    padding: 0 12px 0 8px;
  }

  .copy-icon {
    display: inline-flex;
    width: 18px;
    height: 18px;
  }

  .copy-icon svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
  }

  .toggle:hover,
  .copy:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  .toggle:focus-visible,
  .copy:focus-visible {
    outline: var(--lit-material-focus-ring-width, 3px) solid var(--lit-material-focus-ring-color, var(--md-sys-color-secondary, #625b71));
    outline-offset: 2px;
  }

  .chevron {
    width: 20px;
    height: 20px;
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: rotate 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host(:dir(rtl)) .chevron {
    scale: -1 1;
  }

  :host([open]) .chevron {
    rotate: 90deg;
  }

  :host(:dir(rtl)[open]) .chevron {
    rotate: -90deg;
  }

  .details {
    max-height: var(--lit-material-error-card-details-max-height, 16rem);
    margin: 0;
    padding: 8px 12px;
    overflow: auto;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background: var(--md-sys-color-surface-container, light-dark(#f3edf7, #211f26));
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--lit-material-code-font, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    font-size: 0.8125rem;
    line-height: 1.25rem;
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }

  .details[hidden] {
    display: none;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }

  @media (prefers-reduced-motion: reduce) {
    .chevron {
      transition: none;
    }
  }
`;
