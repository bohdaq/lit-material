import { css } from "lit";

export const styles = css`
  :host {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 24px;
    box-sizing: border-box;
    padding: 0 16px;
    min-height: 52px;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
  }

  .page-size {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .page-size select {
    box-sizing: border-box;
    border: none;
    background: transparent;
    color: inherit;
    font: inherit;
    padding: 4px 24px 4px 4px;
    cursor: pointer;
  }

  .range {
    white-space: nowrap;
    font-variant-numeric: tabular-nums;
  }

  .controls {
    display: flex;
    align-items: center;
    gap: 4px;
  }

  button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: var(--md-sys-color-on-surface-variant, #49454f);
    cursor: pointer;
    font-size: 1.1rem;
    -webkit-appearance: none;
    appearance: none;
    transition: background-color 150ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  button:hover:not(:disabled) {
    background-color: color-mix(in srgb, var(--md-sys-color-on-surface, #1c1b1f) 8%, transparent);
  }

  button:focus-visible {
    outline: 2px solid var(--md-sys-color-secondary, #625b71);
    outline-offset: 2px;
  }

  button:disabled {
    color: var(--md-sys-color-on-surface, #1c1b1f);
    opacity: 0.38;
    cursor: default;
  }

  @media (prefers-reduced-motion: reduce) {
    button {
      transition: none;
    }
  }
`;
