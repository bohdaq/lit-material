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

  .checkbox {
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

  .checkbox:hover .state-layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);
  }

  .state-layer[data-pressed] {
    opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.1);
  }

  .checkbox.checked .state-layer,
  .checkbox.indeterminate .state-layer {
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

  .box {
    fill: transparent;
    stroke: var(--md-sys-color-on-surface-variant, #79747e);
    stroke-width: 2;
    transition:
      fill 100ms linear,
      stroke 100ms linear;
  }

  .mark-check {
    fill: none;
    stroke: var(--md-sys-color-on-primary, #ffffff);
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .mark-indeterminate {
    fill: var(--md-sys-color-on-primary, #ffffff);
  }

  .checkbox.checked .box,
  .checkbox.indeterminate .box {
    fill: var(--md-sys-color-primary, #6750a4);
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

  /* Error: red outline (unchecked) or red fill (checked/indeterminate). */
  :host([error]) .box {
    stroke: var(--md-sys-color-error, #b3261e);
  }

  :host([error]) .checkbox.checked .box,
  :host([error]) .checkbox.indeterminate .box {
    fill: var(--md-sys-color-error, #b3261e);
    stroke: var(--md-sys-color-error, #b3261e);
  }

  :host([error]) .checkbox.checked .state-layer,
  :host([error]) .checkbox.indeterminate .state-layer {
    color: var(--md-sys-color-error, #b3261e);
  }

  /* Disabled: dim the box; unchecked keeps an outline, checked/indeterminate a filled swatch. */
  :host([disabled]) .box {
    opacity: 0.38;
  }

  :host([disabled]) .checkbox.checked .box,
  :host([disabled]) .checkbox.indeterminate .box {
    fill: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
    stroke: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    .box,
    .state-layer {
      transition: none;
    }
  }
`;
