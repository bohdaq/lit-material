import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .color-picker {
    display: inline-flex;
  }

  .trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    box-sizing: border-box;
    height: 40px;
    margin: 0;
    padding-inline: 8px;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-full, 20px);
    background-color: transparent;
    cursor: pointer;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 1rem);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .trigger:disabled {
    cursor: default;
    opacity: 0.38;
  }

  .trigger:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 2px;
  }

  .swatch {
    flex: none;
    box-sizing: border-box;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    border: 1px solid var(--md-sys-color-outline, #79747e);
  }

  .swatch.empty {
    background-image:
      linear-gradient(45deg, var(--md-sys-color-outline-variant, #cac4d0) 25%, transparent 25%),
      linear-gradient(-45deg, var(--md-sys-color-outline-variant, #cac4d0) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--md-sys-color-outline-variant, #cac4d0) 75%),
      linear-gradient(-45deg, transparent 75%, var(--md-sys-color-outline-variant, #cac4d0) 75%);
    background-size: 8px 8px;
    background-position: 0 0, 0 4px, 4px -4px, -4px 0;
  }

  .label {
    padding-inline-end: 4px;
  }

  /* Popover panel. */
  .panel {
    margin: 0;
    padding: 12px;
    border: none;
    box-sizing: border-box;
    width: 232px;
    display: none;
    flex-direction: column;
    gap: 12px;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    box-shadow: var(
      --md-sys-elevation-level2,
      0 1px 2px 0 rgba(0, 0, 0, 0.3),
      0 2px 6px 2px rgba(0, 0, 0, 0.15)
    );
  }

  .panel:popover-open {
    display: flex;
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .preset {
    flex: none;
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    -webkit-appearance: none;
    appearance: none;
  }

  .preset:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 2px;
  }

  .preset.selected {
    border: 2px solid var(--md-sys-color-primary, #6750a4);
  }

  .checkmark {
    width: 16px;
    height: 16px;
    filter: drop-shadow(0 0 1px rgba(0, 0, 0, 0.7));
  }

  .checkmark path {
    fill: none;
    stroke: #fff;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .custom-row {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .custom-input {
    flex: none;
    box-sizing: border-box;
    width: 28px;
    height: 28px;
    padding: 0;
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
    border-radius: 50%;
    overflow: hidden;
    cursor: pointer;
    background: none;
    -webkit-appearance: none;
    appearance: none;
  }

  .custom-input::-webkit-color-swatch-wrapper {
    padding: 0;
  }

  .custom-input::-webkit-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .custom-input::-moz-color-swatch {
    border: none;
    border-radius: 50%;
  }

  .custom-input:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 2px;
  }

  .hex-input {
    flex: 1;
    min-width: 0;
    box-sizing: border-box;
    height: 32px;
    padding-inline: 8px;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: transparent;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }

  .hex-input:focus-visible {
    outline: 2px solid var(--md-sys-color-primary, #6750a4);
    outline-offset: 1px;
  }
`;
