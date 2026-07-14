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
    border: none;
    background-color: transparent;
    cursor: pointer;
    text-decoration: none;
    -webkit-appearance: none;
    appearance: none;
    box-shadow: var(
      --md-sys-elevation-level3,
      0 1px 3px 0 rgba(0, 0, 0, 0.3),
      0 4px 8px 3px rgba(0, 0, 0, 0.15)
    );
    transition:
      box-shadow 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1)),
      background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .button:hover {
    box-shadow: var(
      --md-sys-elevation-level4,
      0 2px 3px 0 rgba(0, 0, 0, 0.3),
      0 6px 10px 4px rgba(0, 0, 0, 0.15)
    );
  }

  .button:disabled,
  .button[aria-disabled="true"] {
    cursor: default;
  }

  /* Sizes: default (regular), small, large — see the component for the spec values. */
  :host(:not([size])) .button,
  :host([size="regular"]) .button {
    width: 56px;
    height: 56px;
    border-radius: var(--md-sys-shape-corner-large, 16px);
  }

  :host([size="small"]) .button {
    width: 40px;
    height: 40px;
    border-radius: var(--md-sys-shape-corner-medium, 12px);
  }

  :host([size="large"]) .button {
    width: 96px;
    height: 96px;
    border-radius: var(--md-sys-shape-corner-extra-large, 28px);
  }

  :host(:not([size])) .icon ::slotted(*),
  :host([size="regular"]) .icon ::slotted(*),
  :host([size="small"]) .icon ::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    pointer-events: none;
  }

  :host([size="large"]) .icon ::slotted(*) {
    width: 36px;
    height: 36px;
    display: block;
    pointer-events: none;
  }

  /* Extended: a pill-shaped, regular-height button with icon + label. Sizing
     attributes are irrelevant here (see the component docs) — extended is
     always regular-height per the MD3 spec. */
  :host([extended]) .button {
    width: auto;
    height: 56px;
    min-width: 80px;
    padding-inline: 16px 20px;
    border-radius: var(--md-sys-shape-corner-large, 16px);
    gap: 12px;
  }

  :host([extended]) .icon ::slotted(*) {
    width: 24px;
    height: 24px;
    display: block;
    pointer-events: none;
  }

  /* The label is always mounted (not conditionally rendered) so toggling
     "extended" can animate smoothly instead of popping in/out abruptly. */
  .label {
    display: block;
    max-width: 0;
    overflow: hidden;
    white-space: nowrap;
    font-family: var(--md-sys-typescale-label-large-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-large-size, 0.875rem);
    font-weight: var(--md-sys-typescale-label-large-weight, 500);
    transition: max-width 200ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host([extended]) .label {
    max-width: 200px;
  }

  /* Color variants: which container/on-container token pair fills the button. */
  :host(:not([color])) .button,
  :host([color="primary"]) .button {
    background-color: var(--md-sys-color-primary-container, #eaddff);
    color: var(--md-sys-color-on-primary-container, #21005d);
  }

  :host([color="secondary"]) .button {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  :host([color="tertiary"]) .button {
    background-color: var(--md-sys-color-tertiary-container, #ffd8e4);
    color: var(--md-sys-color-on-tertiary-container, #31111d);
  }

  :host([color="surface"]) .button {
    background-color: var(--md-sys-color-surface-container-high, #ece6f0);
    color: var(--md-sys-color-primary, #6750a4);
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

  /* Disabled: dim uniformly, drop elevation/state feedback — though MD3
     recommends FABs stay visible and enabled at all times; see the
     component docs. */
  :host([disabled]) .button {
    box-shadow: none;
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 12%, transparent);
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .button,
    .state-layer,
    .label {
      transition: none;
    }
  }
`;
