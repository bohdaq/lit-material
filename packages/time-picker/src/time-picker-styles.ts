import { css } from "lit";

export const styles = css`
  :host {
    display: contents;
  }

  .dialog {
    margin: 0;
    padding: 0;
    border: none;
    width: 100%;
    height: 100%;
    max-width: 100%;
    max-height: 100%;
    background: transparent;
    color: inherit;
  }

  .dialog[open] {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dialog::backdrop {
    background-color: rgba(0, 0, 0, 0.32);
  }

  .container {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    box-sizing: border-box;
    width: min(328px, calc(100vw - 48px));
    padding-block: 16px;
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    box-shadow: var(--md-sys-elevation-level3, 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15));
    /* Not part of the tab order (see the component for why it's the default
       focus target) — no visible focus indicator of its own. */
    outline: none;
  }

  .label {
    padding-inline: 24px;
    padding-block-end: 12px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
  }

  .time-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding-inline: 24px;
    padding-block-end: 20px;
  }

  .field {
    box-sizing: border-box;
    width: 96px;
    height: 72px;
    border: none;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    cursor: pointer;
    font-family: inherit;
    font-size: 2.25rem;
    line-height: 1;
    text-align: center;
    -webkit-appearance: none;
    appearance: none;
  }

  .field.active {
    background-color: var(--md-sys-color-primary-container, #eaddff);
    color: var(--md-sys-color-primary, #6750a4);
  }

  .field:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  .colon {
    font-size: 2.25rem;
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  .period-toggle {
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin-inline-start: 8px;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-small, 8px);
    overflow: hidden;
  }

  .period {
    box-sizing: border-box;
    width: 52px;
    height: 36px;
    border: none;
    background-color: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .period + .period {
    border-block-start: 1px solid var(--md-sys-color-outline, #79747e);
  }

  .period.selected {
    background-color: var(--md-sys-color-tertiary-container, #ffd8e4);
    color: var(--md-sys-color-on-tertiary-container, #31111d);
  }

  .period:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: -3px;
  }

  .dial-wrapper {
    display: flex;
    justify-content: center;
    padding-block-end: 20px;
  }

  .dial {
    position: relative;
    box-sizing: border-box;
    width: 256px;
    height: 256px;
    border-radius: 50%;
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
    touch-action: none;
    -webkit-tap-highlight-color: transparent;
  }

  .center-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 8px;
    height: 8px;
    margin: -4px;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary, #6750a4);
    pointer-events: none;
  }

  .selection-line {
    position: absolute;
    top: 50%;
    left: calc(50% - 1px);
    width: 2px;
    background-color: var(--md-sys-color-primary, #6750a4);
    transform-origin: top center;
    pointer-events: none;
  }

  .selection-dot {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 40px;
    height: 40px;
    margin: -20px;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary, #6750a4);
    pointer-events: none;
  }

  .dial-number {
    position: absolute;
    top: 50%;
    left: 50%;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin: -20px;
    border: none;
    border-radius: 50%;
    background-color: transparent;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    cursor: pointer;
    font-family: inherit;
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .dial-number.selected {
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  .dial-number:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 1px;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-inline: 24px;
    padding-block-start: 4px;
  }

  .text-button {
    box-sizing: border-box;
    height: 40px;
    padding-inline: 12px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: transparent;
    color: var(--md-sys-color-primary, #6750a4);
    cursor: pointer;
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
    -webkit-appearance: none;
    appearance: none;
  }

  .text-button:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 8%, transparent);
  }
`;
