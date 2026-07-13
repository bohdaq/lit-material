import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    outline: none;
    -webkit-tap-highlight-color: transparent;
  }

  :host([disabled]) {
    pointer-events: none;
  }

  /* Semantic-only wrapper around an interactive item's real button/link element —
     no box model of its own, so it doesn't affect layout or the item's visual sizing. */
  .item-shell {
    display: contents;
  }

  :host([divider]) .item {
    border-bottom: 1px solid var(--md-sys-color-outline-variant, #cac4d0);
  }

  .item {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    box-sizing: border-box;
    width: 100%;
    min-height: 56px;
    padding: 8px 16px;
    border: none;
    margin: 0;
    background-color: transparent;
    color: var(--md-sys-color-on-surface, #1c1b1f);
    text-align: start;
    text-decoration: none;
    font-family: var(--md-sys-typescale-body-large-font, Roboto, system-ui, sans-serif);
    -webkit-appearance: none;
    appearance: none;
    transition: background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  .item.interactive {
    cursor: pointer;
  }

  .item.interactive:disabled,
  .item.interactive[aria-disabled="true"] {
    cursor: default;
  }

  .item.selected {
    background-color: var(--md-sys-color-secondary-container, #e8def8);
    color: var(--md-sys-color-on-secondary-container, #1d192b);
  }

  .state-layer {
    position: absolute;
    inset: 0;
    background-color: currentColor;
    opacity: 0;
    pointer-events: none;
    transition: opacity 100ms linear;
  }

  .item.interactive:hover .state-layer {
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

  .leading,
  .trailing {
    display: flex;
    align-items: center;
    flex: none;
    pointer-events: none;
  }

  .text {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .overline {
    display: block;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-label-small-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-label-small-size, 0.6875rem);
    line-height: var(--md-sys-typescale-label-small-line-height, 1rem);
  }

  .headline {
    display: block;
    color: inherit;
    font-size: var(--md-sys-typescale-body-large-size, 1rem);
    line-height: var(--md-sys-typescale-body-large-line-height, 1.5rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .supporting-text {
    display: block;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
  }

  /* Disabled: dim uniformly. */
  :host([disabled]) .item {
    color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 38%, transparent);
  }

  @media (prefers-reduced-motion: reduce) {
    .item,
    .state-layer {
      transition: none;
    }
  }
`;
