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

  .speed-dial {
    position: relative;
    display: inline-flex;
  }

  .trigger {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 56px;
    height: 56px;
    border: none;
    border-radius: var(--md-sys-shape-corner-large, 16px);
    background-color: var(--md-sys-color-primary-container, #eaddff);
    color: var(--md-sys-color-on-primary-container, #21005d);
    cursor: pointer;
    box-shadow: var(--md-sys-elevation-level3, 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15));
    -webkit-appearance: none;
    appearance: none;
    transition: box-shadow 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .trigger:hover {
    box-shadow: var(--md-sys-elevation-level4, 0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15));
  }

  slot[name="icon"]::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    pointer-events: none;
    transition: transform 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([open]) slot[name="icon"]::slotted(*) {
    transform: rotate(45deg);
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

  .trigger:hover .state-layer {
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

  :host([disabled]) .trigger {
    box-shadow: none;
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  /* Popover surface: just a positioning/stacking box — lit-material-speed-dial-action
     supplies its own visuals (mini-FAB + label pill). */
  .actions {
    margin: 0;
    padding: 0;
    border: none;
    display: none;
    box-sizing: border-box;
  }

  .actions:popover-open {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  :host([direction="up"]) .actions:popover-open {
    flex-direction: column-reverse;
  }

  @media (prefers-reduced-motion: reduce) {
    .trigger,
    .state-layer,
    slot[name="icon"]::slotted(*) {
      transition: none;
    }
  }
`;
