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

  .button {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    padding: 8px;
    border: none;
    border-radius: var(--md-sys-shape-corner-full, 9999px);
    background-color: transparent;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    -webkit-appearance: none;
    appearance: none;
    transition:
      box-shadow 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .button:disabled,
  .button[aria-disabled="true"] {
    cursor: default;
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

  .button:hover .state-layer {
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

  .icon ::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    pointer-events: none;
  }

  /* Standard (default): transparent container, on-surface-variant icon. */
  :host([variant="standard"]) .button,
  :host(:not([variant])) .button {
    background-color: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
  }

  /* Filled: solid primary container. */
  :host([variant="filled"]) .button {
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  /* Tonal: solid secondary container, lower emphasis than filled. */
  :host([variant="tonal"]) .button {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  /* Outlined: transparent container with a visible border. */
  :host([variant="outlined"]) .button {
    background-color: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    border: 1px solid var(--md-sys-color-outline, #79747e);
  }

  /* Toggle "on" state: the selected icon gains primary emphasis. */
  :host([toggle][selected][variant="standard"]) .button,
  :host([toggle][selected]:not([variant])) .button {
    color: var(--md-sys-color-primary, #6750a4);
  }

  :host([toggle][selected][variant="filled"]) .button {
    background-color: var(--md-sys-color-primary, #6750a4);
    color: var(--md-sys-color-on-primary, #ffffff);
  }

  :host([toggle][selected][variant="tonal"]) .button {
    background-color: var(--md-sys-color-secondary, #625b71);
    color: var(--md-sys-color-on-secondary, #ffffff);
  }

  :host([toggle][selected][variant="outlined"]) .button {
    color: var(--md-sys-color-primary, #6750a4);
  }

  /* Disabled: icon at on-surface 38%, container transparent (or 12% for filled/tonal). */
  :host([disabled]) .button {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
    box-shadow: none;
  }

  :host([variant="filled"][disabled]) .button,
  :host([variant="tonal"][disabled]) .button {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
  }

  :host([variant="outlined"][disabled]) .button {
    background-color: transparent;
    border-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .button,
    .state-layer {
      transition: none;
    }
  }
`;
