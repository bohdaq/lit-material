import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .label {
    padding: 6px 12px;
    border-radius: var(--md-sys-shape-corner-small, 8px);
    background-color: var(--md-sys-color-surface-container, #f3edf7);
    color: var(--md-sys-color-on-surface, #1c1b1f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
    white-space: nowrap;
    box-shadow: var(--md-sys-elevation-level1, 0 1px 2px rgba(0, 0, 0, 0.3));
  }

  .label:empty {
    display: none;
  }

  .action {
    position: relative;
    display: inline-flex;
    flex: none;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
    color: var(--md-sys-color-primary, #6750a4);
    cursor: pointer;
    box-shadow: var(--md-sys-elevation-level3, 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 4px 8px 3px rgba(0, 0, 0, 0.15));
    -webkit-appearance: none;
    appearance: none;
    transition: box-shadow 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .action:hover {
    box-shadow: var(--md-sys-elevation-level4, 0 2px 3px 0 rgba(0, 0, 0, 0.3), 0 6px 10px 4px rgba(0, 0, 0, 0.15));
  }

  .action:disabled {
    cursor: default;
  }

  slot[name="icon"]::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    pointer-events: none;
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

  .action:hover .state-layer {
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

  :host([disabled]) .action {
    box-shadow: none;
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .action,
    .state-layer {
      transition: none;
    }
  }
`;
