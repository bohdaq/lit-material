import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    outline: none;
    vertical-align: top;
    width: 200px;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .slider {
    position: relative;
    display: flex;
    align-items: center;
    width: 100%;
    height: 40px;
    box-sizing: border-box;
  }

  .track {
    position: relative;
    width: 100%;
    height: 4px;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  .track-active {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    border-radius: inherit;
    background-color: var(--md-sys-color-primary, #6750a4);
  }

  :host([disabled]) .track-active {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  :host([disabled]) .track {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
  }

  .thumb-wrap {
    position: absolute;
    top: 50%;
    width: 40px;
    height: 40px;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  .thumb {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary, #6750a4);
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
  }

  :host([disabled]) .thumb {
    box-shadow: none;
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  .state-layer {
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--md-sys-color-primary, #6750a4);
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .slider:hover .state-layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);
  }

  .state-layer[data-pressed] {
    opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.1);
  }

  .focus-ring {
    position: absolute;
    inset: 2px;
    border-radius: 50%;
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
    pointer-events: none;
  }

  .focus-ring[hidden] {
    display: none;
  }

  .value-label {
    position: absolute;
    bottom: calc(100% + 8px);
    left: 50%;
    transform: translateX(-50%) scale(0.6);
    min-width: 24px;
    padding: 2px 8px;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    line-height: var(--md-sys-typescale-label-medium-line-height, 1rem);
    text-align: center;
    white-space: nowrap;
    opacity: 0;
    transition:
      opacity 100ms linear,
      transform 100ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .slider.interacting .value-label {
    opacity: 1;
    transform: translateX(-50%) scale(1);
  }

  .native-control {
    position: absolute;
    inset: 0;
    margin: 0;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    opacity: 0;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .native-control:disabled {
    cursor: default;
  }

  @media (prefers-reduced-motion: reduce) {
    .value-label,
    .state-layer {
      transition: none;
    }
  }
`;
