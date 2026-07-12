import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    vertical-align: top;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .chip {
    position: relative;
    display: inline-flex;
    align-items: stretch;
    box-sizing: border-box;
    height: 32px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background-color: transparent;
    border: 1px solid var(--md-sys-color-outline, #79747e);
    color: var(--md-sys-color-on-surface-variant, #49454f);
    transition:
      background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      border-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .chip.elevated {
    border-color: transparent;
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
    box-shadow: var(--md-sys-elevation-1, 0 1px 2px 0 rgba(0, 0, 0, 0.3), 0 1px 3px 1px rgba(0, 0, 0, 0.15));
  }

  .chip.filter.selected {
    border-color: transparent;
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  :host([disabled]) .chip {
    opacity: 0.38;
    box-shadow: none;
  }

  .action {
    position: relative;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    height: 100%;
    padding-inline: 16px;
    margin: 0;
    border: none;
    background: transparent;
    text-decoration: none;
    cursor: pointer;
    color: inherit;
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
    border-radius: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .action:disabled,
  .action[aria-disabled="true"] {
    cursor: default;
  }

  .action:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: -2px;
  }

  .state-layer {
    position: absolute;
    inset: 0;
    border-radius: inherit;
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .action:hover .state-layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);
  }

  .state-layer[data-pressed] {
    opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.1);
  }

  .leading-icon ::slotted(*) {
    width: 18px;
    height: 18px;
    display: block;
    pointer-events: none;
  }

  .checkmark {
    width: 18px;
    height: 18px;
    flex: none;
    pointer-events: none;
  }

  .checkmark path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .label {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
  }

  .remove {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 24px;
    margin-inline: -8px 8px;
    padding: 0;
    border: none;
    background: transparent;
    border-radius: 50%;
    color: inherit;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .remove:disabled {
    cursor: default;
  }

  .remove:hover {
    background-color: color-mix(in srgb, currentColor 8%, transparent);
  }

  .remove:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: -1px;
  }

  .remove-icon {
    width: 14px;
    height: 14px;
    pointer-events: none;
  }

  .remove-icon path {
    fill: none;
    stroke: currentColor;
    stroke-width: 1.5;
    stroke-linecap: round;
  }

  @media (prefers-reduced-motion: reduce) {
    .chip,
    .state-layer {
      transition: none;
    }
  }
`;
