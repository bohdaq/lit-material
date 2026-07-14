import { css } from "lit";

export const styles = css`
  :host {
    margin: 0;
    padding: 4px 8px;
    border: none;
    box-sizing: border-box;
    max-width: 240px;
    border-radius: var(--md-sys-shape-corner-extra-small, 4px);
    background-color: var(--md-sys-color-inverse-surface, #313033);
    color: var(--md-sys-color-inverse-on-surface, #f4eff4);
    font-family: var(--md-sys-typescale-body-medium-font, Roboto, system-ui, sans-serif);
    font-size: var(--md-sys-typescale-body-medium-size, 0.875rem);
    line-height: var(--md-sys-typescale-body-medium-line-height, 1.25rem);
    text-align: center;
    pointer-events: none;
    opacity: 0;
    transition: opacity 100ms var(--md-sys-motion-easing-standard, cubic-bezier(0.2, 0, 0, 1));
  }

  :host(:popover-open) {
    opacity: 1;
  }

  @media (prefers-reduced-motion: reduce) {
    :host {
      transition: none;
    }
  }
`;
