import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    outline: none;
    vertical-align: top;
    -webkit-tap-highlight-color: transparent;
    --lit-material-rating-icon-size: 24px;
    --lit-material-rating-icon-color: var(--md-sys-color-primary, #6750a4);
    --lit-material-rating-icon-empty-color: var(--md-sys-color-outline-variant, #cac4d0);
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .rating {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  .icons {
    display: flex;
    gap: 4px;
    pointer-events: none;
  }

  .icon {
    position: relative;
    flex: none;
    width: var(--lit-material-rating-icon-size);
    height: var(--lit-material-rating-icon-size);
  }

  .icon-empty,
  .icon-fill svg {
    position: absolute;
    inset: 0;
    width: var(--lit-material-rating-icon-size);
    height: var(--lit-material-rating-icon-size);
  }

  .icon-empty path {
    fill: var(--lit-material-rating-icon-empty-color);
  }

  .icon-fill {
    position: absolute;
    inset-block: 0;
    inset-inline-start: 0;
    overflow: hidden;
    width: 0;
  }

  .icon-fill path {
    fill: var(--lit-material-rating-icon-color);
  }

  :host([disabled]) .icon-empty path {
    fill: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
  }

  :host([disabled]) .icon-fill path {
    fill: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
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

  /* Even though it's invisible, an unstyled native thumb still has real
     layout size, and browsers reserve click-to-value mapping margin for it
     at each end of the track — clicking near an edge would otherwise snap
     disproportionately toward min/max instead of matching the hover
     preview's plain linear position. Shrinking the thumb to negligible size
     removes that dead zone. */
  .native-control::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 1px;
    height: 100%;
  }

  .native-control::-moz-range-thumb {
    width: 1px;
    height: 100%;
    border: none;
  }

  .focus-ring {
    position: absolute;
    inset: -4px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
    pointer-events: none;
  }

  .focus-ring[hidden] {
    display: none;
  }
`;
