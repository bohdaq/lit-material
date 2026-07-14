import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex: 1;
    outline: none;
    vertical-align: top;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .tab {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    gap: 8px;
    box-sizing: border-box;
    width: 100%;
    min-width: 90px;
    height: 48px;
    padding-inline: 16px;
    border: none;
    margin: 0;
    background: transparent;
    cursor: pointer;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
    line-height: var(--md-sys-typescale-label-large-line-height, 1.25rem);
    -webkit-appearance: none;
    appearance: none;
    transition: color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  /* When an icon is slotted in, stack it above the label instead of beside it. */
  .tab:has(.icon ::slotted(*)) {
    flex-direction: column;
    justify-content: center;
    gap: 2px;
    height: 64px;
  }

  .tab:disabled {
    cursor: default;
  }

  :host([selected]) .tab {
    color: var(--md-sys-color-primary, #6750a4);
  }

  .state-layer {
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .tab:hover .state-layer {
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

  .icon ::slotted(*) {
    width: 18px;
    height: 18px;
    display: block;
  }

  .label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :host([disabled]) .tab {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .tab,
    .state-layer {
      transition: none;
    }
  }
`;
