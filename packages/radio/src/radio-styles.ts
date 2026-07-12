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

  .radio {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    cursor: pointer;
    color: var(--md-sys-color-on-surface, #1c1b1f);
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

  .radio:hover .state-layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);
  }

  .state-layer[data-pressed] {
    opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.1);
  }

  .radio.checked .state-layer {
    color: var(--md-sys-color-primary, #6750a4);
  }

  .focus-ring {
    position: absolute;
    inset: 2px;
    border-radius: inherit;
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
    pointer-events: none;
  }

  .focus-ring[hidden] {
    display: none;
  }

  .icon {
    position: absolute;
    inset: 11px;
    width: 18px;
    height: 18px;
    pointer-events: none;
  }

  .ring {
    fill: none;
    stroke: var(--md-sys-color-on-surface-variant, #79747e);
    stroke-width: 2;
    transition: stroke 100ms linear;
  }

  .dot {
    fill: var(--md-sys-color-primary, #6750a4);
  }

  .radio.checked .ring {
    stroke: var(--md-sys-color-primary, #6750a4);
  }

  .native-control {
    position: absolute;
    inset: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    opacity: 0;
    cursor: inherit;
    -webkit-appearance: none;
    appearance: none;
  }

  .native-control:disabled {
    cursor: default;
  }

  /* Error: red outline, and a red dot when checked. */
  :host([error]) .ring {
    stroke: var(--md-sys-color-error, #b3261e);
  }

  :host([error]) .dot {
    fill: var(--md-sys-color-error, #b3261e);
  }

  :host([error]) .radio.checked .state-layer {
    color: var(--md-sys-color-error, #b3261e);
  }

  /* Disabled: dim the ring; the dot (if checked) gets a flat on-surface tint. */
  :host([disabled]) .ring {
    opacity: 0.38;
  }

  :host([disabled]) .dot {
    fill: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .ring,
    .state-layer {
      transition: none;
    }
  }
`;
