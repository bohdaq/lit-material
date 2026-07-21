import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    position: relative;
    height: var(--lit-material-carousel-height, 220px);
  }

  .track {
    display: flex;
    align-items: stretch;
    gap: var(--lit-material-carousel-gap, 8px);
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    padding-inline: var(--lit-material-carousel-gap, 8px);
    overflow-x: auto;
    overscroll-behavior-inline: contain;
    scroll-snap-type: x mandatory;
    outline: none;
    /* Scroll-snap carousels conventionally hide the scrollbar — the nav
       buttons, drag/swipe, and keyboard arrows are the discoverable
       affordances instead. */
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .track::-webkit-scrollbar {
    display: none;
  }

  .nav-button {
    position: absolute;
    top: 50%;
    z-index: 1;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    margin-block-start: -20px;
    padding: 8px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
    transition: background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .nav-button.prev {
    inset-inline-start: 4px;
  }

  .nav-button.next {
    inset-inline-end: 4px;
  }

  .nav-button:hover:not(:disabled) {
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
  }

  .nav-button:focus-visible {
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  .nav-button:disabled {
    cursor: default;
    opacity: 0.38;
    box-shadow: none;
  }

  .nav-button svg {
    width: 100%;
    height: 100%;
    pointer-events: none;
  }

  .nav-button path {
    fill: none;
    stroke: currentColor;
    stroke-width: 2;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  @media (prefers-reduced-motion: reduce) {
    .nav-button {
      transition: none;
    }
  }
`;
