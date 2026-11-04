import { css } from "lit";

export const styles = css`
  :host {
    --cal-slot-height: var(--lit-material-calendar-slot-height, 24px);
    --cal-height: var(--lit-material-calendar-height, 640px);
    --cal-gutter: 64px;
    --cal-chip: 20px;
    --cal-lane: 22px;
    --cal-day-label: 28px;
    --cal-outline: var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    --cal-muted: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    --cal-surface: var(--md-sys-color-surface, light-dark(#fef7ff, #141218));
    --cal-primary: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    --cal-on-primary: var(--md-sys-color-on-primary, light-dark(#ffffff, #381e72));
    display: block;
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }
  :host([hidden]) {
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
  button {
    font: inherit;
    color: inherit;
  }
  :focus-visible {
    outline: 2px solid var(--cal-primary);
    outline-offset: -2px;
  }

  /* Toolbar */
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 16px;
    padding-block-end: 12px;
  }
  .nav {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .title {
    flex: 1 1 auto;
    margin: 0;
    font-family: var(--md-sys-typescale-title-large-font, inherit);
    font-size: var(--md-sys-typescale-title-large-size, 1.375rem);
    font-weight: var(--md-sys-typescale-title-large-weight, 400);
    line-height: 1.3;
  }
  .today-button {
    block-size: 40px;
    padding-inline: 16px;
    border: 1px solid var(--md-sys-color-outline, light-dark(#79747e, #938f99));
    border-radius: var(--md-sys-shape-corner-full, 20px);
    background: none;
    color: var(--cal-primary);
    font-weight: 500;
    cursor: pointer;
  }
  .icon-button {
    display: inline-grid;
    place-items: center;
    inline-size: 40px;
    block-size: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: none;
    color: var(--cal-muted);
    cursor: pointer;
  }
  .today-button:hover,
  .icon-button:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }
  .nav-icon {
    inline-size: 24px;
    block-size: 24px;
    fill: currentColor;
  }
  :host(:dir(rtl)) .nav-icon {
    transform: scaleX(-1);
  }

  /* Event chips */
  .event {
    --c: var(--event-color, var(--cal-primary));
    display: flex;
    align-items: baseline;
    gap: 4px;
    box-sizing: border-box;
    margin: 0;
    padding: 0 6px;
    border: none;
    border-inline-start: 3px solid var(--c);
    border-radius: 4px;
    background: color-mix(in srgb, var(--c) 18%, var(--cal-surface));
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    line-height: var(--cal-chip);
    text-align: start;
    white-space: nowrap;
    overflow: hidden;
    cursor: pointer;
  }
  .event.editable {
    touch-action: none;
  }
  .event:hover,
  .event:focus-visible {
    z-index: 2;
    background: color-mix(in srgb, var(--c) 30%, var(--cal-surface));
  }
  .event.dragging {
    opacity: 0.8;
    box-shadow: var(--md-sys-elevation-level2, 0 1px 2px rgba(0, 0, 0, 0.3), 0 2px 6px 2px rgba(0, 0, 0, 0.15));
    z-index: 2;
  }
  .event.continues-before {
    border-start-start-radius: 0;
    border-end-start-radius: 0;
  }
  .event.continues-after {
    border-start-end-radius: 0;
    border-end-end-radius: 0;
  }
  .event-title {
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 500;
  }
  .time {
    color: var(--cal-muted);
    font-variant-numeric: tabular-nums;
  }
  /* Times read in their own direction ("9:00 AM" stays put in a right-to-left page). */
  .time,
  .agenda-time,
  .time-label span {
    unicode-bidi: plaintext;
  }

  /* Month */
  .month {
    border: 1px solid var(--cal-outline);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }
  .row {
    display: grid;
  }
  .month .row {
    grid-template-columns: repeat(7, minmax(0, 1fr));
  }
  .weekday {
    padding: 8px 4px;
    color: var(--cal-muted);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    font-weight: 500;
    text-align: center;
  }
  .day {
    position: relative;
    box-sizing: border-box;
    min-block-size: calc(var(--cal-day-label) + (var(--max-lanes) + 1) * var(--cal-lane) + 4px);
    border-block-start: 1px solid var(--cal-outline);
    border-inline-start: 1px solid var(--cal-outline);
    cursor: pointer;
  }
  .day:first-child {
    border-inline-start-color: transparent;
  }
  .day.outside {
    background: color-mix(in srgb, var(--cal-outline) 18%, transparent);
  }
  .day.outside .day-number {
    color: var(--cal-muted);
  }
  .day-number {
    display: inline-grid;
    place-items: center;
    min-inline-size: 24px;
    block-size: 24px;
    margin: 2px;
    border-radius: 12px;
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    font-weight: 500;
  }
  .today .day-number,
  .day-header.today .date-number {
    background: var(--cal-primary);
    color: var(--cal-on-primary);
  }
  .month .event {
    position: absolute;
    z-index: 1;
    inset-block-start: calc(var(--cal-day-label) + var(--lane) * var(--cal-lane));
    inset-inline-start: 2px;
    inline-size: calc(var(--span) * (100% + 1px) - 5px);
    block-size: var(--cal-chip);
  }
  .month .event.timed {
    border-inline-start-width: 0;
    background: none;
  }
  .month .event.timed::before {
    content: "";
    flex: none;
    align-self: center;
    inline-size: 8px;
    block-size: 8px;
    border-radius: 50%;
    background: var(--c);
  }
  .month .event.timed:hover,
  .month .event.timed:focus-visible {
    background: color-mix(in srgb, var(--c) 14%, var(--cal-surface));
  }
  .more {
    position: absolute;
    inset-block-start: calc(var(--cal-day-label) + var(--max-lanes) * var(--cal-lane));
    inset-inline-start: 2px;
    padding: 0 6px;
    border: none;
    border-radius: 4px;
    background: none;
    color: var(--cal-muted);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    font-weight: 500;
    line-height: var(--cal-chip);
    cursor: pointer;
  }
  .more:hover {
    background: color-mix(in srgb, currentColor 8%, transparent);
  }

  /* Week and day */
  .time-grid {
    position: relative;
    max-block-size: var(--cal-height);
    overflow: auto;
    border: 1px solid var(--cal-outline);
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    overscroll-behavior: contain;
  }
  .time-grid .row {
    grid-template-columns: var(--cal-gutter) repeat(var(--days), minmax(0, 1fr));
  }
  .head {
    position: sticky;
    inset-block-start: 0;
    z-index: 3;
    background: var(--cal-surface);
    border-block-end: 1px solid var(--cal-outline);
  }
  .day-header {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    padding-block: 6px;
    border-inline-start: 1px solid var(--cal-outline);
  }
  .day-header .weekday {
    padding: 0;
  }
  .date-number {
    display: inline-grid;
    place-items: center;
    min-inline-size: 32px;
    block-size: 32px;
    border-radius: 16px;
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    font-weight: 500;
  }
  .time-label {
    position: relative;
    padding-inline: 4px 8px;
    color: var(--cal-muted);
    font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
    text-align: end;
    line-height: 1;
  }
  .slot-row .time-label span[aria-hidden] {
    position: relative;
    inset-block-start: -0.5em;
  }
  .slot-row:first-child .time-label span[aria-hidden] {
    inset-block-start: 0;
  }
  .all-day-label {
    align-self: center;
  }
  .cell {
    position: relative;
    box-sizing: border-box;
    border-inline-start: 1px solid var(--cal-outline);
    cursor: pointer;
  }
  .all-day-cell {
    min-block-size: calc(var(--lanes) * var(--cal-lane) + 6px);
  }
  .all-day-cell .event {
    position: absolute;
    z-index: 1;
    inset-block-start: calc(2px + var(--lane) * var(--cal-lane));
    inset-inline-start: 2px;
    inline-size: calc(var(--span) * (100% + 1px) - 5px);
    block-size: var(--cal-chip);
  }
  .slot {
    block-size: var(--cal-slot-height);
    border-block-start: 1px dotted color-mix(in srgb, var(--cal-outline) 70%, transparent);
  }
  .hour .slot {
    border-block-start: 1px solid var(--cal-outline);
  }
  .slot-row:first-child .slot {
    border-block-start-color: transparent;
  }
  .slot.selected {
    background: color-mix(in srgb, var(--cal-primary) 16%, transparent);
  }
  .timed-block {
    position: absolute;
    z-index: 1;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
    inset-block-start: calc(var(--offset) * var(--cal-slot-height));
    block-size: max(12px, calc(var(--length) * var(--cal-slot-height) - 2px));
    inset-inline-start: calc(2px + var(--col) * (100% - 8px) / var(--cols));
    inline-size: calc((100% - 8px) / var(--cols) - 2px);
    padding-block: 2px;
    white-space: normal;
    line-height: 1.25;
  }
  .timed-block .event-title,
  .timed-block .time {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .timed-block.short {
    flex-direction: row;
    padding-block: 0;
    gap: 4px;
  }
  .resize {
    position: absolute;
    inset-inline: 0;
    inset-block-end: 0;
    block-size: 6px;
    cursor: ns-resize;
  }
  .now {
    position: absolute;
    z-index: 2;
    inset-inline: 0;
    inset-block-start: calc(var(--offset) * var(--cal-slot-height));
    border-block-start: 2px solid var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
    pointer-events: none;
  }

  /* Agenda */
  .agenda {
    display: grid;
    gap: 8px;
  }
  .agenda-day {
    display: grid;
    grid-template-columns: 9rem minmax(0, 1fr);
    gap: 8px;
    padding-block: 8px;
    border-block-start: 1px solid var(--cal-outline);
  }
  .agenda-date {
    margin: 0;
    font-size: var(--md-sys-typescale-title-small-size, 0.875rem);
    font-weight: 500;
    line-height: 2rem;
  }
  .agenda-day.today .agenda-date {
    color: var(--cal-primary);
  }
  .agenda ul {
    display: grid;
    gap: 2px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .agenda-event {
    inline-size: 100%;
    align-items: center;
    gap: 12px;
    padding: 6px 8px;
    border-inline-start: none;
    background: none;
    font-size: inherit;
    line-height: 1.4;
  }
  .agenda-event:hover,
  .agenda-event:focus-visible {
    background: color-mix(in srgb, var(--c) 12%, var(--cal-surface));
  }
  .agenda-time {
    flex: none;
    min-inline-size: 9rem;
    color: var(--cal-muted);
    font-variant-numeric: tabular-nums;
  }
  .dot {
    flex: none;
    inline-size: 10px;
    block-size: 10px;
    border-radius: 50%;
    background: var(--c);
  }
  .empty {
    margin: 0;
    padding: 24px;
    color: var(--cal-muted);
    text-align: center;
  }

  @media (max-width: 600px) {
    .agenda-day {
      grid-template-columns: 1fr;
    }
    .agenda-time {
      min-inline-size: 6rem;
    }
    :host {
      --cal-gutter: 48px;
    }
  }

  @media (forced-colors: active) {
    .event {
      border: 1px solid CanvasText;
      border-inline-start-width: 3px;
    }
    .slot.selected {
      background: Highlight;
    }
    .today .day-number,
    .day-header.today .date-number {
      border: 1px solid CanvasText;
    }
  }
`;
