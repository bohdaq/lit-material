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
    max-height: calc(100vh - 48px);
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

  .header {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-inline: 24px;
    padding-block-end: 12px;
  }

  .label {
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
  }

  .headline {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-headline-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-headline-small-size, 1.5rem);
    line-height: var(--md-sys-typescale-headline-small-line-height, 2rem);
  }

  .nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-inline: 12px 24px;
    padding-block: 8px;
  }

  .year-range-label {
    padding-inline-start: 12px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
  }

  .nav-button,
  .month-year-button {
    box-sizing: border-box;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .nav-button:disabled {
    cursor: default;
    opacity: 0.38;
  }

  .nav-button:hover:not(:disabled),
  .month-year-button:hover {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .nav-button:focus-visible,
  .month-year-button:focus-visible,
  .day:focus-visible,
  .year:focus-visible,
  .text-button:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  .nav-button {
    width: 40px;
    height: 40px;
    font-size: 1.25rem;
  }

  .month-year-button {
    display: flex;
    align-items: center;
    gap: 4px;
    height: 40px;
    padding-inline: 12px;
    font-family: var(--md-sys-typescale-title-large-font, Roboto, system-ui, sans-serif);
    font-size: 1rem;
    font-weight: 500;
  }

  .month-year-button::after {
    content: "▾";
    font-size: 0.75rem;
  }

  .calendar {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
    padding-inline: 12px;
  }

  .calendar th {
    padding-block: 4px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
    font-weight: 500;
  }

  .day-cell {
    position: relative;
    text-align: center;
    /* No horizontal padding (unlike the single-date picker): adjacent
       in-range cells need to touch so the range highlight reads as one
       continuous band, not a row of separate rounded rectangles. */
    padding-block: 2px;
  }

  .day-cell.in-range {
    background-color: color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 12%, transparent);
  }

  .day-cell.range-start {
    border-start-start-radius: var(--md-sys-shape-corner-full, 9999px);
    border-end-start-radius: var(--md-sys-shape-corner-full, 9999px);
  }

  .day-cell.range-end {
    border-start-end-radius: var(--md-sys-shape-corner-full, 9999px);
    border-end-end-radius: var(--md-sys-shape-corner-full, 9999px);
  }

  .day {
    box-sizing: border-box;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: transparent;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    cursor: pointer;
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .day:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .day:disabled {
    cursor: default;
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  .day.today {
    color: var(--md-sys-color-primary, #6750a4);
  }

  .day.range-start,
  .day.range-end {
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  .year-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    max-height: 280px;
    padding-inline: 24px;
    padding-block: 8px;
    overflow-y: auto;
  }

  .year {
    box-sizing: border-box;
    height: 36px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: transparent;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    cursor: pointer;
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .year:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  .year:disabled {
    cursor: default;
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  .year.selected {
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    padding-inline: 24px;
    padding-block-start: 12px;
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

  .text-button:disabled {
    cursor: default;
    color: color-mix(in srgb, var(--md-sys-color-primary, #6750a4) 38%, transparent);
  }
`;
