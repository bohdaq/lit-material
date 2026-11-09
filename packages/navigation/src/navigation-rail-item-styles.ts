import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  :host([hidden]) {
    display: none;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  .item {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    box-sizing: border-box;
    width: 100%;
    min-height: 56px;
    padding-block: 4px;
    border: none;
    margin: 0;
    background-color: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    cursor: pointer;
    text-decoration: none;
    font-family: var(--md-sys-typescale-label-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-medium-size, 0.75rem);
    font-weight: var(--md-sys-typescale-label-medium-weight, 500);
    -webkit-appearance: none;
    appearance: none;
  }

  .item:disabled,
  .item[aria-disabled="true"] {
    cursor: default;
  }

  :host([selected]) .item {
    color: var(--md-sys-color-on-surface, #1c1b1f);
  }

  .icon-container {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 32px;
    border-radius: var(--md-sys-shape-corner-full, 16px);
    transition: background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([selected]) .icon-container {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
  }

  slot.icon::slotted(*) {
    display: block;
    width: 24px;
    height: 24px;
  }

  slot.badge::slotted(*) {
    position: absolute;
    top: -4px;
    inset-inline-end: 8px;
  }

  .label {
    max-width: 100%;
    overflow: hidden;
    text-align: center;
    text-overflow: ellipsis;
    white-space: nowrap;
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

  .item:hover .state-layer {
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

  :host([disabled]) .item {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .icon-container,
    .state-layer {
      transition: none;
    }
  }

  /* Compact (icon-only) rail: a 40px square target, the label as a tooltip. */
  :host([compact]) .item {
    min-height: 44px;
    padding-block: 2px;
  }

  :host([compact]) .icon-container {
    width: 40px;
    height: 40px;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  :host([compact]) slot.badge::slotted(*) {
    top: 2px;
    inset-inline-end: 2px;
  }

  :host([compact]) .label {
    position: absolute;
    top: 50%;
    inset-inline-start: calc(50% + 28px);
    z-index: 1;
    max-width: 16rem;
    padding: 4px 8px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background: var(--md-sys-color-inverse-surface, #313033);
    color: var(--md-sys-color-inverse-on-surface, #f4eff4);
    font-size: var(--md-sys-typescale-body-small-size, 0.75rem);
    line-height: 1rem;
    translate: 0 -50%;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  :host([compact]) .item:hover .label,
  :host([compact]:focus-within) .label {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    :host([compact]) .label {
      transition: none;
    }
  }
`;
