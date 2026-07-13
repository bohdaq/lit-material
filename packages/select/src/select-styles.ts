import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    outline: none;
    vertical-align: top;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .select {
    display: flex;
    flex-direction: column;
    width: 100%;
    min-width: 210px;
  }

  .trigger {
    position: relative;
    display: flex;
    align-items: center;
    box-sizing: border-box;
    height: 56px;
    width: 100%;
    margin: 0;
    padding-inline: 16px;
    border: none;
    cursor: pointer;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    text-align: start;
    -webkit-appearance: none;
    appearance: none;
    transition:
      border-color 100ms linear,
      background-color 100ms linear;
  }

  .trigger:disabled {
    cursor: default;
  }

  .label {
    position: absolute;
    inset-inline-start: 16px;
    top: 50%;
    transform: translateY(-50%);
    max-width: calc(100% - 48px);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 1rem);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
    transition:
      top 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      font-size 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .trigger.floated .label {
    top: 8px;
    transform: translateY(0);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    line-height: var(--md-sys-typescale-label-medium-line-height, 1rem);
  }

  .trigger.focused .label {
    color: var(--md-sys-color-primary, #6750a4);
  }

  .value {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 1rem);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
  }

  .trigger.floated .value {
    align-self: flex-end;
    padding-bottom: 8px;
  }

  :host(:not([label])) .trigger .value,
  .trigger:not(.floated) .value {
    align-self: center;
  }

  .arrow {
    flex: none;
    width: 20px;
    height: 20px;
    margin-inline-start: 8px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    transition: transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .arrow path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .arrow.open {
    transform: rotate(180deg);
  }

  /* Filled (default): solid surface container with a bottom active indicator. */
  :host([variant="filled"]) .trigger,
  :host(:not([variant])) .trigger {
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
    border-radius: var(--md-sys-shape-corner-extra-small, 4px) var(--md-sys-shape-corner-extra-small, 4px) 0 0;
  }

  :host([variant="filled"]) .trigger::after,
  :host(:not([variant])) .trigger::after {
    content: "";
    position: absolute;
    inset-inline: 0;
    bottom: 0;
    height: 1px;
    background-color: var(--md-sys-color-on-surface-variant, #49454f);
    transition: height 100ms linear, background-color 100ms linear;
  }

  :host([variant="filled"]) .trigger.focused::after,
  :host(:not([variant])) .trigger.focused::after {
    height: 2px;
    background-color: var(--md-sys-color-primary, #6750a4);
  }

  /* Outlined: transparent container with a full outline; the label notches it. */
  :host([variant="outlined"]) .trigger {
    background-color: transparent;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
  }

  :host([variant="outlined"]) .trigger.focused {
    border-color: var(--md-sys-color-primary, #6750a4);
    border-width: 2px;
  }

  :host([variant="outlined"]) .trigger.floated .label {
    top: 0;
    transform: translateY(-50%);
    padding-inline: 4px;
    margin-inline-start: -4px;
    background-color: var(--md-sys-color-surface, #fffbfe);
  }

  /* Error state. */
  :host([error]) .trigger.focused .label,
  :host([error]) .trigger .label {
    color: var(--md-sys-color-error, #b3261e);
  }

  :host([error]) .trigger::after {
    height: 2px;
    background-color: var(--md-sys-color-error, #b3261e);
  }

  :host([error][variant="outlined"]) .trigger,
  :host([error]:not([variant])) .trigger {
    border-color: var(--md-sys-color-error, #b3261e);
  }

  /* Disabled. */
  :host([disabled]) .trigger {
    opacity: 0.38;
  }

  /* Listbox popup. */
  .listbox {
    margin: 0;
    padding: 8px 0;
    border: none;
    box-sizing: border-box;
    max-height: min(400px, calc(100vh - 32px));
    overflow-y: auto;
    display: none;
    flex-direction: column;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    box-shadow: var(
      --md-sys-elevation-level2,
      0 1px 2px 0 rgba(0, 0, 0, 0.3),
      0 2px 6px 2px rgba(0, 0, 0, 0.15)
    );
  }

  .listbox:popover-open {
    display: flex;
  }

  /* Supporting text row. */
  .supporting {
    padding: 4px 16px 0;
    min-height: 1rem;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    line-height: var(--md-sys-typescale-label-medium-line-height, 1rem);
  }

  :host([error]) .supporting {
    color: var(--md-sys-color-error, #b3261e);
  }

  @media (prefers-reduced-motion: reduce) {
    .label,
    .trigger,
    .trigger::after,
    .arrow {
      transition: none;
    }
  }
`;
