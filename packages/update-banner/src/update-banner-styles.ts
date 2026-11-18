import { css } from "lit";

export const styles = css`
  :host {
    display: block;
  }

  :host([hidden]) {
    display: none;
  }

  :host([floating]) {
    position: fixed;
    inset-block-end: var(--lit-material-update-banner-inset, 16px);
    inset-inline-end: var(--lit-material-update-banner-inset, 16px);
    z-index: 30;
    max-width: calc(100vw - 2 * var(--lit-material-update-banner-inset, 16px));
  }

  .banner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
    box-sizing: border-box;
    min-height: 56px;
    padding-block: 8px;
    padding-inline: 16px 8px;
    border: 1px solid var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background: var(--md-sys-color-surface-container-high, light-dark(#ece6f0, #2b2930));
    color: var(--md-sys-color-on-surface, light-dark(#1d1b20, #e6e0e9));
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  :host([floating]) .banner {
    box-shadow: var(--md-sys-elevation-level3, 0 4px 8px 3px rgb(0 0 0 / 0.15), 0 1px 3px rgb(0 0 0 / 0.3));
  }

  .icon {
    display: inline-flex;
    flex: none;
    width: 20px;
    height: 20px;
    color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
  }

  .icon.error {
    color: var(--md-sys-color-error, light-dark(#b3261e, #f2b8b5));
  }

  .icon svg {
    width: 100%;
    height: 100%;
  }

  .message {
    flex: 1 1 12rem;
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .actions,
  .progress-wrap {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  progress {
    width: 8rem;
    height: 4px;
    border: none;
    border-radius: 2px;
    background: var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    accent-color: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
    appearance: none;
  }

  progress::-webkit-progress-bar {
    border-radius: 2px;
    background: var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
  }

  progress::-webkit-progress-value {
    border-radius: 2px;
    background: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
  }

  progress::-moz-progress-bar {
    border-radius: 2px;
    background: var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff));
  }

  /* No size known: a segment sliding along the track. */
  progress:indeterminate {
    background:
      linear-gradient(
          to right,
          transparent 0 35%,
          var(--md-sys-color-primary, light-dark(#6750a4, #d0bcff)) 35% 65%,
          transparent 65%
        )
        0 0 / 300% 100% no-repeat,
      var(--md-sys-color-outline-variant, light-dark(#cac4d0, #49454f));
    animation: lit-material-update-banner-slide 1.4s linear infinite;
  }

  progress:indeterminate::-webkit-progress-bar {
    background: transparent;
  }

  progress:indeterminate::-moz-progress-bar {
    background: transparent;
  }

  :host(:dir(rtl)) progress:indeterminate {
    animation-direction: reverse;
  }

  @keyframes lit-material-update-banner-slide {
    from {
      background-position: 100% 0, 0 0;
    }
    to {
      background-position: 0% 0, 0 0;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    progress:indeterminate {
      animation: none;
      background-position: 50% 0, 0 0;
    }
  }

  .percent {
    min-width: 3.5ch;
    color: var(--md-sys-color-on-surface-variant, light-dark(#49454f, #cac4d0));
    font-variant-numeric: tabular-nums;
  }
`;
