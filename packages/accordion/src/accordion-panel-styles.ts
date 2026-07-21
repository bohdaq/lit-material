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

  .header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
    min-height: 56px;
    margin: 0;
    padding: 12px 16px;
    border: none;
    background: transparent;
    cursor: pointer;
    text-align: start;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-title-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-title-medium-size, 1rem);
    line-height: var(--md-sys-typescale-title-medium-line-height, 1.5rem);
    -webkit-appearance: none;
    appearance: none;
  }

  .header:disabled {
    cursor: default;
  }

  .state-layer {
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .header:hover .state-layer {
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

  .leading {
    display: flex;
    align-items: center;
    flex: none;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  slot[name="leading"]::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    pointer-events: none;
  }

  .label {
    flex: 1;
    min-width: 0;
  }

  .chevron {
    flex: none;
    width: 20px;
    height: 20px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    transition: transform 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .chevron path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  :host([expanded]) .chevron {
    transform: rotate(180deg);
  }

  /* Grid-rows trick: animates to/from the content's natural height without
     ever needing to measure it in JS, and without an auto-height CSS
     transition (which browsers don't support animating). */
  .region {
    display: grid;
    grid-template-rows: 0fr;
    transition: grid-template-rows 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([expanded]) .region {
    grid-template-rows: 1fr;
  }

  .content {
    overflow: hidden;
    min-height: 0;
  }

  .content-inner {
    padding: 0 16px 16px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  :host([divider]) {
    border-block-end: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  /* Disabled: dim uniformly, drop state feedback. */
  :host([disabled]) .header {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  :host([disabled]) .chevron {
    color: color-mix(in srgb, var(--md-sys-color-on-surface-variant, #49454f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .state-layer,
    .chevron,
    .region {
      transition: none;
    }
  }
`;
