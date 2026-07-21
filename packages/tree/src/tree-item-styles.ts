import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .row {
    position: relative;
    display: flex;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    min-height: 40px;
    padding-inline-end: 12px;
    cursor: pointer;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
  }

  .row.selected {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  .state-layer {
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .row:hover .state-layer {
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
    outline-offset: -1px;
    pointer-events: none;
  }

  .focus-ring[hidden] {
    display: none;
  }

  .chevron {
    position: relative;
    z-index: 1;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 24px;
    height: 24px;
    margin: 0;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: transparent;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    -webkit-appearance: none;
    appearance: none;
  }

  .chevron.spacer {
    cursor: default;
  }

  .chevron-icon {
    width: 18px;
    height: 18px;
    transition: transform 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .chevron-icon path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  :host([expanded]) .chevron-icon {
    transform: rotate(90deg);
  }

  .leading {
    display: flex;
    flex: none;
    align-items: center;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  slot[name="leading"]::slotted(*) {
    width: 20px;
    height: 20px;
    display: block;
    pointer-events: none;
  }

  .label {
    position: relative;
    z-index: 1;
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    pointer-events: none;
  }

  .group[hidden] {
    display: none;
  }

  :host([disabled]) .row {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .state-layer,
    .chevron-icon {
      transition: none;
    }
  }
`;
