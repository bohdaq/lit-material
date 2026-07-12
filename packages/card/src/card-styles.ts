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

  .card {
    position: relative;
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 16px;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    text-align: start;
    text-decoration: none;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    transition:
      box-shadow 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .card.interactive {
    border: none;
    margin: 0;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .card.interactive:disabled,
  .card.interactive[aria-disabled="true"] {
    cursor: default;
  }

  /* Elevated: surface-colored container that floats above the page via shadow. */
  .card.elevated {
    background-color: var(--md-sys-color-surface-container-low, #f7f2fa);
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .card.elevated.interactive:hover {
    box-shadow: var(--md-sys-elevation-level2, 0 1px 3px rgba(0, 0, 0, 0.3));
  }

  /* Filled: solid surface container, no border or shadow. */
  .card.filled {
    background-color: var(--md-sys-color-surface-container-highest, #e6e0e9);
  }

  /* Outlined: transparent surface with a visible border. */
  .card.outlined {
    background-color: var(--md-sys-color-surface, #fffbfe);
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .card.outlined.interactive {
    border: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
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

  .card.interactive:hover .state-layer {
    opacity: var(--md-sys-state-hover-state-layer-opacity, 0.08);
  }

  .state-layer[data-pressed] {
    opacity: var(--md-sys-state-pressed-state-layer-opacity, 0.1);
  }

  .focus-ring {
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    outline: 3px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
    pointer-events: none;
  }

  .focus-ring[hidden] {
    display: none;
  }

  /* Disabled: dim uniformly, drop elevation/state feedback. */
  :host([disabled]) .card {
    box-shadow: none;
  }

  :host([disabled]) .card.elevated {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
  }

  :host([disabled]) .card {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .card,
    .state-layer {
      transition: none;
    }
  }
`;
