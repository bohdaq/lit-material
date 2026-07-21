import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    flex: 1;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  :host(:last-of-type) .connector {
    display: none;
  }

  .step {
    position: relative;
    display: flex;
    flex: 1;
    align-items: center;
    box-sizing: border-box;
    min-height: 48px;
    margin: 0;
    padding: 8px 4px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: start;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .step:disabled {
    cursor: default;
  }

  .state-layer {
    position: absolute;
    inset: 0;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .step:hover .state-layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);
  }

  .state-layer[data-pressed] {
    opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.1);
  }

  .focus-ring {
    position: absolute;
    inset: 2px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
    pointer-events: none;
  }

  .focus-ring[hidden] {
    display: none;
  }

  .circle {
    position: relative;
    z-index: 1;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    line-height: 1;
    transition:
      background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([active]) .circle {
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  :host([completed]) .circle {
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  :host([error]) .circle {
    background-color: var(--md-sys-color-error, #b3261e);
    color: var(--md-sys-color-on-error, #ffffff);
  }

  .icon {
    width: 14px;
    height: 14px;
  }

  .icon path,
  .icon line {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .connector {
    flex: 1;
    height: 1px;
    min-width: 16px;
    margin-inline: 8px;
    background-color: var(--md-sys-color-outline-variant, #cac4d0);
    transition: background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([completed]) .connector {
    background-color: var(--md-sys-color-primary, #6750a4);
  }

  .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
  }

  :host([active]) .label {
    color: var(--md-sys-color-primary, #6750a4);
    font-weight: var(--md-sys-typescale-label-large-weight-prominent, 700);
  }

  :host([error]) .label {
    color: var(--md-sys-color-error, #b3261e);
  }

  .description {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-body-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    line-height: var(--md-sys-typescale-body-small-line-height, 1rem);
  }

  .description:empty,
  slot[name="description"]:empty {
    display: none;
  }

  :host([disabled]) .circle {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  :host([disabled]) .label {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  /* Horizontal (default): steps in a row, circle+connector above the text. */
  :host(:not([orientation="vertical"])) .step {
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  :host(:not([orientation="vertical"])) .row {
    display: flex;
    align-items: center;
    align-self: stretch;
  }

  :host(:not([orientation="vertical"])) .text {
    align-items: center;
    text-align: center;
  }

  /* Vertical: steps in a column, circle+connector to the left of the text. */
  :host([orientation="vertical"]) {
    flex: none;
    flex-direction: column;
  }

  :host([orientation="vertical"]) .step {
    flex-direction: row;
    align-items: flex-start;
    gap: 12px;
  }

  :host([orientation="vertical"]) .row {
    display: flex;
    flex-direction: column;
    align-items: center;
    align-self: stretch;
  }

  :host([orientation="vertical"]) .connector {
    width: 1px;
    height: 100%;
    min-width: 0;
    min-height: 16px;
    margin: 4px 0;
  }

  :host([orientation="vertical"]) .text {
    padding-block-start: 2px;
  }

  @media (prefers-reduced-motion: reduce) {
    .circle,
    .connector,
    .state-layer {
      transition: none;
    }
  }
`;
